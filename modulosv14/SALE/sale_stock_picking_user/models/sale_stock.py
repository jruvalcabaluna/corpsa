# Copyright 2018 Carlos Dauden - Tecnativa <carlos.dauden@tecnativa.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models

class StockPicking(models.Model):
    _inherit = "stock.picking"

    type_id = fields.Char(string="Tipo")

class StockMove(models.Model):
    _inherit = "stock.move"

    def _get_new_picking_values(self):
        vals = super()._get_new_picking_values()
        type_id = self.sale_line_id.order_id.type_id.name
        user_id = self.sale_line_id.order_id.user_id.id
        if user_id:
            vals["user_id"] = user_id
        if type_id:
            vals["type_id"] = type_id
        return vals
