# -*- coding: utf-8 -*-
from odoo import api, fields, models, _

class PosConfig(models.Model):
    _inherit = "pos.config"

    manager_ids = fields.Many2many('res.users', 'pos_config_res_user_manager_rel', 'config_id', 'user_id',
                                   string='Manager Validation')
    validate_by_manager = fields.Boolean('Validate by Managers')