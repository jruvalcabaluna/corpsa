# -*- coding: utf-8 -*-
{
    "name" : "POS Lot Number Validate",
    "version" : "14.0.0.0",
    "category" : "Point of Sale",
    "depends" : ['base','point_of_sale','web'],
    'summary': 'POS Lot Number Validate',
    "description": """
    POS Lot Number Validate
    """,
    "data": [
        'views/pos_assets_common.xml',
    ],
    'qweb': [
        'static/src/xml/EditListInput.xml',
        'static/src/xml/NumberPopup.xml',
        'static/src/xml/WkLSAlertPopUp.xml',
    ],
    "auto_install": False,
    "installable": True,
}