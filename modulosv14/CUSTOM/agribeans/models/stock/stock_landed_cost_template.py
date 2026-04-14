# -*- coding: utf-8 -*-

from odoo import models, fields, api
from dateutil.relativedelta import relativedelta
SPLIT_METHOD = [
    ('equal', 'Equal'),
    ('by_quantity', 'By Quantity'),
    ('by_current_cost_price', 'By Current Cost'),
    ('by_weight', 'By Weight'),
    ('by_volume', 'By Volume'),
]

class StockLandedCostTemplate(models.Model):
    _name = 'stock.landed.cost.template'
    _description = 'Stock Landed Cost Template'

    name = fields.Char(required=True)
    slc_template_line_ids = fields.One2many('stock.landed.cost.template.line', 'slc_template_id', string='Lines', copy=True)
    active = fields.Boolean('Active', default=True)



class StockLandedCostTemplateLine(models.Model):
    _name = 'stock.landed.cost.template.line'
    _description = "Stock Landed Cost Template Line"
    _order = 'slc_template_id, id'

    slc_template_id = fields.Many2one('stock.landed.cost.template', string='Stock Landed Cost Template Reference',
                                      required=True, ondelete='cascade', index=True)
    name = fields.Char('Description')
    product_id = fields.Many2one('product.product', 'Product', domain=[('landed_cost_ok', '=', True)])
    price_unit = fields.Float('Cost', required=True, default=1)
    split_method = fields.Selection(
        SPLIT_METHOD,
        string='Split Method',
        required=True,
        help="Equal : Cost will be equally divided.\n"
             "By Quantity : Cost will be divided according to product's quantity.\n"
             "By Current cost : Cost will be divided according to product's current cost.\n"
             "By Weight : Cost will be divided depending on its weight.\n"
             "By Volume : Cost will be divided depending on its volume.")
    account_id = fields.Many2one('account.account', 'Account', domain=[('deprecated', '=', False)])

    @api.onchange('product_id')
    def onchange_product_id(self):
        self.name = self.product_id.name or ''
        self.split_method = self.product_id.product_tmpl_id.split_method_landed_cost or self.split_method or 'equal'
        self.price_unit = self.product_id.standard_price or 0.0
        accounts_data = self.product_id.product_tmpl_id.get_product_accounts()
        self.account_id = accounts_data['stock_input']
