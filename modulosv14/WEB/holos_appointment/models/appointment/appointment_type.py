# -*- coding: utf-8 -*-

from odoo import api, fields, models
from odoo.addons.base.models.res_partner import _tzs

class AppointmentType(models.Model):

    _name = 'appointment.type'
    _description = 'Tipo Cita'

    @api.model
    def _get_domain_sequence_id(self):
        return [("code", "=", "appointment.type")]

    sequence_id = fields.Many2one('ir.sequence', 'Sequence',domain=lambda self: self._get_domain_sequence_id(), copy=False)
    active = fields.Boolean(string='Active')
    name = fields.Char(string='Name',required=True,translate=True)
    appointment_duration = fields.Float(string='Appointment Duration')
    min_schedule_hours = fields.Float(string='Schedule Appointment')
    min_cancellation_hours = fields.Float(string='Allow Cancelling')
    assign_method = fields.Selection([('chosen', 'Chosen by the Customer'),
                                      ('random', 'Random'),
                                      ],string='Assignment Method')
    staff_user_ids = fields.Many2many('res.users', string='Users')

    appointment_tz = fields.Selection(_tzs, string="Timezone")


    # resource_id = fields.Many2one("appointment.resource",string="Resource")


