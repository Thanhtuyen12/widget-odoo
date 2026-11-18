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
