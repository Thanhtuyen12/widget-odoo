/** @odoo-module **/

import { registry } from "@web/core/registry";
import {
    Component,
    onMounted,
    onWillStart,
    onWillUnmount,
    onWillUpdateProps,
    useRef,
    useState,
} from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

/**
 * Interactive organizational chart for ``hr.department``.
 *
 * The widget renders the hierarchy around the department currently opened:
 * the chain of ancestors above it and the (collapsible) tree of departments
 * below it.  Connectors between the boxes are drawn with plain SVG.
 */

const DEPARTMENT_FIELDS = ["name", "manager_id", "parent_id", "parent_path", "total_employee"];
const SEARCH_FIELDS = ["id", "name", "manager_id", "parent_id", "total_employee"];
const MAX_DEPTH = 20;
const LEVEL_COLORS = ["#e3f2fd", "#e8f5e9", "#fff3e0", "#f3e5f5", "#ffebee", "#f9f1ff"];
const CONNECTOR_COLOR = "#1565c0";
const CONNECTOR_BRANCH_COLOR = "#43a047";

export class HrDepartmentOrgChart extends Component {
    setup() {
        this.orm = useService("orm");
        this.rootRef = useRef("org_chart_root");
        this.chartRef = useRef("org_chart_container");

        this.state = useState({
            root: null,
            ancestors: [],
            expandedNodes: new Set(),
            visibleNodes: new Set(),
            isLoading: true,
            errorMessage: "",
        });

        this._rafId = null;
        this._resizeTimer = null;
        this._fontsReady = false;
        this._resizeObserver = null;
        this._onResize = () => {
            clearTimeout(this._resizeTimer);
            this._resizeTimer = setTimeout(() => this.scheduleDraw(), 200);
        };

        onWillStart(() => this.loadData());
        onMounted(() => {
            window.addEventListener("resize", this._onResize);
            this.scheduleDraw();
        });
        onWillUnmount(() => {
            window.removeEventListener("resize", this._onResize);
            clearTimeout(this._resizeTimer);
            if (this._rafId) {
                cancelAnimationFrame(this._rafId);
                this._rafId = null;
            }
            if (this._resizeObserver) {
                this._resizeObserver.disconnect();
                this._resizeObserver = null;
            }
        });
        onWillUpdateProps((nextProps) => {
            if (nextProps.record.data.id !== this.props.record.data.id) {
                this.loadData(nextProps);
            }
        });
    }

    // ------------------------------------------------------------------
    // Data loading
    // ------------------------------------------------------------------

    async loadData(props = this.props) {
        const rec = props.record.data;
        this.state.isLoading = true;
        this.state.errorMessage = "";

        try {
            const [dept] = await this.orm.read("hr.department", [rec.id], DEPARTMENT_FIELDS);
            if (!dept) {
                throw new Error("The department could not be found.");
            }

            const root = this._toNode(dept, 0);
            root.children = await this.buildFullTree(rec.id, 1);
            root.hasChildren = root.children.length > 0;

            this.state.ancestors = dept.parent_id?.[0]
                ? await this.loadAllAncestors(dept)
                : [];
            this.state.root = root;

            const expanded = new Set();
            if (root.hasChildren) {
                expanded.add(root.id);
            }
            this.state.expandedNodes = expanded;
            this.state.visibleNodes = new Set();
            this.updateVisibleNodes();
        } catch (error) {
            this.state.errorMessage = error?.data?.message || error?.message || String(error);
            this.state.root = null;
            this.state.ancestors = [];
        }

        this.state.isLoading = false;
        this.scheduleDraw();
    }

    _toNode(record, level) {
        return {
            id: record.id,
            name: record.name || "N/A",
            manager: record.manager_id?.[1] || "No manager",
            employees: record.total_employee || 0,
            level: level,
            children: [],
            hasChildren: false,
        };
    }

