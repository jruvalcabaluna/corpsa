# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.
{
    'name': 'Venta detalle 8a',
    'version': '1.0',
    'category': 'Sales',
    'summary': 'Ventas a detalle 8a',
    'description': """
  Ventas a detalle 8a
========================
    """,
    'depends': [
        'sale',
    ],
    'data': [
        'wizard/sale_detail_wizard_view.xml',
        'security/ir.model.access.csv'
    ],
    'demo': [
    ],
    'installable': True,
    'auto_install': False,
}
