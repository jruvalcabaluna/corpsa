# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.
{
    'name': "pos_cache_partner",

    'summary': "Enable a cache on partners for a lower POS loading time.",

    'description': """
This creates a partner cache per POS config. It drastically lowers the
time it takes to load a POS session with a lot of partners.
    """,

    'category': 'Sales/Point of Sale',
    'version': '1.0',
    'depends': ['point_of_sale'],
    'data': [
        'data/pos_cache_partner_data.xml',
        'security/ir.model.access.csv',
        'views/pos_cache_partner_views.xml',
        'views/pos_cache_partner_templates.xml',
    ]
}