    /**
     * Load the whole subtree of ``id`` with a single request.
     *
     * ``parent_path`` is a stored field on ``hr.department`` (``_parent_store``
     * is enabled in the standard addon), so the descendants of a department can
     * be retrieved with one ``child_of`` search instead of one request per
     * node.  This keeps the widget responsive on large hierarchies.
     */
    async buildFullTree(id, level, depth = 0) {
        if (depth >= MAX_DEPTH) {
            return [];
        }
        const children = await this.orm.searchRead(
            "hr.department",
            [["id", "child_of", id]],
            SEARCH_FIELDS
        );
        if (!children.length) {
            return [];
        }

        // ``child_of`` also returns the department itself: drop it.
        const descendants = children.filter((child) => child.id !== id);
        const byParent = new Map();
        for (const child of descendants) {
            const parentId = child.parent_id?.[0];
            if (!byParent.has(parentId)) {
                byParent.set(parentId, []);
            }
            byParent.get(parentId).push(child);
        }

        const build = (parentId, currentLevel, currentDepth) => {
            if (currentDepth >= MAX_DEPTH) {
                return [];
            }
            const nodes = [];
            for (const child of byParent.get(parentId) || []) {
                const node = this._toNode(child, currentLevel);
                node.children = build(child.id, currentLevel + 1, currentDepth + 1);
                node.hasChildren = node.children.length > 0;
                nodes.push(node);
            }
            return nodes;
        };

        return build(id, level, depth);
    }

    /**
     * Load the chain of ancestors with a single request.
     *
     * ``parent_path`` holds the whole chain of ids (``1/7/12/``), so the
     * ancestors can be fetched at once instead of one request per level.
     * ``department`` is the record whose ancestors are requested; the last id
     * of its path is the record itself and is therefore skipped.
     */
    async loadAllAncestors(department) {
        const path = department.parent_path || "";
        const ids = path
            .split("/")
            .filter((part) => part !== "")
            .map((part) => parseInt(part, 10))
            .filter((part) => !isNaN(part));

        // The last id of the path is the department itself: skip it.
        const ancestorIds = ids.slice(0, -1);
        if (!ancestorIds.length) {
            return [];
        }

        const ancestors = await this.orm.searchRead(
            "hr.department",
            [["id", "in", ancestorIds]],
            ["id", "name", "manager_id", "total_employee"]
        );
        const byId = new Map(ancestors.map((record) => [record.id, record]));
        const chain = [];
        for (const ancestorId of ancestorIds) {
            const record = byId.get(ancestorId);
            if (record) {
                chain.push(this._toNode(record, 0));
            }
        }
        return chain;
    }

    // ------------------------------------------------------------------
    // Tree helpers
    // ------------------------------------------------------------------

    updateVisibleNodes() {
        const visible = new Set();
        const root = this.state.root;
        if (root) {
            visible.add(root.id);
            const walk = (node) => {
                if (!this.state.expandedNodes.has(node.id)) {
                    return;
                }
                for (const child of node.children || []) {
                    visible.add(child.id);
                    walk(child);
                }
            };
            walk(root);
        }
        this.state.visibleNodes = visible;
    }

    findNodeById(node, id) {
        if (!node) {
            return null;
        }
        if (node.id === id) {
            return node;
        }
        for (const child of node.children || []) {
            const found = this.findNodeById(child, id);
            if (found) {
                return found;
            }
        }
        return null;
    }

    getSiblings(node, targetId) {
        if (!node) {
            return [];
        }
        const children = node.children || [];
        if (children.some((child) => child.id === targetId)) {
            return children;
        }
        for (const child of children) {
            const found = this.getSiblings(child, targetId);
            if (found.length) {
                return found;
            }
        }
        return [];
    }

    collapseNodeAndDescendants(nodeId, expanded) {
        expanded.delete(nodeId);
        const node = this.findNodeById(this.state.root, nodeId);
        for (const child of node?.children || []) {
            this.collapseNodeAndDescendants(child.id, expanded);
        }
    }

