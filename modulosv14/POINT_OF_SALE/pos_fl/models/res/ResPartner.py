# -*- coding: utf-8 -*-
from odoo import api, fields, models, tools, _

class ResPartner(models.Model):
    _inherit = "res.partner"

    is_doctor = fields.Boolean('Es Doctor', default=False)

    @api.model
    def create_from_ui_fl(self, partner):
        """ create or modify a partner from the point of sale ui.
            partner contains the partner's fields. """
        # image is a dataurl, get the data after the comma

        partner['is_doctor'] = True

        if partner.get('image_1920'):
            partner['image_1920'] = partner['image_1920'].split(',')[1]
        partner_id = partner.pop('id', False)
        if partner_id:  # Modifying existing partner
            self.browse(partner_id).write(partner)
        else:
            partner_id = self.create(partner).id
        return partner_id