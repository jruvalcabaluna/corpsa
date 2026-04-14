
from odoo import api, fields, models, _

class AccountMoveLine(models.Model):
    _inherit = "account.move.line"

    purchase_price = fields.Float(string='Cost', digits='Product Price', groups="base.group_user")


class AccountInvoiceLineAgent(models.Model):
    _inherit = "account.invoice.line.agent"

    @api.depends("object_id.price_subtotal", "object_id.product_id.commission_free")
    def _compute_amount(self):
        for line in self:
            inv_line = line.object_id
            line.amount = line._get_commission_amount(
                line.commission_id,
                inv_line.price_subtotal,
                inv_line.purchase_price,
                inv_line.product_id,
                inv_line.quantity,
            )
            # Refunds commissions are negative
            if line.invoice_id.move_type and "refund" in line.invoice_id.move_type:
                line.amount = -line.amount