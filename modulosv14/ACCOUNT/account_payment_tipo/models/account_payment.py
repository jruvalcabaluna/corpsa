
from odoo import _, api, fields, models

class AccountPayment(models.Model):
    _inherit = "account.payment"

    account_payment_tipo_id = fields.Many2one('account.payment.tipo', string="Tipo")
    percentage_tipo = fields.Float('Tipo Porcentaje', related='account_payment_tipo_id.percentage', store=True, readonly=True)