
from odoo import api, fields, models, _


class SaleOrderLineAgent(models.Model):
    _inherit = "sale.order.line.agent"

    @api.depends("object_id.price_subtotal", "object_id.product_id", "object_id.product_uom_qty")
    def _compute_amount(self):
        for line in self:
            order_line = line.object_id
            line.amount = line._get_commission_amount(
                line.commission_id,
                order_line.price_subtotal,
                order_line.purchase_price,
                order_line.product_id,
                order_line.product_uom_qty,
            )


class SaleOrderLine(models.Model):
    _inherit = "sale.order.line"

    def _prepare_invoice_line(self, **optional_values):
        vals = super()._prepare_invoice_line(**optional_values)
        vals["purchase_price"] = self.purchase_price
        return vals
