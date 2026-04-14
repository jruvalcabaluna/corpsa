# Copyright 2016-2020 Tecnativa - Carlos Dauden
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import _, api, fields, models
from odoo.tools import float_round

class SaleOrder(models.Model):
    _inherit = "sale.order"

    # customer_risk_total = fields.Monetary(string='Total Risk', compute='_customer_risk_total')

    customer_risk_total = fields.Monetary(string='Total Risk', related='partner_id.risk_total')


    # @api.depends('partner_id')
    # def _customer_risk_total(self):
    #     if self.partner_id.id:
    #         self.customer_risk_total = self.partner_id.risk_total
    #     else:
    #         self.customer_risk_total = 0
    #
    # @api.depends('self.partner_id')
    # def _customer_risk_total(self):
    #     # self.ensure_one()
    #     for rec in self:
    #         if rec.partner_id.id:
    #             rec.customer_risk_total = self.partner_id.risk_total
    #         else:
    #             rec.customer_risk_total = 0