from odoo import api,fields,models,_

class AccountMove(models.Model):
    _inherit = "account.move"

    show_c3 = fields.Boolean("Mostrar terceros", store=True, default=False)
