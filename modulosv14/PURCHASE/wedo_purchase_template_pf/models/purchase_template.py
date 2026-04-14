# -*- coding: utf-8 -*-
from odoo import models, fields, api

class PurchaseOrderTemplate(models.Model):
    _inherit = 'purchase.order.template'

    vendor_default_id = fields.Many2one('res.partner',string='Vendors Default')


class PurchaseOrder(models.Model):
    _inherit = 'purchase.order'

    @api.onchange('po_template_id')
    def on_change_po_template_id(self):
        if self.po_template_id:
            vals = {
                'partner_id' : self.po_template_id.vendor_default_id,
            }
            self.write(vals)