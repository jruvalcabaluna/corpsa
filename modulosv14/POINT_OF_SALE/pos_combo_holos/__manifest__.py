# -*- coding: utf-8 -*-
# Part of BrowseInfo. See LICENSE file for full copyright and licensing details.

{
    "name" : "POS Combo",
    "version" : "14.0.0.0",
    "category" : "Point of Sale",
    "depends" : ['base','sale','point_of_sale','web'],
    'summary': 'add Pos Combo',
    "description": """
    
    Purpose :- 
This Module allow us to add combo.
    """,
    "data": [
        'views/custom_pos_view.xml',
        'views/pos_assets_common.xml',
        'views/ProductTemplate.xml',
        'views/PosComboItem.xml',
        'views/Menu.xml',
    ],
    'qweb': [
        'static/src/xml/pos_bag_charges.xml',
        'static/src/xml/Chrome.xml',
        'static/src/xml/OrderLine.xml',
    ],
    "auto_install": False,
    "installable": True,
    "images":['static/description/Banner.png'],
}
