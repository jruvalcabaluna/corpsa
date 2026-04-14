# -*- coding: utf-8 -*-
from odoo import http

# class OdoopiPurchaseReport(http.Controller):
#     @http.route('/odoopi_purchase_report/odoopi_purchase_report/', auth='public')
#     def index(self, **kw):
#         return "Hello, world"

#     @http.route('/odoopi_purchase_report/odoopi_purchase_report/objects/', auth='public')
#     def list(self, **kw):
#         return http.request.render('odoopi_purchase_report.listing', {
#             'root': '/odoopi_purchase_report/odoopi_purchase_report',
#             'objects': http.request.env['odoopi_purchase_report.odoopi_purchase_report'].search([]),
#         })

#     @http.route('/odoopi_purchase_report/odoopi_purchase_report/objects/<model("odoopi_purchase_report.odoopi_purchase_report"):obj>/', auth='public')
#     def object(self, obj, **kw):
#         return http.request.render('odoopi_purchase_report.object', {
#             'object': obj
#         })