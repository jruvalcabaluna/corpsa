# -*- coding: utf-8 -*-
# Copyright 2020 WeDo Technology
# Website: http://wedotech-s.com
# Email: apps@wedotech-s.com 
# Phone:00249900034328 - 00249122005009

from odoo import models, fields, api
from dateutil.relativedelta import relativedelta


class PurchaseOrderTemplate(models.Model):
    _name = 'purchase.order.template'
    _description = 'Purchase Template'

    name = fields.Char(required=True)
    vendor_ids = fields.Many2many('res.partner',string='Vendors')
    po_template_line_ids = fields.One2many('purchase.order.template.line', 'po_template_id', string='Lines', copy=True)
    note = fields.Text('Terms and conditions', translate=True)
    active = fields.Boolean('Active', default=True)



class PurchaseOrderTemplateLine(models.Model):
    _name = 'purchase.order.template.line'
    _description = "Purchase Template Line"
    _order = 'sequence, po_template_id, id'

    po_template_id = fields.Many2one(
        'purchase.order.template', string='Purchase Template Reference',
        required=True, ondelete='cascade', index=True)
    name = fields.Text('Description', required=True, translate=True)
    product_id = fields.Many2one('product.product', 'Product', domain=[('purchase_ok', '=', True)])
    product_qty = fields.Float('Quantity', required=True, default=1)
    product_uom_id = fields.Many2one('uom.uom', 'Unit of Measure', domain="[('category_id', '=', product_uom_category_id)]")
    product_uom_category_id = fields.Many2one(related='product_id.uom_id.category_id', readonly=True)
    sequence = fields.Integer('Sequence', default=10)
    display_type = fields.Selection([
        ('line_section', "Section"),
        ('line_note', "Note")], default=False, help="Technical field for UX purpose.")

    @api.onchange('product_id')
    def _onchange_product_id(self):
        self.ensure_one()
        if self.product_id:
            name = self.product_id.display_name
            if self.product_id.description_purchase:
                name += '\n' + self.product_id.description_purchase
            self.name = name
            self.product_uom_id = self.product_id.uom_id.id

    @api.model
    def create(self, values):
        if values.get('display_type', self.default_get(['display_type'])['display_type']):
            values.update(product_id=False, product_qty=0, product_uom_id=False)
        return super(PurchaseOrderTemplateLine, self).create(values)

    def write(self, values):
        if 'display_type' in values and self.filtered(lambda line: line.display_type != values.get('display_type')):
            raise UserError(_("You cannot change the type of a purchase quote line. Instead you should delete the current line and create a new line of the proper type."))
        return super(PurchaseOrderTemplateLine, self).write(values)


class PurchaseOrder(models.Model):
    _inherit = 'purchase.order'

    po_template_id = fields.Many2one('purchase.order.template',string='Purchase template')

    @api.onchange('po_template_id')
    def onchange_po_template_id(self):
        if not self.po_template_id:
            return
        self.order_line = False
        vals = {
            'order_line' : [(0,0,{'name':g.name,
                                  'sequence': g.sequence,
                                  'product_id':g.product_id.id,
                                  'product_qty':g.product_qty,
                                  'product_uom_qty':g.product_qty,
                                  'product_uom':g.product_uom_id.id,
                                  'product_uom_category_id':g.product_uom_category_id.id,
                                  'display_type':g.display_type,})
                            for g in self.po_template_id.po_template_line_ids],
            'notes' : self.po_template_id.note,
        }
        self.write(vals)
        for line in self.order_line:
            line._onchange_quantity()
