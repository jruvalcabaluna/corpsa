
from odoo import models, fields

class AccountInvoiceReport(models.Model):

    _inherit = 'account.invoice.report'

    price_unit = fields.Float(string='Price Unit', readonly=True)
    discount = fields.Float(string='Discount', readonly=True)
    cost = fields.Float(string='Cost', readonly=True)
    list_price = fields.Float(string='Public Price', readonly=True)
    ref = fields.Char(string='Ref', readonly=True)

    def _select(self):
        return super()._select() + ", line.price_unit AS price_unit, line.discount AS discount, template.list_price AS list_price, move.ref AS ref, prop.value_float AS cost"

    def _from(self):
        return super()._from() + "LEFT JOIN ir_property prop on prop.res_id = 'product.product,' || product.id"


