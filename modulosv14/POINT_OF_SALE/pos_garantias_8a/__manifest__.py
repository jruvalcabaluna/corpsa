# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.


{
    'name': 'Point of Sale Garantias 8a',
    'version': '1.0',
    'category': 'Sales/Point of Sale',
    'sequence': 6,
    'summary': 'Garantias 8a - Discounts by Date in the Point of Sale ',
    'description': """

This module allows the cashier to quickly give percentage-based
discount to a customer based in Date.

""",
    'depends': [
        'base','point_of_sale','web', 'product_brand'],
    'data': [
        'security/ir.model.access.csv',
        # 'views/pos_discount_date_views.xml',
        'views/pos_discount_date_templates.xml',
        'views/PosConfig.xml',
        'views/ProductBrand.xml'

    ],
    'qweb': [
        'static/src/xml/DiscountDateButton.xml',
        'static/src/xml/DateInputPopUp.xml',
    ],
    'installable': True,
}
