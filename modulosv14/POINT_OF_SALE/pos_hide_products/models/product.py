# -*- coding: utf-8 -*-

from odoo import fields, models, api, _

class ProductTemplate(models.Model):
    _inherit = 'product.template'

    pos_hide_product = fields.Boolean(string='Es Oculto')