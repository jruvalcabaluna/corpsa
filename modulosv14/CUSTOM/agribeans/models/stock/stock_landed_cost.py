# -*- coding: utf-8 -*-

from odoo import fields, models, api


class StockLandedCost(models.Model):
    _inherit = 'stock.landed.cost'

    stock_landed_cost_template_id = fields.Many2one('stock.landed.cost.template',string='Stock Landed Cost Template')

    @api.onchange('stock_landed_cost_template_id')
    def onchange_stock_landed_cost_template_id(self):
        if not self.stock_landed_cost_template_id:
            return
        self.cost_lines = False
        vals = {
            'cost_lines' : [(0,0,{'name':g.name,
                                  'product_id':g.product_id.id,
                                  'price_unit':g.price_unit,
                                  'split_method': g.split_method,
                                  'account_id': g.account_id,
                                  })
                            for g in self.stock_landed_cost_template_id.slc_template_line_ids],
        }
        self.write(vals)
