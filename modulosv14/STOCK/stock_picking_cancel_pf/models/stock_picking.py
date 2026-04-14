
from odoo import models

class StockPicking(models.Model):
    _inherit = "stock.picking"

    def action_cancel_all_operations(self):
        for pick in self.sudo(): #for search stock.picking with usage customer
            sale = pick.sale_id #id from sale_order
            purchase = pick.sale_id.auto_purchase_order_id #id from purchase_order
            sale_to_cancel = self.env['sale.order'].browse(sale.id)
            sale_to_cancel.action_cancel()
            purchase_to_cancel = self.env['purchase.order'].browse(purchase.id)
            purchase_to_cancel.sudo().button_cancel()