# -*- coding: utf-8 -*-

from odoo import api, fields, models, _
from odoo.exceptions import UserError

class CalendarEvent(models.Model):

    _inherit = 'calendar.event'

    customer_id = fields.Many2one('res.partner', string="Cliente")

    color = fields.Integer(related="user_id.color")
    name = fields.Char('Meeting Subject', required=False)

    @api.model
    def create(self, vals):
        v = vals
        start = vals.get("start")
        stop = vals.get("stop")
        user_id = self.env["res.users"].browse(vals.get("user_id"))
        appointment_type_id = self.env["appointment.type"].browse(vals.get("appointment_type_id"))
        appointment_resource_id = self.env["appointment.resource"].browse(vals.get("appointment_resource_id"))
        already_calendar_event = self.env["calendar.event"].search([
            ('start', '>=', start),
            ('stop', '<=', stop),
            ('user_id', '=', user_id.id),
            ('appointment_type_id', '=', appointment_type_id.id),
            ('appointment_resource_id', '=', appointment_resource_id.id)], limit=1)
        if already_calendar_event:
            raise UserError(_('No es posible crear una cita para %s del recurso %s, del usuario %s.',
                              appointment_type_id.name, appointment_resource_id.name, user_id.name))

        appointment_type_id = self.env["appointment.type"].browse(vals.get("appointment_type_id"))
        if appointment_type_id:
            vals['name'] = appointment_type_id.sequence_id.next_by_id()
        res = super(CalendarEvent, self).create(vals)
        return res

    appointment_type_id = fields.Many2one('appointment.type', string="Online Appointment", ondelete="set null")
    appointment_resource_id = fields.Many2one('appointment.resource', string="Appointment Resource", ondelete="set null")
