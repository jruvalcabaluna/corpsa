# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

{
    'name': 'Point of Sale 8a extended',
    'version': '1.0',
    'category': 'Sales/Point of Sale',
    'sequence': 6,
    'summary': 'Garantias 8a - Discounts by Date in the Point of Sale extendido',
    'description': """

This module allows the cashier to quickly give percentage-based
discount to a customer based in Date.

""",
    'depends': ["base",
                "account",
                "point_of_sale", 
                "sale",
                "pos_8a_standard"],
    'data': [
        'views/sale_order_view.xml'
    ],
    'qweb': [
    ],
    'installable': True,
}