    toggleNode(nodeId, event) {
        event.stopPropagation();

        const node = this.findNodeById(this.state.root, nodeId);
        if (!node || !node.hasChildren) {
            return;
        }

        const expanded = new Set(this.state.expandedNodes);
        if (!expanded.has(nodeId)) {
            // Opening a branch closes the other branches of the same level.
            for (const sibling of this.getSiblings(this.state.root, nodeId)) {
                if (sibling.id !== nodeId) {
                    this.collapseNodeAndDescendants(sibling.id, expanded);
                }
            }
            expanded.add(nodeId);
        } else {
            this.collapseNodeAndDescendants(nodeId, expanded);
        }

        this.state.expandedNodes = expanded;
        this.updateVisibleNodes();
        this.scheduleDraw();
    }

    // ------------------------------------------------------------------
    // Template helpers
    // ------------------------------------------------------------------

    get levels() {
        const levels = [];
        const walk = (node) => {
            for (const child of node?.children || []) {
                if (!this.state.visibleNodes.has(child.id)) {
                    continue;
                }
                if (!levels.includes(child.level)) {
                    levels.push(child.level);
                }
                walk(child);
            }
        };
        walk(this.state.root);
        return levels.sort((a, b) => a - b);
    }

    getNodesAtLevel(level) {
        const nodes = [];
        const walk = (node) => {
            for (const child of node?.children || []) {
                if (!this.state.visibleNodes.has(child.id)) {
                    continue;
                }
                if (child.level === level) {
                    nodes.push(child);
                }
                walk(child);
            }
        };
        walk(this.state.root);
        return nodes;
    }

    getColorForAbsoluteLevel(level) {
        return LEVEL_COLORS[(level - 1) % LEVEL_COLORS.length] || "#f5f5f5";
    }

    isExpanded(nodeId) {
        return this.state.expandedNodes.has(nodeId);
    }

    // ------------------------------------------------------------------
    // Connectors
    // ------------------------------------------------------------------

    scheduleDraw() {
        if (this._rafId) {
            cancelAnimationFrame(this._rafId);
        }
        this._rafId = requestAnimationFrame(() => {
            this._rafId = null;
            this.drawConnectors();
        });

        // The widget lives inside a notebook: the chart has no size until its
        // tab is selected.  Observe the container so the connectors are drawn
        // as soon as it becomes visible.
        this._observeContainer();

        // Wait for web fonts so the boxes reach their final size before drawing.
        if (!this._fontsReady && document.fonts?.ready) {
            this._fontsReady = true;
            document.fonts.ready.then(() => this.scheduleDraw());
        }
    }

    _observeContainer() {
        const container = this.chartRef.el;
        if (!container || this._resizeObserver) {
            return;
        }
        if (!window.ResizeObserver) {
            return;
        }
        this._resizeObserver = new ResizeObserver(() => {
            if (container.offsetWidth && container.offsetHeight) {
                this.scheduleDraw();
            }
        });
        this._resizeObserver.observe(container);
    }

