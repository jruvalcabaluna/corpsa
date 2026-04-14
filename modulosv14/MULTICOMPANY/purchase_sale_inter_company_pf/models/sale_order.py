# Copyright 2013-Today Odoo SA
# Copyright 2016-2019 Chafique DELLI @ Akretion
# Copyright 2018-2019 Tecnativa - Carlos Dauden
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
#
# from odoo import fields, models
#
#
# class SaleOrder(models.Model):
#     _inherit = "sale.order"
#
# def _action_view_delivery(self):
#         '''
#         This function returns an action that display existing delivery orders
#         of given sales order ids. It can either be a in a list or in a form
#         view, if there is only one delivery order to show.
#         '''
#         action = self.env["ir.actions.actions"]._for_xml_id("stock.action_picking_tree_all")
#
#         pickings = self.mapped('picking_ids')
#         if len(pickings) > 1:
#             action['domain'] = [('id', 'in', pickings.ids)]
#         elif pickings:
#             form_view = [(self.env.ref('stock.view_picking_form').id, 'form')]
#             if 'views' in action:
#                 action['views'] = form_view + [(state,view) for state,view in action['views'] if view != 'form']
#             else:
#                 action['views'] = form_view
#             action['res_id'] = pickings.id
#         # Prepare the context.
#         picking_id = pickings.filtered(lambda l: l.picking_type_id.code == 'outgoing')
#         if picking_id:
#             picking_id = picking_id[0]
#         else:
#             picking_id = pickings[0]
#         action['context'] = dict(self._context, default_partner_id=self.partner_id.id, default_picking_id=picking_id.id, default_picking_type_id=picking_id.picking_type_id.id, default_origin=self.name, default_user_id=self.user_id.id, default_group_id=picking_id.group_id.id)
#         print(action)
#         return action

#
#     auto_purchase_order_id = fields.Many2one(
#         comodel_name="purchase.order",
#         string="Source Purchase Order",
#         readonly=True,
#         copy=False,
#     )
#
#     def action_confirm(self):
#         for order in self.filtered("auto_purchase_order_id"):
#             for line in order.order_line.sudo():
#                 if line.auto_purchase_line_id:
#                     line.auto_purchase_line_id.price_unit = line.price_unit
#         return super(SaleOrder, self).action_confirm()
#
#
# class SaleOrderLine(models.Model):
#     _inherit = "sale.order.line"
#
#     auto_purchase_line_id = fields.Many2one(
#         comodel_name="purchase.order.line",
#         string="Source Purchase Order Line",
#         readonly=True,
#         copy=False,
#     )
