# -*- coding: utf-8 -*-

{
    'name': "Purchase Template PF",
    'version' : '14.0.1.0',
	'license' : 'OPL-1',
    'category': 'purchases',
    'sequence': 1,
    'description': """
	By creating custom quotation templates and custom behaviour for Pollo Feliz Base
    """,
    'depends': ['wedo_purchase_template'],
    'data': [
        'views/purchase_template_views.xml',
    ],
    'demo': [
    ],
}
