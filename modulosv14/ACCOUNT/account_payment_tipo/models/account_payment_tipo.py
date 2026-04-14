
from odoo import _, api, fields, models

class AccountPaymentTipo(models.Model):

    _name = "account.payment.tipo"
    _description = "Payment Tipos"
    _order = "name"

    name = fields.Char(required=True, translate=True)
    percentage = fields.Float(string="Porcentaje")
    fixed_journal_id = fields.Many2one(
        "account.journal",
        string="Fixed Journal",
        domain=[("type", "=", "bank")],
        ondelete="restrict",
    )