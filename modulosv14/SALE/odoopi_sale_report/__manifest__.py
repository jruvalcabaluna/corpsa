# -*- coding: utf-8 -*-
{
    'name': "Sale Dashboard",

    'summary': """
    Sale Dashboard With Graph
    """,

    'description': """
    ser can easy view user name, sale order, invoiced
                    sale
                    order, locked
                    sale order and cancelled sale order
    """,
    'category': 'sale',
    'version': '0.2',
    # any module necessary for this one to work correctly
    'depends': ['base', 'sale'],

    # always loaded
    'data': [
        'security/security.xml',
        'security/ir.model.access.csv',
        'views/views.xml',
        'views/templates.xml',
    ],
    'images': ['static/description/screen_1.png', 'static/description/screen_2.png',
               'static/description/screen_3.png',
               'static/description/screen_3.png'],
    # only loaded in demonstration mode
    # 'demo': [
    #     'demo/demo.xml',
    # ],
}
