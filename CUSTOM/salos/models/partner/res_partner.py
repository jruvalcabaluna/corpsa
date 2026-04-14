
from odoo import fields, models


class ResPartner(models.Model):
    _inherit = 'res.partner'

    commercial_name = fields.Char(string="Nombre Commercial", translate=True)
