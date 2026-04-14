
from odoo import api, fields, models, _

class PosPayment(models.Model):
    _inherit = "pos.payment"

    session_id = fields.Many2one('pos.session', string='Session', related='pos_order_id.session_id', store=True, index=True)
    company_id = fields.Many2one('res.company', string='Company', related='pos_order_id.company_id', store=True)