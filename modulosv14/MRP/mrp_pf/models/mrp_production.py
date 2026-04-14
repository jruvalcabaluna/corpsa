# -*- coding: utf-8 -*-

from odoo import api, fields, models

class MrpProduction(models.Model):
    _inherit = 'mrp.production'

    def mrp_production_call(self):
        productions = self.env['mrp.production'].search([('id', 'in', self.ids)])
        print('productions',productions)
        mrp_line_ids = self.env["stock.move"].search([('group_id', 'in', productions.procurement_group_id.ids)]).ids
        print(mrp_line_ids)
        if mrp_line_ids:
            self.env.cr.execute("""
                SELECT pt.name, pt.sequence_in_bom_mrp, sum(sm.product_uom_qty) total
                FROM stock_move AS sm,
                   	 product_template AS pt,
                     mrp_production AS mp
                WHERE sm.group_id = mp.procurement_group_id
                AND pt.id = sm.product_id 
                AND sm.id IN %s
                GROUP BY pt.name, pt.sequence_in_bom_mrp
            """, (tuple(mrp_line_ids),))
            productions_d = self.env.cr.dictfetchall()
        else:
            productions_d = []
        print(productions_d)
        return  productions_d