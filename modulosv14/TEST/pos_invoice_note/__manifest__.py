# -*- coding: utf-8 -*-
{
    'name': 'POS invoice note',
    'summary': """
    Add notes to POS orders and invoice.""" ,
    'description': """


=======================

This module allows you to add notes in pos orders and invoices.

""",
     
    'author': "odoozone",
    'website': 'http://odoozone.com/',
    
    'version': '14.0.0.1',
    'category': 'Point of Sale',
    'sequence': 6,
    
    'license': 'LGPL-3',
    
    'depends': ['point_of_sale'],
    'data': [
        'security/ir.model.access.csv',
        'views/views.xml',
        'views/templates.xml',

    ],
    'qweb': [
        'static/src/xml/pos.xml',
    ],
    
    'installable': True,
    'auto_install': False,
    'images': [
        'static/description/banner.gif',
        'static/description/icon.png',
        'static/description/image1.png',
        'static/description/image2.png',
        'static/description/image3.png',
        'static/description/image4.png',

    ],
}
