HR Department Organization Chart
================================

Interactive organizational chart for Odoo 16 departments.

The module adds an **Organization Chart** tab to every ``hr.department`` form.
It shows the chain of parent departments above, the department you are looking
at in the middle, and the collapsible tree of its sub-departments below.  Each
box displays the department name, its headcount and its manager.

See the `project README <https://github.com/Thanhtuyen12/widget-odoo>`_ for the
full documentation.

Installation
============

The module depends on the standard ``hr`` application of Odoo 16 and on nothing
else.

From the Odoo UI
----------------

#. Go to *Apps*.
#. Enable developer mode ( *Settings -> General -> Developer Mode* ).
#. Search for ``HR Department Organization Chart`` and click *Install*.

From the command line
---------------------

::

    odoo -d <your_database> -i hr_department_org_chart --stop-after-init

To update an existing installation::

    odoo -d <your_database> -u hr_department_org_chart --stop-after-init

Regenerate the web assets afterwards (*Apps -> Update Apps List*, then
*Upgrade* on the module).

Configuration
=============

None required.  The chart is added to the department form automatically.

Using the widget in your own view
---------------------------------

The chart is registered as an Odoo field widget named
``hr_department_org_chart``.  It renders the hierarchy around the record it is
attached to, so that record must be a department::

    <field name="child_ids" widget="hr_department_org_chart" readonly="1" nolabel="1"
           options="{'no_open': True}"/>

Permissions
------------

Departments are read with the rights of the current user.  A user without read
access sees an explicit message in the tab instead of an empty chart.

Known limitation
----------------

The headcount comes from ``hr.department.total_employee``, which counts the
employees directly assigned to the department.  Employees belonging to
sub-departments are not rolled up into the parent figure.

Bug Tracker
===========

`GitHub Issues <https://github.com/Thanhtuyen12/widget-odoo/issues>`_

Credits
=======

Author
------

* Tuyen Fung

Maintainers
-----------

* Thanhtuyen12
