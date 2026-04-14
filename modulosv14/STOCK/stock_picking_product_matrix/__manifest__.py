# -*- coding: utf-8 -*-
{
    'name': "Stock Picking Matrix",
    'summary': """
       Add variants to your stock pickings through an Order Grid Entry.
    """,
    'description': """
        This module allows to fill Stock Pickings rapidly
        by choosing product variants quantity through a Grid Entry.
    """,
    'category': 'Inventory/Purchase',
    'version': '1.0',
    'depends': ['stock', 'product_matrix'],
    'data': [
        'views/assets.xml',
        'views/stock_picking_views.xml',
        # 'report/purchase_quotation_templates.xml',
        # 'report/purchase_order_templates.xml',
    ],
    'license': 'LGPL-3',
}
