# -*- coding: utf-8 -*-
from odoo.exceptions import UserError
from odoo import models, fields, api, _


class PosOrderInherit(models.Model):
    _inherit = 'pos.order'

    @api.model
    def _order_fields(self, ui_order):
        order_fields = super(PosOrderInherit, self)._order_fields(ui_order)
        combo_list = []
        if ui_order['lines']:
            for l in ui_order['lines']:
                for combo in l[1]['combo_items']:
                    combo_list.append([0, 0, {
                        'product_id': combo['id'],
                        'qty': l[1]['qty'],
                        'full_product_name': combo['name'],
                        'price_unit': float(0.0),
                        'price_subtotal': float(0.0),
                        'price_subtotal_incl': float(0.0),
                    }])
        order_fields['lines'] = order_fields['lines'] + combo_list
        return order_fields


class ComboProduct(models.Model):
    _name = 'combo.product'
    _rec_name = "name"
    _description = 'POS Combo Products'

    name = fields.Char(default="Combo Products")
    is_required = fields.Boolean(string='Es Requerido')
    category = fields.Many2one('pos.category', string='Categoría')
    products = fields.Many2many('product.product', 'ob_combo_product_rel')
    combo_id = fields.Many2one('product.template')
    item_count = fields.Integer(string='# Items')

    @api.onchange('category')
    def _onchange_category(self):
        if self.category:
            return {'domain': {'products': [('pos_categ_id', 'in', self.category.ids)]}}

    # @api.onchange('is_required', 'item_count', 'products')
    # def _check_limit(self):
    #     for record in self:
    #         if record.is_required:
    #             record.item_count = len(record.products)
    #         if not record.is_required:
    #             if record.item_count > len(record.products):
    #                 raise UserError(_("¡El número seleccionado de productos supera el recuento(#) de artículos permitido!"))


class ProductTemplate(models.Model):
    _inherit = 'product.template'

    is_combo = fields.Boolean(string='Es Combo', default=False)
    combo_items = fields.One2many('combo.product', 'combo_id', string='Combo Items')

    # @api.onchange('is_combo', 'type')
    # def _onchange_combo_type(self):
    #     for rec in self:
    #         if rec.is_combo:
    #             rec.type = 'service'
