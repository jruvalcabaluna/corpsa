# -*- coding: utf-8 -*-
######################################################################################
#
#    Odoo Being
#
#    Copyright (C) 2021-TODAY Odoo Being(<https://www.odoobeing.com>).
#    Author: Odoo Being(<https://www.odoobeing.com>)
#
#    This program is under the terms of the Odoo Proprietary License v1.0 (OPL-1)
#    It is forbidden to publish, distribute, sublicense, or sell copies of the Software
#    or modified copies of the Software.
#
#    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
#    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
#    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
#    IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
#    DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
#    ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
#    DEALINGS IN THE SOFTWARE.
#
########################################################################################
{
    'name': "POS Combo Products",
    'summary': """
        Helps to sell product by combo.""",
    'description': """
        POS combo product,  pos, odoo14 pos, pos odoo14, odoo 14, combo products, receipt, custom receipt in odoo14,
        odoo14 receipt, odoobeing, odoo 14 point of sale, odoo14 point of sale, odoo 14 receipt, pos screen,
        point of sale, custom order in pos, custom popup in pos, odoo 14 pos popup, odoo 14 pos report,
        odoo14 pos report, pos report odoo14, odoo14 .""",
    'author': "Odoo Being",
    'website': "https://www.odoobeing.com",
    'license': 'OPL-1',
    'category': 'Point of Sale',
    'version': '14.0.0.2',
    'support': 'odoobeing@gmail.com',
    'price': '12',
    'images': ['static/description/images/pos_combo_product.png'],
    'currency': 'USD',
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
    #         'ob_pos_combo_product/static/**/*',
    #     ],
    #     'web.assets_qweb': [
    #         'ob_pos_combo_product/static/src/xml/**/*',
    #     ],
    # }

}
