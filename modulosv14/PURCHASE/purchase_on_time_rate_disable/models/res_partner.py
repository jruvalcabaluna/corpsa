
from odoo import api, fields, models

class ResPartner(models.Model):
    _inherit = "res.partner"

    disable_on_time_rate = fields.Boolean('Disable On Time Rate', help="If checked, the KPI On Time Rate is not calculate.")

    @api.depends('purchase_line_ids')
    def _compute_on_time_rate(self):
        if self.disable_on_time_rate == False:
            res = super(ResPartner, self)._compute_on_time_rate()
        else:
            res = self.on_time_rate = 100
        return res