# -*- coding: utf-8 -*-
# Copyright 2020 WeDo Technology
# Website: http://wedotech-s.com
# Email: apps@wedotech-s.com 
# Phone:00249900034328 - 00249122005009

{
    'name': "Purchase Template",
    'version' : '14.0.1.0',
	'license' : 'OPL-1',
	'author': 'WeDo Technology',
	'support' : 'odoo.support@wedotech-s.com',
    'category': 'purchases',
    'sequence': 1,
    'website' : 'http://wedotech-s.com',
    'description': """
	By creating custom quotation templates, you will save a lot of time.
	Indeed, with the use of templates, you will be able to send complete quotations at a fast pace
    """,
    'depends': ['purchase'],
	'images': ['images/main_screenshot.png'],
    'data': [
        'security/ir.model.access.csv',
        'views/purchase_template_views.xml',
    ],
    'demo': [
    ],
}
