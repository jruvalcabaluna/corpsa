# Copyright 2016-2018 Tecnativa - Carlos Dauden
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Account Financial Risk 8a",
    "summary": "Manage customer risk",
    "version": "14.0.2.1.0",
    "category": "Accounting",
    "license": "AGPL-3",
    "depends": ["account", "sale", "account_financial_risk", "sale_financial_risk"],
    "data": [
        # "security/security.xml",
        # "security/ir.model.access.csv",
        "views/sale_order_view.xml",
        "wizards/partner_risk_exceeded_view.xml",
        # "templates/assets.xml",
    ],
    "installable": True,
}
