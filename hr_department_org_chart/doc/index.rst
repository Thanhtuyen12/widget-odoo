.. _hr-department-org-chart:

HR Department Organization Chart
=================================

Interactive organizational chart for Odoo departments.

The module adds a dedicated **Organization Chart** tab to every department
form.  It renders the whole hierarchy around the department you are looking at:

* the chain of **parent departments** above the current one,
* the current department highlighted in the middle,
* the **tree of sub-departments** below, collapsible level by level.

Each department box shows the department name, the number of employees and the
name of its manager.  Connectors are drawn with SVG and are automatically
recomputed when the chart is expanded, collapsed or the window is resized.

**Supported versions**

Odoo 16.0.

**Credits**

* Author: Tuyen Fung
* License: LGPL-3
* Price: 22.75 EUR
* Source code: https://github.com/Thanhtuyen12/hr_department_org_chart

Installation
============

The module only depends on the standard ``hr`` application of Odoo 16, so no
extra dependency has to be installed.

From the Odoo UI
----------------

#. Go to *Apps*.
#. Activate the developer mode ( *Settings -> General -> Developer Mode* ).
#. Search for ``HR Department Organization Chart`` and click *Install*.

From the command line
---------------------

Add the module directory to your ``addons_path`` and run::

    odoo -d <your_database> -i hr_department_org_chart --stop-after-init

Updating
--------

::

    odoo -d <your_database> -u hr_department_org_chart --stop-after-init

.. note::
   Remember to regenerate the web assets after an update
   (*Apps -> Update Apps List*, then *Upgrade* on the module).

Configuration
=============

No configuration is required.  The module adds the chart automatically to the
department form.

Reusing the widget in your own view
------------------------------------

The chart is registered as an Odoo field widget named
``hr_department_org_chart``.  You can therefore display it on any
``hr.department`` relation, for example::

    <field name="child_ids" widget="hr_department_org_chart" readonly="1" nolabel="1"
           options="{'no_open': True}"/>

The widget renders the hierarchy around the record it is attached to, so the
record must be a department.

Permissions
------------

The widget reads the ``hr.department`` records with the rights of the current
user.  Users need at least read access on *Departments* (granted to every
internal user by default in Odoo).  If a user has no access at all, an explicit
warning message is displayed inside the tab instead of an empty chart.

.. note::
   If another module already adds its own organizational chart tab to the
   department form, you will see two tabs.  Simply deactivate the one you do
   not need.

Usage
=====

The chart is available on every department.

#. Go to *Employees -> Configuration -> Departments*.
#. Open a department in form view.
#. Switch to the **Organization Chart** tab.

Reading the chart
-----------------

* The **parent departments** are stacked on top, from the highest level down
  to the direct parent.
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

Bug Tracker
===========

Bugs are tracked on `GitHub Issues
<https://github.com/Thanhtuyen12/hr_department_org_chart/issues>`_.

Credits
=======

Author
------

* Tuyen Fung
