# -*- coding: utf-8 -*-
{
    'name': "agribeans",
    'summary': """
        Agribeans""",
    'description': """
        Customs Agribeans
    """,
    'version': '1.0',
    'depends': [
                'stock',
                'mrp_landed_costs',
                'mrp',
                ],
    'data': [
        'security/ir.model.access.csv',
        'views/mrp_production_views.xml',
        'views/stock_landed_cost_template_views.xml',
        'views/stock_landed_cost_views.xml',
    ],
    'qweb': [
    ],
}
