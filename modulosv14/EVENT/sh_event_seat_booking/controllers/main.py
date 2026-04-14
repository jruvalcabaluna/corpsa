# -*- coding: utf-8 -*-
import json
from odoo import fields, http
from odoo.http import request


class WebsiteScore(http.Controller):

    def _process_attendees_form(self, event, form_details):
        """ Process data posted from the attendee details form.

        :param form_details: posted data from frontend registration form, like
            {'1-name': 'r', '1-email': 'r@r.com', '1-phone': '', '1-event_ticket_id': '1'}
        """
        allowed_fields = {'name', 'phone', 'email', 'mobile', 'event_id',
                          'partner_id', 'event_ticket_id', 'seat_no', 'ticket_id'}
        registration_fields = {
            key: v for key, v in request.env['event.registration']._fields.items() if key in allowed_fields}
        registrations = {}
        global_values = {}
        for key, value in form_details.items():
            counter, attr_name = key.split('-', 1)
            field_name = attr_name.split('-')[0]
            if field_name not in registration_fields:
                continue
            elif isinstance(registration_fields[field_name], (fields.Many2one, fields.Integer)):
                # 0 is considered as a void many2one aka False
                value = int(value) or False
            else:
                value = value

            if counter == '0':
                global_values[attr_name] = value
            else:
                registrations.setdefault(counter, dict())[attr_name] = value
        for key, value in global_values.items():
            for registration in registrations.values():
                registration[key] = value

        registrations = list(registrations.values()) 
        
        for registration in registrations:
            registration['registration_answer_ids'] = []

        general_answer_ids = []
        for key, value in form_details.items():
            if 'question_answer' in key and value:
                dummy, registration_index, question_id = key.split('-')
                question_sudo = request.env['event.question'].browse(int(question_id))
                answer_values = None
                if question_sudo.question_type == 'simple_choice':
                    answer_values = {
                        'question_id': int(question_id),
                        'value_answer_id': int(value)
                    }
                elif question_sudo.question_type == 'text_box':
                    answer_values = {
                        'question_id': int(question_id),
                        'value_text_box': value
                    }

                if answer_values and not int(registration_index):
                    general_answer_ids.append((0, 0, answer_values))
                elif answer_values:
                    registrations[int(registration_index) - 1]['registration_answer_ids'].append((0, 0, answer_values))

        for registration in registrations:
            registration['registration_answer_ids'].extend(general_answer_ids)
            
        return registrations

    def _create_attendees_from_registration_post(self, event, registration_data):
        """ Also try to set a visitor (from request) and
        a partner (if visitor linked to a user for example). Purpose is to gather
        as much informations as possible, notably to ease future communications.
        Also try to update visitor informations based on registration info. """

        if any(info.get('event_ticket_id') for info in registration_data):
            order = request.website.sale_get_order(force_create=1)

        for info in [r for r in registration_data if r.get('event_ticket_id')]:
            ticket = request.env['event.event.ticket'].sudo().browse(
                info['event_ticket_id'])
            print("\n\n\n\n ticket0", ticket)
            cart_values = order.with_context(event_ticket_id=ticket.id, fixed_price=True)._cart_update(
                product_id=ticket.product_id.id, add_qty=1)
            info['sale_order_id'] = order.id
            info['sale_order_line_id'] = cart_values.get('line_id')

        visitor_sudo = request.env['website.visitor']._get_visitor_from_request(
            force_create=True)
        visitor_sudo._update_visitor_last_visit()
        visitor_values = {}

        registrations_to_create = []
        for registration_values in registration_data:
            registration_values['event_id'] = event.id
            if not registration_values.get('partner_id') and visitor_sudo.partner_id:
                registration_values['partner_id'] = visitor_sudo.partner_id.id
            elif not registration_values.get('partner_id'):
                registration_values['partner_id'] = request.env.user.partner_id.id

            if visitor_sudo:
                # registration may give a name to the visitor, yay
                if registration_values.get('name') and not visitor_sudo.name and not visitor_values.get('name'):
                    visitor_values['name'] = registration_values['name']
                # update registration based on visitor
                registration_values['visitor_id'] = visitor_sudo.id

            registrations_to_create.append(registration_values)

        if visitor_values:
            visitor_sudo.write(visitor_values)

        return request.env['event.registration'].sudo().create(registrations_to_create)

    @http.route(['''/event/<model("event.event"):event>/registration/confirm'''], type='http', auth="public", methods=['POST'], website=True)
    def registration_confirm(self, event, **post):
        order = request.website.sale_get_order(force_create=1)
        attendee_ids = set()

        registrations = self._process_attendees_form(event, post)
        attendees_sudo = self._create_attendees_from_registration_post(
            event, registrations)

        # free tickets -> order with amount = 0: auto-confirm, no checkout
        if not order.amount_total:
            order.action_confirm()  # tde notsure: email sending ?
            attendees = request.env['event.registration'].browse(
                list(attendee_ids)).sudo()
            # clean context and session, then redirect to the confirmation page
            request.website.sale_reset()
            urls = event._get_event_resource_urls()
            return request.render("website_event.registration_complete", {
                'attendees': attendees,
                'event': event,
                'google_url': urls.get('google_url'),
                'iCal_url': urls.get('iCal_url')
            })

        return request.redirect("/shop/checkout")

    def _process_tickets_form(self,  event, form_details):
        ticket_order = {}
        unavailble_seat_tickettype = form_details.get(
            'unavailble_seat_tickettype')
        nb_register_data = []

        for each_type in unavailble_seat_tickettype:
            ticket_obj = request.env['event.event.ticket'].sudo().search(
                [('event_id', '=', event.id), ('name', 'ilike', each_type)], limit=1)
            if ticket_obj:
                seat_list = []
                for seat in unavailble_seat_tickettype[each_type]:
                    if seat:
                        seat_list.append('R'+seat.split('_')
                                         [0]+' S'+seat.split('_')[1])

                nb_register_data.append({'id': ticket_obj.id,
                                         'name': each_type,
                                         'quantity': len(unavailble_seat_tickettype[each_type]),
                                         'price': ticket_obj.price,
                                         'seat_list': seat_list})

        return nb_register_data

    @http.route(['/event/<model("event.event"):event>/registration/seat'], type='json', auth="public", methods=['POST'], website=True)
    def registration_new(self, event, **post):
        if not event.can_access_from_current_website():
            raise werkzeug.exceptions.NotFound()

        tickets = self._process_tickets_form(event, post)
        availability_check = True
        if event.seats_limited:
            ordered_seats = 0
            for ticket in tickets:
                ordered_seats += ticket['quantity']
            if event.seats_available < ordered_seats:
                availability_check = False
        if not tickets:
            return False

        return request.env['ir.ui.view']._render_template("sh_event_seat_booking.sh_registration_attendee_details", {'tickets': tickets, 'event': event, 'availability_check': availability_check})

    @http.route(['''/get_json_data'''], type='http', auth="public", website=True, csrf=False)
    def get_json_data(self, event_id):
        event_obj = request.env['event.event'].sudo().browse(int(event_id))
        data = []
        seats = {}
        legend_items = []
        max_col_count = 0
        ticket_type_list = ['0', 'a', 'b', 'c', 'd', 'e',
                            'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o']
        if event_obj and event_obj.event_ticket_ids:
            max_col_ticket = event_obj.event_ticket_ids.sorted(
                lambda x: x.col_count, reverse=True)[:1]
            max_cols = max_col_ticket.col_count
            if max_col_count < max_cols:
                max_col_count = max_cols
            i = 1
            for each_ticket_id in event_obj.event_ticket_ids.sorted(lambda x: x.sequence):
                seats[ticket_type_list[i]] = {
                    'price': each_ticket_id.price, 'classes': ticket_type_list[i]+'-class', 'category': each_ticket_id.name}
                legend_items.append(
                    [ticket_type_list[i], 'available', each_ticket_id.name])
                for row in each_ticket_id.seat_arrangement_ids.sorted(lambda m: m.row):

                    seat_arrangement = ''
                    j = 1
                    for col in range(max_cols):
                        if row.seat_selection_ids and row.seat_selection_ids.filtered(lambda y: y.name == str(j)):
                            seat_arrangement += ticket_type_list[i]
                        else:
                            seat_arrangement += '_'
                        j += 1
                    data.append(seat_arrangement)
                i += 1

        legend_items.append(['f', 'unavailable', 'Already Booked'])
        booked_seat_list = []
        if event_obj and event_obj.booked_seat_ids:
            for booked_seat in event_obj.booked_seat_ids:
                booked_seat_list.append(booked_seat.name)

        bigData = {
            'data': data,
            'seats': seats,
            'legend_items': legend_items,
            'booked_seat': booked_seat_list,
            'max_col_count': max_col_count
        }

        return json.dumps(bigData)

    @http.route(['''/get_json_data_from_registration'''], type='http', auth="public", website=True, csrf=False)
    def get_json_data_from_registration(self, event_registration_id):
        event_registration_obj = request.env['event.registration'].sudo().browse(
            int(event_registration_id))
        data = []
        seats = {}
        max_col_count = 0
        legend_items = []
        ticket_type_list = ['0', 'a', 'b', 'c', 'd', 'e',
                            'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o']
        if event_registration_obj and event_registration_obj.event_id.event_ticket_ids:
            event_id = event_registration_obj.event_id
            max_col_ticket = event_id.event_ticket_ids.sorted(
                lambda x: x.col_count, reverse=True)[:1]
            max_cols = max_col_ticket.col_count
            if max_col_count < max_cols:
                max_col_count = max_cols
            i = 1
            for each_ticket_id in event_id.event_ticket_ids.sorted(lambda x: x.sequence):
                seats[ticket_type_list[i]] = {
                    'price': each_ticket_id.price, 'classes': ticket_type_list[i]+'-class', 'category': each_ticket_id.name}
                legend_items.append(
                    [ticket_type_list[i], 'available', each_ticket_id.name])
                for row in each_ticket_id.seat_arrangement_ids.sorted(lambda m: m.row):

                    seat_arrangement = ''
                    j = 1
                    for col in range(max_cols):
                        if row.seat_selection_ids and row.seat_selection_ids.filtered(lambda y: y.name == str(j)):
                            seat_arrangement += ticket_type_list[i]
                        else:
                            seat_arrangement += '_'
                        j += 1
                    data.append(seat_arrangement)
                i += 1

        legend_items.append(['f', 'unavailable', 'Already Booked'])
        booked_seat_list = []
        if event_id and event_id.booked_seat_ids:
            for booked_seat in event_id.booked_seat_ids:
                booked_seat_list.append(booked_seat.name)

        bigData = {
            'data': data,
            'seats': seats,
            'legend_items': legend_items,
            'booked_seat': booked_seat_list,
            'max_col_count': max_col_count
        }

        return json.dumps(bigData)

    @http.route(['''/change_seat'''], type='http', auth="public", website=True, csrf=False)
    def change_seat(self, event_registration_id, seat_no, seat_categ):
        if event_registration_id and seat_no:
            event_registration_obj = request.env['event.registration'].sudo().search(
                [('id', '=', int(event_registration_id))])
            if not event_registration_obj.event_ticket_id and seat_categ:
                categ = request.env['event.event.ticket'].sudo().search(
                    [('name', '=', seat_categ)], limit=1)
                if categ:
                    event_registration_obj.write({'event_ticket_id': categ.id})
            event_registration_obj.write(
                {'seat_no': 'R'+seat_no.split('_')[0]+' S'+seat_no.split('_')[1]})

        return json.dumps({})

    @http.route(['''/event/<int:event_id>/seatBooking'''], type='http', auth="public", website=True)
    def EventSeatBooking(self, **kwargs):
        event_obj = request.env['event.event']
        if kwargs.get('event_id', False):
            event_id = kwargs.get('event_id')
            event = event_obj.sudo().browse(event_id)

        return request.render("sh_event_seat_booking.website_seat_booking_template", {'event_id': event_id, 'event': event})
