
from dateutil.relativedelta import relativedelta

from odoo import api, fields, models


class StatementCommon(models.AbstractModel):

    _name = "statement.common.holos.wizard"
    _description = "Statement Reports Common Holos Wizard"

    name = fields.Char()
    company_id = fields.Many2one(comodel_name="res.company", default=lambda self: self.env.company, string="Compañía", required=True)
    date_end = fields.Date(required=True, default=fields.Date.context_today, string="Fecha Final")
    show_aging_buckets = fields.Boolean(default=True, string="Mostrar rangos antigüedad")
    number_partner_ids = fields.Integer(default=lambda self: len(self._context["active_ids"]))
    filter_partners_non_due = fields.Boolean(string="No mostrar clientes sin asientos vencidos", default=True)
    filter_negative_balances = fields.Boolean("Excluir saldos negativos", default=True)

    aging_type = fields.Selection([("days", "Antigüedad en Días"), ("months", "Antigüedad en Meses")], string="Tipo de antigüedad",
                                  default="days", required=True)

    account_type = fields.Selection([("receivable", "A Cobrar"), ("payable", "A Pagar")], string="Tipo de cuenta",
                                    default="receivable")

    @api.onchange("aging_type")
    def onchange_aging_type(self):
        if self.aging_type == "months":
            self.date_end = fields.Date.context_today(self).replace(
                day=1
            ) - relativedelta(days=1)
        else:
            self.date_end = fields.Date.context_today(self)

    def _prepare_statement(self):
        self.ensure_one()
        return {
            "date_end": self.date_end,
            "company_id": self.company_id.id,
            "partner_ids": self._context["active_ids"],
            "show_aging_buckets": self.show_aging_buckets,
            "filter_non_due_partners": self.filter_partners_non_due,
            "account_type": self.account_type,
            "aging_type": self.aging_type,
            "filter_negative_balances": self.filter_negative_balances,
        }

    def button_export_html(self):
        self.ensure_one()
        report_type = "qweb-html"
        return self._export(report_type)

    def button_export_pdf(self):
        self.ensure_one()
        report_type = "qweb-pdf"
        return self._export(report_type)

    def button_export_xlsx(self):
        self.ensure_one()
        report_type = "xlsx"
        return self._export(report_type)
