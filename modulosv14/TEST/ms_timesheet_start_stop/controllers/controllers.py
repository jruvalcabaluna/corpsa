# -*- coding: utf-8 -*-
from odoo import http

# class MsTimesheetStartStop(http.Controller):
#     @http.route('/ms_timesheet_start_stop/ms_timesheet_start_stop/', auth='public')
#     def index(self, **kw):
#         return "Hello, world"

#     @http.route('/ms_timesheet_start_stop/ms_timesheet_start_stop/objects/', auth='public')
#     def list(self, **kw):
#         return http.request.render('ms_timesheet_start_stop.listing', {
#             'root': '/ms_timesheet_start_stop/ms_timesheet_start_stop',
#             'objects': http.request.env['ms_timesheet_start_stop.ms_timesheet_start_stop'].search([]),
#         })

#     @http.route('/ms_timesheet_start_stop/ms_timesheet_start_stop/objects/<model("ms_timesheet_start_stop.ms_timesheet_start_stop"):obj>/', auth='public')
#     def object(self, obj, **kw):
#         return http.request.render('ms_timesheet_start_stop.object', {
#             'object': obj
#         })