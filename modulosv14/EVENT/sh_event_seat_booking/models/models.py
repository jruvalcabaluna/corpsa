from odoo import api, fields, models, _
from odoo.exceptions import UserError


class Event(models.Model):
    _inherit = 'event.event'

    is_seat_booking = fields.Boolean("Is Seat Booking ?")
    booked_seat_ids = fields.One2many(
        'event.booked.seat', 'event_id', string="Booked Seat List")


class AvialbleSeatSelection(models.Model):
    _name = 'available.seat.selection'
    _description = 'Available Seat Selection'

    name = fields.Char("Seat Column")

    _sql_constraints = [
        ('name_uniq', 'unique (name)', 'Seat Already exist !')
    ]


class EventRegistration(models.Model):
    _inherit = 'event.registration'

    seat_no = fields.Char("Seat No")

    def action_confirm(self):
        booked_seat_list = []
        for rec in self:
            # check event is is_seat_booking and check ticket type and then check booking available or not
            if rec.event_id.is_seat_booking and rec.event_ticket_id and rec.seat_no:
                seat_no = rec.seat_no
                row = seat_no.split(' ')[0]
                col = seat_no.split(' ')[1]
                booked_seat = row[1:]+'_'+col[1:]
                #check booked seat is available or not
                BookedSeat = self.env['event.booked.seat']

                booked_seat_data = BookedSeat.sudo().search([('name', '=', booked_seat), (
                    'event_id', '=', rec.event_id.id), ('event_ticket_id', '=', rec.event_ticket_id.id)], limit=1)
                if booked_seat_data:
                    for booked_seat in booked_seat_data:
                        booked_seat_list.append(booked_seat.seat_no)

                BookedSeat.sudo().create({'name': booked_seat,
                                          'event_id': rec.event_id.id,
                                          'event_ticket_id': rec.event_ticket_id.id
                                          })

        if (len(booked_seat_list) > 0):
            raise UserError("Seats Not Available:  %s " % (booked_seat_list))
        return super(EventRegistration, self).action_confirm()

    def action_cancel(self):

        # Release that seat for other participat
        if self.seat_no and self.event_id and self.event_ticket_id:
            seat_no = self.seat_no
            row = seat_no.split(' ')[0]
            col = seat_no.split(' ')[1]
            booked_seat = row[1:]+'_'+col[1:]
            booked_seat_rec = self.env['event.booked.seat'].sudo().search([('name', '=', booked_seat), (
                'event_id', '=', self.event_id.id), ('event_ticket_id', '=', self.event_ticket_id.id)], limit=1)
            if booked_seat_rec:
                booked_seat_rec.unlink()
        self.write({'state': 'cancel'})


class EventSeatingArrangement(models.Model):
    _name = 'event.seat.arrangement'
    _description = "Event Seat Arrangement"

    event_ticket_id = fields.Many2one(
        'event.event.ticket', string="Ticket Type")
    row = fields.Integer("Row No")
    sequence = fields.Integer(string='Sequence', default=1)
    seat_selection_ids = fields.Many2many(
        'available.seat.selection', string="Column Selection")
    
    def clear_row(self):
        self.write({'seat_selection_ids':[(6,0,[])]})
        view = self.env.ref(
            'sh_event_seat_booking.sh_event_seat_arrangement_form')
        return {
            'name': _('Seat Arrangement'),
            'type': 'ir.actions.act_window',
            "res_model": "event.event.ticket",
            'views': [(view.id, 'form')],
            'view_mode': 'form',
            "res_id": self.event_ticket_id.id,
            'view_id': view.id,
            "target": "new",
        }

        
        
        


class BookedSeat(models.Model):
    _name = 'event.booked.seat'
    _description = "Event Booked Seat"

    name = fields.Char("Booked Seat")
    seat_no = fields.Char("Booked Seat No", compute='get_seat_no')
    event_ticket_id = fields.Many2one(
        'event.event.ticket', string="Ticket Type")
    event_id = fields.Many2one('event.event', string="Event")

    @api.depends('name')
    def get_seat_no(self):
        for rec in self:
            rec.seat_no = ''
            if rec.name:
                rec.seat_no = 'R' + \
                    rec.name.split('_')[0]+' S'+rec.name.split('_')[1]


