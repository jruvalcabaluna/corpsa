
from odoo import api, fields, models, _
# from odoo.exceptions import ValidationError


class PurchaseOrder(models.Model):
    _inherit = 'purchase.order'

    account_analytic_id = fields.Many2one('account.analytic.account', string='Cuenta Analítica')

    @api.onchange('picking_type_id')
    def _onchange_picking_type_id(self):
        for rec in self:
            rec.account_analytic_id = rec.picking_type_id.warehouse_id.account_analytic_id
