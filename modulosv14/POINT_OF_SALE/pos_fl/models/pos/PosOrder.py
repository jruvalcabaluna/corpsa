# -*- coding: utf-8 -*-
from odoo import api, fields, models, _

class PosOrder(models.Model):
    _inherit = "pos.order"

    doctor_id = fields.Many2one('res.partner', string='Doctor')