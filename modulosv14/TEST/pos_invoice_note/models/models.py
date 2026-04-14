# -*- coding: utf-8 -*-

# from odoo import models, fields, api


# class pos_invoice_note(models.Model):
#     _name = 'pos_invoice_note.pos_invoice_note'
#     _description = 'pos_invoice_note.pos_invoice_note'

#     name = fields.Char()
#     value = fields.Integer()
#     value2 = fields.Float(compute="_value_pc", store=True)
#     description = fields.Text()
#
#     @api.depends('value')
#     def _value_pc(self):
#         for record in self:
#             record.value2 = float(record.value) / 100
from functools import partial

from odoo import models, api, fields


class PosOrder(models.Model):
    _inherit = "pos.order"

    @api.model
    def _order_fields(self, ui_order):
        result = super(PosOrder, self)._order_fields(ui_order)
        if 'wv_note' in ui_order:
            result['note'] = ui_order['wv_note']
        return result


class pos_config(models.Model):
    _inherit = 'pos.config'

    allow_invoice_note = fields.Boolean("Allow Invoice Note")