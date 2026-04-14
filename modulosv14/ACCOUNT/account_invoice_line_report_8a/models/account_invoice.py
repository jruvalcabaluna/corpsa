
from odoo import _, api, fields, models


class AccountMove(models.Model):
    _inherit = "account.move"

    uuid_report = fields.Char(related="mx_cfdi_cfdi_uuid", store=True)