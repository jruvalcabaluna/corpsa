# Copyright 2020 - holosERP
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Bemci holos",
    "summary": """
        This module extends the Bemci holos module.""",
    "version": "1.0",
    "license": "AGPL-3",
    "category": "Account Payment",
    "depends": ["account"],
    "data": [
        "security/ir.model.access.csv",
        "views/account_payment.xml",
    ],
}