class EventTicket(models.Model):
    _inherit = 'event.event.ticket'

    row_count = fields.Integer("Row")
    col_count = fields.Integer("Column")
    sequence = fields.Integer(string='Sequence', default=10)
    seat_arrangement_ids = fields.One2many(
        'event.seat.arrangement', 'event_ticket_id', string="Event Seat Arrangement")
    add_blank_row = fields.Boolean("Want to add blank row after each row ?")
    add_blank_col = fields.Boolean("Want to add blank Seat after each Seat ?")

    @api.onchange('row_count', 'col_count', 'seat_arrangement_ids')
    def _onchange_max_available_seat(self):
        self.seats_max = self.row_count * self.col_count
        if self.seat_arrangement_ids:
            col = 0
            for arrangement_row in self.seat_arrangement_ids:
                col += len(arrangement_row.seat_selection_ids.ids)
            if col > 0:
                self.seats_max = col

    def clear_arrangement(self):
        self.ensure_one()
        self.seat_arrangement_ids.unlink()
        view = self.env.ref(
            'sh_event_seat_booking.sh_event_seat_arrangement_form')
        return {
            'name': _('Seat Arrangement'),
            'type': 'ir.actions.act_window',
            "res_model": "event.event.ticket",
            'views': [(view.id, 'form')],
            'view_mode': 'form',
            "res_id": self.id,
            'view_id': view.id,
            "target": "new",
        }

    def prepare_arrangement(self):
        if self.row_count <= 0 or self.col_count <= 0:
            raise UserError(
                "Please Enter Total Row and Max seat in Single Row.")

        i = 1

        # get last row
        pervious_ticket = self.search([('event_id', '=', self.event_id.id), (
            'sequence', '<', self.sequence)], order='sequence desc', limit=1)
        if pervious_ticket:
            last_row = pervious_ticket.seat_arrangement_ids.sorted(
                lambda n: n.row, reverse=True)[:1]
            i = last_row.row + 1
        j = 1

        data_list = []
        odd_counter = 0
            
        for row in range(self.row_count):
            row_dic = {}
            col_list = []
            j = 1
            odd_counter += 1
            seat_col_counter = 0
            for col in range(self.col_count):
                seat_col_counter += 1 
                seat_avail = self.env['available.seat.selection'].sudo().search(
                    [('name', '=', j)], limit=1)
                if not seat_avail:
                    seat_avail = self.env['available.seat.selection'].sudo().create({
                        'name': j})
                if self.add_blank_col:
                    if seat_col_counter % 2 != 0:
                        col_list.append(seat_avail.id)
                else:
                    col_list.append(seat_avail.id)
                j += 1
            row_dic['row'] = i
            if self.add_blank_row and self.add_blank_col:
                if odd_counter % 2 != 0:
                    row_dic['seat_selection_ids'] = [(6, 0, col_list)]
            elif self.add_blank_row and not self.add_blank_col:
                if odd_counter % 2 != 0:
                    row_dic['seat_selection_ids'] = [(6, 0, col_list)]
            else:
                row_dic['seat_selection_ids'] = [(6, 0, col_list)]
            i += 1
            data_list.append((0, 0, row_dic))
            
       
        self.seat_arrangement_ids = data_list
        
        if self.seat_arrangement_ids:
            col = 0
            for arrangement_row in self.seat_arrangement_ids:
                col += len(arrangement_row.seat_selection_ids.ids)
            if col > 0:
                self.seats_max = col
                
                
        view = self.env.ref(
            'sh_event_seat_booking.sh_event_seat_arrangement_form')
        return {
            'name': _('Seat Arrangement'),
            'type': 'ir.actions.act_window',
            "res_model": "event.event.ticket",
            'views': [(view.id, 'form')],
            'view_mode': 'form',
            "res_id": self.id,
            'view_id': view.id,
            "target": "new",
        }

    def sh_seat_arrangement_action(self):
        view = self.env.ref(
            'sh_event_seat_booking.sh_event_seat_arrangement_form')
        return {
            'name': _('Seat Arrangement'),
            'type': 'ir.actions.act_window',
            'view_mode': 'form',
            'res_model': 'event.event.ticket',
            'views': [(view.id, 'form')],
            'view_id': view.id,
            'target': 'new',
            'res_id': self.id,

        }
