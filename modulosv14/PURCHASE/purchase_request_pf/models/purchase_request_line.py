    # Copyright 2018-2019 ForgeFlow, S.L.
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0)

from odoo import _, api, fields, models

class PurchaseRequestLine(models.Model):

    _inherit = "purchase.request.line"

    sequence = fields.Integer(string="Sequence")
