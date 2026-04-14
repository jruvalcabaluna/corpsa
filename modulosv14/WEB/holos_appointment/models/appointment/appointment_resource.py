# -*- coding: utf-8 -*-

from odoo import api, fields, models

class AppointmentResource(models.Model):

    _name = 'appointment.resource'
    _description = 'Recurso Cita'

    active = fields.Boolean(string='Active')
    name = fields.Char(string='Name',required=True,translate=True)
