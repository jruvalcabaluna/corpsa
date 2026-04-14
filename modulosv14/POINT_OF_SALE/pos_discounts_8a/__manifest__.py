# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

{
    'name': 'Point of Sale Discounts 8a',
    'version': '1.0',
    'category': 'Sales/Point of Sale',
    'sequence': 6,
    'summary': 'Discouts 8a - Discounts by Group in the Point of Sale ',
    'description': """

This module allows the cashier to quickly give percentage-based
discount to a customer based in Group.

""",
    'depends': [
        'base','point_of_sale','pos_discount','web'],
    'data': [
        # 'views/pos_discount_date_views.xml',
        'views/custom_pos_view.xml'
    ],
    'qweb': [
        'static/src/xml/pos_discounts_8a.xml',
    ],
    'installable': True,
}
