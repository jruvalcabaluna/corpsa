
from odoo import api, fields, models, _
from odoo.exceptions import ValidationError


class PurchaseOrderLine(models.Model):
    _inherit = "purchase.order.line"

    account_analytic_id = fields.Many2one('account.analytic.account', string='Cuenta Analítica',
                                          compute='set_account_analytic_id', store=True)

    @api.depends('product_id')
    def set_account_analytic_id(self):
        if self.order_id.account_analytic_id:
            self.account_analytic_id = self.order_id.account_analytic_id.id
        else:
            raise ValidationError('La Compra No Tiene Asociado Cuenta Analítica')
