# -*- coding: utf-8 -*-

{
    'name': 'MRP Customs PF',
    'summary': """MRP Customs PF""",
    'version': '14.0.1.0.0',
    'category': 'Manufacturing',
    'depends': ['mrp'],
    'license': 'AGPL-3',
    'data': [
        'views/product_template.xml',
        'report/mrp_report_views.xml',
        'report/report_mrporder_vcocina.xml',
    ],
    'demo': [],
    'images': ['static/description/banner.png'],
    'installable': True,
    'auto_install': False,
}
