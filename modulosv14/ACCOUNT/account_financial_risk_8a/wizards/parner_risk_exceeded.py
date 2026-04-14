
from odoo import _, fields, models

class PartnerRiskExceededWiz(models.TransientModel):
    _inherit = "partner.risk.exceeded.wiz"

    risk_currency_id = fields.Many2one(comodel_name="res.currency", related="partner_id.risk_currency_id")
    risk_sale_order = fields.Monetary(string="Total Sales Orders Not Invoiced", currency_field="risk_currency_id",
                                      related="partner_id.risk_sale_order")
    risk_sale_order_limit = fields.Monetary(string="Limit Sales Orders", currency_field="risk_currency_id",
                                            related="partner_id.risk_sale_order_limit")
    risk_invoice_draft = fields.Monetary(string="Total Draft Invoices", currency_field="risk_currency_id",
                                         related="partner_id.risk_invoice_draft")
    risk_invoice_open = fields.Monetary(string="Total Open Invoices/Principal Balance", currency_field="risk_currency_id",
                                        related="partner_id.risk_invoice_open")
    risk_invoice_unpaid = fields.Monetary(string="Total Unpaid Invoices/Principal Balance", currency_field="risk_currency_id",
                                          related="partner_id.risk_invoice_unpaid")
    risk_account_amount = fields.Monetary(string="Total Other Account Open Amount", currency_field="risk_currency_id",
                                          related="partner_id.risk_account_amount")
    risk_account_amount_unpaid = fields.Monetary(string="Total Other Account Unpaid Amount", currency_field="risk_currency_id",
                                                 related="partner_id.risk_account_amount_unpaid")
    risk_invoice_draft_limit = fields.Monetary(string="Limit In Draft Invoices", currency_field="risk_currency_id",
                                               related="partner_id.risk_invoice_draft_limit")
    risk_invoice_open_limit = fields.Monetary(string="Limit In Open Invoices/Principal Balance", currency_field="risk_currency_id",
                                              related="partner_id.risk_invoice_open_limit")
    risk_invoice_unpaid_limit = fields.Monetary(string="Limit In Unpaid Invoices/Principal Balance", currency_field="risk_currency_id",
                                                related="partner_id.risk_invoice_unpaid_limit")
    risk_account_amount_limit = fields.Monetary(string="Limit Other Account Open Amount", currency_field="risk_currency_id",
                                                related="partner_id.risk_account_amount_limit")
    risk_account_amount_unpaid_limit = fields.Monetary(string="Limit Other Account Unpaid Amount", currency_field="risk_currency_id",
                                                       related="partner_id.risk_account_amount_unpaid_limit")

    risk_total = fields.Monetary(string="Total Risk", currency_field="risk_currency_id",
                                 related="partner_id.risk_total")
    credit_limit = fields.Float(related="partner_id.credit_limit")