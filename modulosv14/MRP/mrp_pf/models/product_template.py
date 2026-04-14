# -*- coding: utf-8 -*-
from odoo import api, fields, models

class ProductTemplate(models.Model):
    _inherit = 'product.template'

    sequence_in_bom_mrp = fields.Char(string='Secuencia LdM', help="Este valor se utiliza para definir la secuencia de los productos en la explosion de materiales")