# -*- coding: utf-8 -*-

{
    'name': 'Pos price checker FL',
    'version': '1.0',
    'category': 'Point of Sale',
    'sequence': 6,
    'summary': 'Allows customer to check product price extended.',
    'depends': ['point_of_sale'],
    'data': [
            'views/template.xml',
            'views/views.xml'
    ],
    'qweb': [
        'static/src/xml/pos.xml',
    ],
    'installable': True,
    'auto_install': False,
}
