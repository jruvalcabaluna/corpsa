# -*- coding: utf-8 -*-

from odoo import models, api, fields, _

class MrpProduction(models.Model):
    _inherit = 'mrp.production'

    def name_get(self):
        if not self._context.get("show_lots", False):
            return super(MrpProduction, self).name_get()
        res = [(rec.id, "{} - {}".format(rec.name, rec.lot_producing_id.name)) for rec in self]
        return res

    @api.model
    def _name_search(self, name='', args=None, operator='ilike', limit=100, name_get_uid=None):
        args = [] if args is None else args.copy()
        if not (name == '' and operator == 'ilike'):
            args += ['|', '|',
                     ('name', operator, name),
                     ('lot_producing_id.name', operator, name)
                     ]
        return super(MrpProduction, self)._name_search(
            name=name, args=args, operator=operator,
            limit=limit, name_get_uid=name_get_uid)

    def button_create_landed_costs(self):
        self.ensure_one()
        landed_costs = self.env['stock.landed.cost'].create({
            'target_model': 'manufacturing',
            'mrp_production_ids': [(4, self.id)]
        })
        action = self.env["ir.actions.actions"]._for_xml_id("stock_landed_costs.action_stock_landed_cost")
        return dict(action, view_mode='form', res_id=landed_costs.id, views=[(False, 'form')])

    def action_view_landed_costs(self):
        self.ensure_one()
        action = self.env["ir.actions.actions"]._for_xml_id("stock_landed_costs.action_stock_landed_cost")
        domain = [('mrp_production_ids', 'in', self.ids)]
        context = dict(self.env.context, default_target_model='manufacturing', default_mrp_production_ids=self.id)
        views = [(self.env.ref('stock_landed_costs.view_stock_landed_cost_tree2').id, 'tree'), (False, 'form'), (False, 'kanban')]
        return dict(action, domain=domain, context=context, views=views)