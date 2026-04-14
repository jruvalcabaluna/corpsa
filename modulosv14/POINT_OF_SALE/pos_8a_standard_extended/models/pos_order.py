
from odoo import api, models, fields, _
from odoo.exceptions import UserError

from datetime import datetime

class PosOrder(models.Model):
    _inherit = 'pos.order'

    devolucion = fields.Boolean('Devolucion', default=False)

    #def refund(self):
    #    if self.picking_refund_count > 0: 
    #        picking_ids = self.env['stock.picking'].search([('origin','=',self.pos_reference)])
    #        for picking in picking_ids:
    #            dev_vals = {
    #            'scheduled_date': datetime.now(),
    #            'picking_type_id': picking.picking_type_id.id,
    #            'location_id': picking.location_dest_id.id,
    #            'location_dest_id': picking.location_id.id,
    #            'origin': picking.name
    #            }
    #            dev_id = self.env['stock.picking'].sudo().create(dev_vals)
    #            for move in picking.move_ids_without_package:
    #                line_vals = {
    #                'picking_id': dev_id.id,
    #                'product_id': move.product_id.id,
    #                'name': move.product_id.name,
    #                'product_uom_qty': move.product_uom_qty,
    #                'quantity_done': move.quantity_done,
    #                'product_uom': move.product_uom.id,
    #                'location_id': picking.location_dest_id.id,
    #                'location_dest_id': picking.location_id.id,
    #                }
    #                line_id = self.env['stock.move'].sudo().create(line_vals)
    #            dev_id.button_validate()
    #    return super(PosOrder, self).refund()
    #       raise UserError(_('Atención\nNo se puede generar una devolución de otra devolución'))

    #   refund = super(PosOrder, self).refund()
    #   raise UserError(_(refund))
    #   if refund:
    #       refund.sudo().write({'devolucion': True})

    def _prepare_refund_values(self, current_session):
        self.ensure_one()
        values = super(PosOrder, self)._prepare_refund_values(current_session)

        if self.devolucion:
            raise UserError(_('Atención\nNo se puede generar devolución de una devolución'))
        
        order_ids = self.env['pos.order'].sudo().search([('pos_reference','=',values.get('pos_reference')),('devolucion','=',True)])
        
        if len(order_ids) > 0:
            raise UserError(_('Atención\nYa existe una devolución de este recibo, favor verificar, orden de devolución: %s')%(order_ids[0].name))
        
        values.update({'devolucion': True})
        return values