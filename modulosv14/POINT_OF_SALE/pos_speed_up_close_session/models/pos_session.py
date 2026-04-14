
from odoo import api, fields, models, _

class PosSession(models.Model):
    _inherit = 'pos.session'

    @api.depends('payment_method_ids', 'order_ids', 'cash_register_balance_start', 'cash_register_id')
    def _compute_cash_balance(self):
        for session in self:
            cash_payment_method = session.payment_method_ids.filtered('is_cash_count')[:1]
            if cash_payment_method:
                total_cash_payment = 0.0
                result = self.env['pos.payment'].read_group([('session_id', '=', self.id), ('payment_method_id', '=', cash_payment_method.id)], ['amount'], ['session_id'])
                if result:
                    total_cash_payment = result[0]['amount']
                session.cash_register_total_entry_encoding = session.cash_register_id.total_entry_encoding + (
                    0.0 if session.state == 'closed' else total_cash_payment
                )
                session.cash_register_balance_end = session.cash_register_balance_start + session.cash_register_total_entry_encoding
                session.cash_register_difference = session.cash_register_balance_end_real - session.cash_register_balance_end
            else:
                session.cash_register_total_entry_encoding = 0.0
                session.cash_register_balance_end = 0.0
                session.cash_register_difference = 0.0

    @api.depends('order_ids.payment_ids.amount')
    def _compute_total_payments_amount(self):
        result = self.env['pos.payment'].read_group([('session_id', 'in', self.ids)], ['amount'], ['session_id'])
        session_amount_map = dict((data['session_id'][0], data['amount']) for data in result)
        for session in self:
            session.total_payments_amount = session_amount_map.get(session.id) or 0

    @api.depends('picking_ids', 'picking_ids.state')
    def _compute_picking_count(self):
        for session in self:
            session.picking_count = self.env['stock.picking'].search_count([('pos_session_id', '=', session.id)])
            session.failed_pickings = bool(self.env['stock.picking'].search([('pos_session_id', '=', session.id), ('state', '!=', 'done')], limit=1))