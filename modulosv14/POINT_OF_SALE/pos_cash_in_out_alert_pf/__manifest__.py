# -*- coding: utf-8 -*-

{
    "name" : "Pos Cash In Out Alert - PF",
    "version" : "14.0.1.3",
    "category" : "Point of Sale",
    "depends" : ['base','sale','account','point_of_sale'],
    "author": "BrowseInfo",
    'summary': 'This app pos cash in out',
    "description": """
    This apps helps seller to perform Cash In, Cash Out Operation from POS. 
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
    "images":['static/description/Banner.png'],
}
# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:
