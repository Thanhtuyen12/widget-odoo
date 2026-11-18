Usage
=====

*Employees -> Configuration -> Departments*, open a department, switch to the
**Organization Chart** tab.

Reading the chart
-----------------

* The **parent departments** are stacked on top, from the highest level down to
  the direct parent.
* The **current department** is the highlighted box in the middle.
* The **sub-departments** are displayed underneath, one row per level.

Every box displays the department name, its headcount and its manager.  Box
backgrounds rotate through six pastel shades by depth, so the level of a
department is obvious at a glance.

Expanding and collapsing
------------------------

* Click the round **+** button at the bottom of a box to reveal its direct
  sub-departments.
* Click the **-** button to fold the branch back up.

Only one branch per level stays open: opening a new branch folds away the
others at that level.  The connectors are redrawn automatically whenever a
branch is toggled or the browser window is resized.

Known limitation
----------------

The headcount comes from ``hr.department.total_employee``, which counts the
employees directly assigned to the department.  Employees belonging to
sub-departments are not rolled up into the parent figure.
