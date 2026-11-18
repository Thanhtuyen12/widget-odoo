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
