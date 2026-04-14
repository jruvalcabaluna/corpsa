# -*- coding: utf-8 -*-

{
    "name" : "Pos Cash In Out - PF",
    "version" : "14.0.1.2",
    "category" : "Point of Sale",
    "depends" : ['base','sale','account','point_of_sale'],
    'summary': 'This app pos cash in out',
    "description": """
    This app pos cash in out
    """,
    "data": [
        'security/ir.model.access.csv',
        'views/custom_pos_view.xml',
    ],
    'qweb': [
        'static/src/xml/pos.xml',
    ],
    "auto_install": False,
    "installable": True,
    "live_test_url":"https://youtu.be/Juuhr2V95-A",
    "images":['static/description/Banner.png'],
}
# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:
