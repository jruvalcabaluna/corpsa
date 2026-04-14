# -*- coding: utf-8 -*-
from odoo import api, fields, models, _

class PosConfig(models.Model):
    _inherit = "pos.config"

    discount_date = fields.Boolean('Active Global Discounts Date', default=0)
    discount_date_ids = fields.Many2many(
        'pos.global.discount.date',
        'config_discount_date_rel',
        'config_id',
        'discount_date_id',
        string='Global Discount Date Items'
    )