# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.
{
    "name": "HR Department Organization Chart",
    "summary": "Interactive organizational chart for Odoo departments",
    "version": "16.0.1.0.0",
    "category": "Human Resources",
    "license": "LGPL-3",
    "author": "Tuyen Fung",
    "maintainers": ["Thanhtuyen12"],
    "website": "https://github.com/Thanhtuyen12/widget-odoo",
    "price": 22.75,
    "currency": "EUR",
    "depends": ["hr"],
    "data": ["views/hr_department_views.xml"],
    # Add the "images" key once the real screenshots are ready:
    #   "images": [
    #       "images/main_screenshot.png",
    #       "images/main_1.png",
    #       "images/main_2.png",
    #   ],
    "assets": {
        "web.assets_backend": [
            "hr_department_org_chart/static/src/js/hr_department_org_chart.js",
            "hr_department_org_chart/static/src/xml/hr_department_org_chart.xml",
            "hr_department_org_chart/static/src/scss/hr_department_org_chart.scss",
        ],
    },
    "installable": True,
    "application": False,
}
