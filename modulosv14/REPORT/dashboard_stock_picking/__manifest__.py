# -*- coding: utf-8 -*-
{
    'name': "Stock Dashboard",
    'summary': """
    Stock Dashboard
    """,
    'description': """
    User can easy view user name, stock picking
    """,
    'category': 'stock',
    'version': '0.2',
    'depends': ['contacts', 'base', 'sale', 'stock', 'sale_report_pf'],
    'data': [
        'security/security.xml',
        'security/ir.model.access.csv',
        'views/views.xml',
    ],
}
