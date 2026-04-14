
from odoo import _, api, fields, models

class AccountJournal(models.Model):
    _inherit = "account.journal"

    # payment_tipo_ids = fields.Many2many('account.payment.tipo', string='Allowed account tipos')


