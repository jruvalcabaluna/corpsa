
from odoo import api, fields, models


class StockWarehouse(models.Model):
    _inherit = "stock.warehouse"

    account_analytic_id = fields.Many2one('account.analytic.account', string='Cuenta Analítica')
