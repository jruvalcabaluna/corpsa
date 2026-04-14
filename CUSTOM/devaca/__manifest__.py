# -*- coding: utf-8 -*-
{
    'name': "devaca",
    'summary': """
        DEVACA""",
    'description': """
        Customs DEVACA
    """,
    'version': '1.0',
    'depends': [
            'account',
            'sale_commission',
            'sale_margin',
                ],
    'data': [
        'views/account_move_views.xml',
        # 'views/sale_order_views.xml',
    ],
    'qweb': [
    ],
}