    /**
     * All boxes live inside ``.o_org_chart_container`` which scrolls together
     * with its content, so the container rectangle is a stable origin for every
     * coordinate and no scroll compensation is needed.
     */
    drawConnectors() {
        const container = this.chartRef.el;
        if (!container) {
            return;
        }
        container.querySelectorAll(".o_connector_svg").forEach((el) => el.remove());

        const root = this.state.root;
        const rootBox = container.querySelector(".o_current_box");
        if (!root || !rootBox) {
            return;
        }

        const svg = this._createSvg(container);
        if (!svg) {
            return;
        }

        const originRect = container.getBoundingClientRect();
        const centerX = (box) => {
            const rect = box.getBoundingClientRect();
            return rect.left + rect.width / 2 - originRect.left;
        };
        const topY = (box) => box.getBoundingClientRect().top - originRect.top;
        const bottomY = (box) => box.getBoundingClientRect().bottom - originRect.top;

        // Vertical line between the ancestors and the current department.
        let previousBox = null;
        for (const ancestor of this.state.ancestors) {
            const box = container.querySelector(`.ancestor[data-id="${ancestor.id}"]`);
            if (previousBox && box) {
                this.drawVerticalLine(svg, previousBox, box, centerX, bottomY, topY, CONNECTOR_COLOR);
            }
            previousBox = box;
        }
        if (previousBox) {
            this.drawVerticalLine(svg, previousBox, rootBox, centerX, bottomY, topY, CONNECTOR_COLOR);
        }

        // Branches: one horizontal bar per expanded node.
        const drawBranch = (parentBox, parentNode) => {
            if (!this.isExpanded(parentNode.id)) {
                return;
            }
            const visibleChildren = (parentNode.children || []).filter((child) =>
                this.state.visibleNodes.has(child.id)
            );
            if (!visibleChildren.length) {
                return;
            }

            const childBoxes = visibleChildren
                .map((child) => container.querySelector(`.o_dept_box[data-id="${child.id}"]`))
                .filter(Boolean);
            if (!childBoxes.length) {
                return;
            }
            childBoxes.sort(
                (a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left
            );

            const parentMidX = centerX(parentBox);
            const parentBottomY = bottomY(parentBox);
            const horizontalY = topY(childBoxes[0]) - 30;

            // Vertical segment from the parent down to the horizontal bar.
            this.createLine(svg, parentMidX, parentBottomY, parentMidX, horizontalY, CONNECTOR_COLOR);

            // Horizontal bar spanning every visible child.
            const leftX = centerX(childBoxes[0]);
            const rightX = centerX(childBoxes[childBoxes.length - 1]);
            this.createLine(svg, leftX, horizontalY, rightX, horizontalY, CONNECTOR_BRANCH_COLOR);

            // Vertical stub from every child up to the bar.
            for (const box of childBoxes) {
                const x = centerX(box);
                const y = topY(box);
                this.createLine(svg, x, y, x, horizontalY, CONNECTOR_BRANCH_COLOR);
            }

            for (const childNode of visibleChildren) {
                const childBox = container.querySelector(`.o_dept_box[data-id="${childNode.id}"]`);
                if (childBox) {
                    drawBranch(childBox, childNode);
                }
            }
        };

        drawBranch(rootBox, root);
    }

    _createSvg(container) {
        // The SVG is absolutely positioned, so it does not take part in the
        // layout: the canvas is sized from the boxes themselves to avoid
        // feeding the container's own size back into the resize observer.
        const width = this._contentWidth(container);
        const height = this._contentHeight(container);
        if (!width || !height) {
            return null;
        }

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.classList.add("o_connector_svg");
        svg.setAttribute("width", width);
        svg.setAttribute("height", height);
        svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
        svg.style.position = "absolute";
        svg.style.left = "0px";
        svg.style.top = "0px";
        svg.style.pointerEvents = "none";
        svg.style.zIndex = "1";
        container.appendChild(svg);
        return svg;
    }

    _contentWidth(container) {
        const origin = container.getBoundingClientRect().left;
        let width = 0;
        for (const box of container.querySelectorAll(".o_dept_box, .o_current_box")) {
            const rect = box.getBoundingClientRect();
            width = Math.max(width, rect.right - origin);
        }
        return Math.ceil(width);
    }

    _contentHeight(container) {
        const origin = container.getBoundingClientRect().top;
        let height = 0;
        for (const box of container.querySelectorAll(".o_dept_box, .o_current_box")) {
            const rect = box.getBoundingClientRect();
            height = Math.max(height, rect.bottom - origin);
        }
        return Math.ceil(height);
    }

    createLine(svg, x1, y1, x2, y2, color) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
        line.setAttribute("stroke", color);
        line.setAttribute("stroke-width", "3");
        line.setAttribute("stroke-linecap", "round");
        svg.appendChild(line);
    }

    drawVerticalLine(svg, from, to, centerX, bottomY, topY, color) {
        const x = centerX(from);
        const y1 = bottomY(from);
        const y2 = topY(to);
        if (y2 > y1) {
            this.createLine(svg, x, y1, x, y2, color);
        }
    }
}

HrDepartmentOrgChart.template = "hr_department_org_chart.HrDepartmentOrgChart";

registry.category("fields").add("hr_department_org_chart", HrDepartmentOrgChart);
