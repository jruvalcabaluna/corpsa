# -*- coding: utf-8 -*-

from odoo import models, fields, api, _

status = [
    'draft', 'sent', 'sale', 'done', 'cancel'
]


class Dashboard(models.Model):
    _name = 'dashboard.sale'

    user_id = fields.Many2one('res.users')
    name = fields.Char(related='user_id.name')
    # image_128 = fields.Binary(related='user_id.image_128')

    # sale_request_no = fields.Integer()
    # sale_request_amount = fields.Float()

    sale_order_no = fields.Integer()
    # sale_order_amount = fields.Float()

    # sale_invoiced_no = fields.Integer()
    # sale_invoiced_amount = fields.Float()

    # sale_locked_no = fields.Integer()
    # sale_locked_amount = fields.Float()

    # sale_canceled_no = fields.Integer()
    # sale_canceled_amount = fields.Float()

    partner_sale_no = fields.Integer()

    def get_sale_no(self, state, user_id):
        data = self.env['sale.order'].search(
            [('state', 'in', state), ('invoice_status', 'not in', ['invoiced']), ('user_id', '=', user_id)])
        return len(data)

    # def get_sale_amount(self, state, user_id):
    #     data = self.env['sale.order'].search(
    #         [('invoice_status', 'not in', ['invoiced']), ('state', 'in', state), ('user_id', '=', user_id)])
    #     return sum([val.amount_total for val in data])

    # def get_sale_invoiced_no(self, state, user_id):
    #     data = self.env['sale.order'].search(
    #         [('state', 'in', state), ('invoice_status', 'in', ['invoiced']), ('user_id', '=', user_id)])
    #     return len(data)
    #
    # def get_sale_invoiced_amount(self, state, user_id):
    #     data = self.env['sale.order'].search(
    #         [('invoice_status', 'in', ['invoiced']), ('state', 'in', state), ('user_id', '=', user_id)])
    #     return sum([val.amount_total for val in data])

    def get_partner_no(self, user_id):
        data = self.env['sale.order'].search([('user_id', '=', user_id)])
        # print(len(list(dict.fromkeys([val.partner_id for val in data]))), '///////// partner')
        return len(list(dict.fromkeys([val.partner_id for val in data])))

    # --------------view action --------------- #

    def partner_sale_view(self):
        data = self.env['sale.order'].search([('user_id', '=', self.user_id.id)])
        if data:
            return {
                "type": "ir.actions.act_window",
                "view_mode": "kanban,tree,form",
                "context": {'create': False},
                "domain": [('id', 'in', [val.partner_id.id for val in data])],
                "res_model": "res.partner",
                "name": _('Partner %s') % self.user_id.name,
            }

    # def order_sale_invoiced_view(self):
    #     data = self.env['sale.order'].search(
    #         [('invoice_status', 'in', ['invoiced']), ('state', 'in', [status[3]]), ('user_id', '=', self.user_id.id)])
    #     if data:
    #         return {
    #             "type": "ir.actions.act_window",
    #             "view_mode": "kanban,tree,form",
    #             "context": {'create': False},
    #             "domain": [('id', 'in', [val.id for val in data])],
    #             "res_model": "sale.order",
    #             "name": _('Invoiced Sale User (%s)') % self.user_id.name,
    #         }

    def order_sale_view(self):
        data = self.env['sale.order'].search(
            [('invoice_status', 'not in', ['invoiced']), ('state', 'in', [status[2]]),
             ('user_id', '=', self.user_id.id)])
        if data:
            return {
                "type": "ir.actions.act_window",
                "view_mode": "tree,kanban,form",
                "context": {'create': False},
                "domain": [('id', 'in', [val.id for val in data])],
                "res_model": "sale.order",
                "name": _('Pedidos Sucursal (%s)') % self.user_id.name,
            }

    # def lock_sale_view(self):
    #     data = self.env['sale.order'].search([('state', 'in', [status[3]]), ('user_id', '=', self.user_id.id)])
    #     if data:
    #         return {
    #             "type": "ir.actions.act_window",
    #             "view_mode": "tree,kanban,form",
    #             "context": {'create': False},
    #             "domain": [('id', 'in', [val.id for val in data])],
    #             "res_model": "sale.order",
    #             "name": _('Pedidos Terminados Sucursal (%s)') % self.user_id.name,
    #         }

    # def cancel_sale_view(self):
    #     data = self.env['sale.order'].search([('state', 'in', [status[5]]), ('user_id', '=', self.user_id.id)])
    #     if data:
    #         return {
    #             "type": "ir.actions.act_window",
    #             "view_mode": "kanban,tree,form",
    #             "context": {'create': False},
    #             "domain": [('id', 'in', [val.id for val in data])],
    #             "res_model": "sale.order",
    #             "name": _('Canceled  Sale User (%s)') % self.user_id.name,
    #         }
    #
    # def request_sale_view(self):
    #     data = self.env['sale.order'].search(
    #         [('state', 'in', [status[0], status[1], status[2]]), ('user_id', '=', self.user_id.id)])
    #     if data:
    #         return {
    #             "type": "ir.actions.act_window",
    #             "view_mode": "kanban,tree,form",
    #             "context": {'create': False},
    #             "domain": [('id', 'in', [val.id for val in data])],
    #             "res_model": "sale.order",
    #             "name": _('Requested  Sale User (%s)') % self.user_id.name,
    #         }

    # --------------view action --------------- #

    def data_dashboard_sale(self):
        print('////////////')
        users = []
        for val in self.env['sale.order'].search([]):
            users.append(val.user_id.id)
        users = list(dict.fromkeys(users))
        print(users)
        if users:
            for user in users:
                dashboard = self.env['dashboard.sale'].search([('user_id', '=', user)])
                if dashboard:
                    # [
                    #     'draft', 'sent', 'to approve', 'purchase', 'done', 'cancel'
                    # ]
                    dashboard.write(
                        {
                            # 'sale_request_no': self.get_sale_no([status[0], status[1], status[2]], user),
                            # 'sale_request_amount': self.get_sale_amount([status[0], status[1], status[2]],
                            #                                                     user),
                            'sale_order_no': self.get_sale_no([status[2]], user),
                            # 'sale_order_amount': self.get_sale_amount([status[3]], user),
                            # 'sale_invoiced_no': self.get_sale_invoiced_no([status[3]], user),
                            # 'sale_invoiced_amount': self.get_sale_invoiced_amount([status[3]], user),
                            # 'sale_locked_no': self.get_sale_no([status[3]], user),
                            # 'sale_locked_amount': self.get_sale_amount([status[4]], user),
                            # 'sale_canceled_no': self.get_sale_no([status[5]], user),
                            # 'sale_canceled_amount': self.get_sale_amount([status[5]], user),
                            'partner_sale_no': self.get_partner_no(user),
                        }
                    )
                else:
                    self.env['dashboard.sale'].create(
                        {
                            'user_id': user,
                            # 'sale_request_no': self.get_sale_no([status[0], status[1], status[2]], user),
                            # 'sale_request_amount': self.get_sale_amount([status[0], status[1], status[2]],
                            #                                                     user),
                            'sale_order_no': self.get_sale_no([status[2]], user),
                            # 'sale_order_amount': self.get_sale_amount([status[3]], user),
                            # 'sale_invoiced_no': self.get_sale_invoiced_no([status[3]], user),
                            # 'sale_invoiced_amount': self.get_sale_invoiced_amount([status[3]], user),
                            # 'sale_locked_no': self.get_sale_no([status[3]], user),
                            # 'sale_locked_amount': self.get_sale_amount([status[4]], user),
                            # 'sale_canceled_no': self.get_sale_no([status[5]], user),
                            # 'sale_canceled_amount': self.get_sale_amount([status[5]], user),
                            'partner_sale_no': self.get_partner_no(user),
                        }
                    )

        return {
            "type": "ir.actions.act_window",
            "view_mode": "kanban,search,graph",
            # "context": {'search_default_type_expenses': 'sheet'},
            "res_model": self._name,
            "name": _('Sale Dashboard'),
        }
