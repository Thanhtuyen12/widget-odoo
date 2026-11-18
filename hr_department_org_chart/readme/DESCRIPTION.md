HR Department Organization Chart
================================

Interactive organizational chart for Odoo departments.

The module adds a dedicated **Organization Chart** tab to every department
form.  It renders the whole hierarchy around the department you are looking at:

* the chain of **parent departments** above the current one,
* the current department highlighted in the middle,
* the **tree of sub-departments** below, collapsible level by level.

Each department box shows the department name, the number of employees and the
name of its manager.  Connectors are drawn with SVG and are automatically
recomputed when the chart is expanded, collapsed or the window is resized.

**Key features**

* Two-way hierarchy view: ancestors above, descendants below.
* Expand / collapse each branch with a single ``+`` / ``-`` button.
* Opening a branch automatically collapses the other branches of the same level
  to keep the chart readable.
* Colour coding by hierarchical level to make the depth easy to read.
* Fully generic: only relies on the standard ``hr.department`` fields
  (``name``, ``manager_id``, ``parent_id``, ``child_ids``, ``total_employee``).
* No configuration required.

**Supported versions**

Odoo 16.0.

**Credits**

* Author: Tuyen Fung
* License: LGPL-3
