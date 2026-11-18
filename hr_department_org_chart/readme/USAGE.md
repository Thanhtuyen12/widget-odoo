Usage
=====

The chart is available on every department.

#. Go to *Employees -> Configuration -> Departments*.
#. Open a department in form view.
#. Switch to the **Organization Chart** tab.

Reading the chart
-----------------

* The **parent departments** are stacked on top, from the highest level down to
  the direct parent.
* The **current department** is the highlighted box in the middle.
* The **sub-departments** are displayed underneath, one row per level.

Every box displays:

* the name of the department,
* the number of employees belonging to it,
* the name of its manager.

The background colour of the boxes depends on the depth in the hierarchy, so
you can immediately tell which level a department belongs to.

Expanding and collapsing
------------------------

* Click the round **+** button at the bottom of a box to reveal its direct
  sub-departments.
* Click the **-** button to collapse the branch again.

Only one branch per level can stay open: opening a new branch automatically
collapses the branch that was previously open at the same level.  This keeps
the chart compact and readable.

The chart is redrawn automatically when the browser window is resized.

Known limitation
----------------

The number of employees is read from the ``total_employee`` field of the
department, which only counts the employees directly attached to it (not the
employees of its sub-departments).
