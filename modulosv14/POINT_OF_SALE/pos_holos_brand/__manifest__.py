# -*- coding: utf-8 -*-

{
    "name" : "POS holos Brand",
    "version" : "14.0.0.0",
    "category" : "Point of Sale",
    "depends" : ['base','sale','point_of_sale','web'],
    'summary': 'POS holos Brand',
    "description": """POS holos Brand""",
    "data": [
        'views/pos_assets_common.xml',
    ],
    'qweb': [
        'static/src/xml/Chrome.xml',
    ],
    "auto_install": False,
    "installable": True,
}
# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:
