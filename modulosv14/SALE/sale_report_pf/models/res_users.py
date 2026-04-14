from odoo import fields, models

class ResUsers(models.Model):
    _inherit = 'res.users'

    user_code = fields.Char(string='Code Suc', help="Codigo asignado al comercial para identificar el numero de Suc")
    # user_short_name = fields.Char(string='Alias Suc', help="Alias asignado al comercial para identificar el Alias de Suc")