# -*- coding: utf-8 -*-
{
    "name": "Citas holos",
    "version": "14.0.0.0.1",
    "category": "Extra Tools",
    "application": True,
    "installable": True,
    "auto_install": False,
    "depends": [
        "calendar",
    ],
    "data": [
        "security/ir.model.access.csv",
        "views/appointment_resource_views.xml",
        "views/appointment_type_views.xml",
        "views/calendar_event_views.xml",
        "views/menu.xml",
        "views/res_partner_views.xml",
    ],
    "qweb": [
    ],
    "summary": "The tool for booking appointment to sale and reviews",
    "description": """
        The tool for booking appointment to sale and reviews
    """,
}