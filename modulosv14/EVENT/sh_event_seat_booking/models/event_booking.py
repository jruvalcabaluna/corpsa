# Copyright (C) Softhealer Technologies.

from odoo import fields,models

class EventBooking(models.Model):
    _name = 'event.booking.dashboard' 
    _description= 'Event Booking'
    
    name = fields.Char('Name')
   