# -*- coding: utf-8 -*-
{
    "name" : "POS Global Discount Based on Date",
    "version" : "14.0.0.0",
    "category" : "Point of Sale",
    "depends" : ['base','sale','point_of_sale','web', 'pos_retail'],
    'summary': 'add POS Global Discount Based on Date',
    "description": """
    
    Purpose :- 
This Module allow us to add POS Global Discount Based on Date.
    """,
    "data": [
        'import_libraries.xml',
        'views/PosConfig.xml',
        'views/PosGlobalDiscountDate.xml',
    ],
    'qweb': [
        "static/src/xml/Screens/ProductScreen/ControlButtons/*.xml",
        "static/src/xml/Screens/ProductScreen/*.xml",
        "static/src/xml/ButtonSetDiscountGlobalDate.xml",
    ],
    "auto_install": False,
    "installable": True,
    "images":['static/description/Banner.png'],
}