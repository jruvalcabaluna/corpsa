# -*- coding: utf-8 -*-
#################################################################################
#
#    Copyright (c) 2017-Present Webkul Software Pvt. Ltd. (<https://webkul.com/>)
#    You should have received a copy of the License along with this program.
#    If not, see <https://store.webkul.com/license.html/>
#################################################################################
import werkzeug
from odoo import http
from odoo.http import request
from odoo.addons.website_sale.controllers.main import WebsiteSale

class WebsiteSale(WebsiteSale):

    @http.route(['/shop/<model("product.template"):product>'], type='http', auth="public", website=True)
    def product(self, product, category='', search='', **kwargs):
        r = super(WebsiteSale, self).product(product, category, search, **kwargs)
        size_chart  =request.env['website.size.chart'].search([('product_tmpl_ids','in',[product.id])],limit=1)
        if size_chart:
            r.qcontext.update(dict(size_chart=size_chart))
        return r
