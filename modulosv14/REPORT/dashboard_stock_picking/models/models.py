# -*- coding: utf-8 -*-

from odoo import models, fields, api, _

class Dashboard(models.Model):
    _name = 'dashboard.stock'
    _description = 'Dashboard Stock'

    user_id = fields.Many2one('res.users')
    user_code = fields.Char(string='User Code', related='user_id.user_code')
    stock_picking_no = fields.Integer()

    def get_stock_no(self, user_id):
        data = self.env['stock.picking'].search(
            [('priority', 'in', [1]), ('state', 'not in', ['done', 'cancel']), ('user_id', '=', user_id)])
        return len(data)

    # --------------view action --------------- #

    def stock_picking_urgent(self):
        data = self.env['stock.picking'].search(
            [('priority', 'in', [1]),('state', 'not in', ['done', 'cancel']),
             ('user_id', '=', self.user_id.id)])
        if data:
            return {
                'type': 'ir.actions.act_window',
                'view_mode': 'tree,kanban,form',
                # "context": {'create': False},
                'domain': [('id', 'in', [val.id for val in data])],
                'res_model': 'stock.picking',
                'name': _('En Priority (%s)') % self.user_id.name,
            }

    # --------------view action --------------- #
    def data_dashboard_stock(self):
        users = []
        for val in self.env['stock.picking'].search([]):
            users.append(val.user_id.id)
        users = list(dict.fromkeys(users))
        if users:
            for user in users:
                dashboard = self.env['dashboard.stock'].search([('user_id', '=', user)])
                if dashboard:
                    # [
                    #     'draft', 'sent', 'to approve', 'purchase', 'done', 'cancel'
                    # ]
                    dashboard.write(
                        {
                            'stock_picking_no': self.get_stock_no(user),
                        }
                    )
                else:
                    self.env['dashboard.stock'].create(
                        {
                            'user_id': user,
                            'stock_picking_no': self.get_stock_no(user),
                        }
                    )
        return {
            'type': 'ir.actions.act_window',
            'view_mode': 'kanban,search,graph',
            'res_model': self._name,
            'name': _('Stock Dashboard'),
        }