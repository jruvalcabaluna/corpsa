# coding: utf-8

from odoo import api, fields, models, _


class ResPartner(models.Model):
    _inherit = 'res.partner'

    zip = fields.Char(required=False)
    property_account_position_id = fields.Many2one(required=False)
