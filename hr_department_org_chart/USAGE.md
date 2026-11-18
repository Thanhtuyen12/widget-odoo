# Usage guide — HR Department Organization Chart

**Module:** `hr_department_org_chart` · **Version:** Odoo 16.0 · **License:** LGPL-3

---

## 1. Opening the chart

*Employees → Configuration → Departments*, open a department, switch to the
**Organization Chart** tab.

The tab is split in three parts:

| Position | Content |
|---|---|
| Above | The chain of parent departments, from the root down to the immediate parent |
| Middle | The department you have open, with a highlighted border |
| Below | The tree of sub-departments, one row per level |

Each box carries three pieces of information:

| Information | Source field |
|---|---|
| Department name | `name` |
| Headcount | `total_employee` |
| Manager | `manager_id` |

Box backgrounds rotate through six pastel shades by depth, so the level of a
department is obvious without reading the labels.

## 2. Expanding and collapsing

- Click the round **+** button at the bottom of a box to reveal its direct
  sub-departments.
- Click the **−** button to fold the branch back up.

Only one branch per level stays open: opening a new one folds the others at
that level away. Wide organisations therefore stay readable.

The buttons are keyboard accessible and carry an `aria-label` for screen
readers.

## 3. Connectors

The lines between boxes are drawn in SVG and recomputed whenever:

- a branch is expanded or collapsed,
- the browser window is resized,
- the web fonts finish loading.

The connectors therefore always meet the boxes exactly, with no drift.

## 4. Reading the headcount

`total_employee` counts the employees assigned **directly** to the department.
It does not aggregate the headcount of sub-departments.

## 5. Permissions

Departments are read with the rights of the current user. Internal users have
read access to `hr.department` by default, so the chart works without any
extra configuration. A user with no access sees an explicit message in the tab
instead of an empty chart.

## 6. Multi-company

Supported. Departments follow the standard record rules, so each user sees the
hierarchy they are allowed to read.

## 7. Existing organizational chart addons

If another addon already adds an organizational chart tab to the department
form, both tabs are shown. Deactivate the one you do not need in
*Settings → Technical → User Interface → Views*.

`hr_department_org_chart` does not depend on and does not modify any other
module, so the two can be installed side by side.
