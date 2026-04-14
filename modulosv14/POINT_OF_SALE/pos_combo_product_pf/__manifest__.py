
{
    'name': "POS Combo Products PF",
    'summary': """
        POS combo product PF""",
    'description': """
        POS combo product PF""",
    'category': 'Point of Sale',
    'version': '14.0.0.2',
    'installable': True,
    'auto_install': False,
    'depends': ['point_of_sale'],
    'data': [
        'security/ir.model.access.csv',
        'views/pos_assets.xml',
        'views/combo_products_view.xml',
    ],
    'qweb': [
        'static/src/xml/combo_products.xml',
    ],
    # 'assets': {
    #     'point_of_sale.assets': [
    #         'pos_combo_product_pf/static/**/*',
    #     ],
    # }
}
