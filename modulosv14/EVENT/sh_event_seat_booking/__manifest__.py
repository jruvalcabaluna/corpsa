# Copyright (C) Softhealer Technologies.

{
    'name': "Event Seat Booking",
    'author': "Softhealer Technologies",
    'website': "http://www.softhealer.com",
    'support': "support@softhealer.com",
    'category': 'website',
    "license": "OPL-1",
    'summary': "Website Event Ticket,  Event Seat Management, Online Event Ticket Booking, Event Ticket Booking Module, Event Seat arrangement, Website Event Registration, Dynamic Seating arrangement, Seat Booking, Ticket Booking, Event Management Website Odoo",
    'description': """Online event ticket helps to execute the events properly and efficiently. Online ticket booking reduces double bookings & mismanagement. This module helps you to book events such as seminars, conferences, formal parties, concerts, appointments & conventions. The event manager can add different types of tickets/screens in the backend for any event. The event manager can arrange the seat as per need and they can know the name of every participant with full details. An event manager can switch seats before registration confirmation. The attendances have to select just seats with the total price. After that, registration and last is payment. Hurray! Event Seat Booking Management Odoo, Event Management Odoo, Event Ticket On Website, Event Ticket Booking Module, Event Seating Management, Event Seat arrangement, Online Event Ticket Booking, Event Registration On Website, Dynamic Seating arrangement Odoo, Website Event Ticket,  Event Seat Management, Online Event Ticket Booking, Event Ticket Booking Module, Event Seat arrangement, Website Event Registration, Dynamic Seating arrangement, Event Booking, Seat Booking, Ticket Booking, Event Management Website Odoo""",
    'version': '14.0.4',

    'depends': [ 'event_sale', 'website_event_sale', 'website_event_questions'],
    'data': [

        'security/ir.model.access.csv',
        'views/assets.xml',
        "views/event_booking_view.xml",
        'views/website_seat_booking.xml',
        'views/website_event_view.xml',
        'data/website_score.xml',
        "views/event_view.xml",
    ],
    'qweb': ['static/src/xml/*.xml'],
    'demo': [],
    'installable': True,
    'auto_install': False,
    'images': ['static/description/background.png', ],
    "price": 120,
    "currency": "EUR"
}
