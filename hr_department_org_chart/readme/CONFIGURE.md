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

Compatibility
-------------

The chart is attached to ``hr.department`` through the ``//group[@col='4']``
anchor instead of ``//sheet``, so it keeps working when another addon replaces
the form's sheet element.  If such an addon also adds its own organizational
chart tab, both tabs are shown; deactivate the one you do not need in
*Settings -> Technical -> User Interface -> Views*.
