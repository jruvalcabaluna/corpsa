# -*- coding: utf-8 -*-
# from odoo import api, fields, models
#
# class PosOrder(models.Model):
#     _inherit = 'pos.order'
#
#     product_return_id = fields.Many2one('product.product', string='Return Product', help='The product used to return in process of warranty.')
#     amount_warranty_discount = fields.Float(string='Amount Discount Warranty')
#     lot = fields.Char('Lot')
#     aut_code = fields.Char('Autorization Code', help="Autorization Code")
#     set_code = fields.Char('Set Code', help="Set Code")
#     inspect_code = fields.Char('Inspect Code', help="Inspect Code")
#     use_type = fields.Char('Use Type')
#     defective = fields.Char('Defective')
#     type_policy = fields.Char('Type Policy')