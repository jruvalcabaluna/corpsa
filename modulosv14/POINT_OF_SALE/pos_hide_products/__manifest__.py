# -*- coding: utf-8 -*-

{
    "name" : "POS Hide Products",
    "version" : "14.0.0.0",
    "category" : "Point of Sale",
    "depends" : ['point_of_sale'],
    'summary': 'POS Hide Products',
    "description": """
    POS Hide Products
    """,
    "data": [
        'views/product.xml',
        'views/assets.xml',
    ],
    'qweb': [
        'static/src/xml/product.xml',
        'static/src/xml/category.xml',
    ],
    "auto_install": False,
    "installable": True,
}
# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:
