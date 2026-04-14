# -*- coding: utf-8 -*-
from odoo import fields, models,tools,api

class StockProductionLot(models.Model):
    _inherit = 'stock.production.lot'

    def check_lot_by_rpc(self):
        lots = self.env['stock.production.lot'].sudo().search_read()