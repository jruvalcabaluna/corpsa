
from odoo import fields, models

class SaleOrder(models.Model):
    _inherit = "sale.order"

    user_code = fields.Char(string='Suc Code',
                               store=True,
                               related='user_id.user_code')