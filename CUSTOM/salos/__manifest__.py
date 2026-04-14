# -*- coding: utf-8 -*-
{
    'name': "salos",
    'summary': """
        Salos""",
    'description': """
        Customs Salos
    """,
    'version': '1.0',
    'depends': [
                'purchase_last_price_info',
                # 'sale_order_type',
                ],
    'data': [
        'views/product_template_views.xml',
        'views/product_views.xml',
        'views/purchase_order_view.xml',
        'views/res_partner_views.xml',
        'views/stock_warehouse.xml',
        # 'report/report_sale_contract.xml',
        # 'report/sale_views.xml',
        # 'views/res_partner_views.xml',
        # 'views/res_partner_bank_views.xml',
        # 'views/sale_order_template_views.xml',
        # 'views/sale_order_views.xml',
    ],
    'qweb': [
    ],
}