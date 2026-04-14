# -*- coding: utf-8 -*-

from odoo import models, fields, api, _

class AccountAnalyticLine(models.Model):
    _inherit = 'account.analytic.line'

    @api.depends('start_time', 'end_time', 'break_unit_amount')
    def _get_unit_amount(self):
        for rec in self :
            unit_amount = 0
            if rec.start_time and rec.end_time :
                unit_amount = rec.end_time - rec.start_time
                unit_amount = unit_amount.total_seconds() / 60 / 60
                if rec.break_unit_amount :
                    unit_amount -= rec.break_unit_amount
            rec.unit_amount = unit_amount

    start_time = fields.Datetime(string='Start Time')
    end_time = fields.Datetime(string='End Time')
    break_unit_amount = fields.Float(string='Break Time (Hour(s))')
    unit_amount = fields.Float(compute='_get_unit_amount', store=True)
