# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import api, fields, models


class PosConfig(models.Model):
    _inherit = 'pos.config'

    iface_discount_date = fields.Boolean(string='Order Date Discounts', help='Allow the cashier to give discounts on the whole order.')
    discount_date_pc = fields.Float(string='Discount Date Percentage', help='The default discount percentage', default=10.0)
    discount_date_pc_purchase = fields.Date(string='Date Purchase', help='The default discount percentage')
    return_product_id = fields.Many2one('product.product', string='Garantia Product', help='The product used to model the warranty or adjustment.')
    charges_category_id = fields.Many2one('product.category','Catagoria Cargos')

    # discount_date_product_id = fields.Many2one('product.product', string='Product')