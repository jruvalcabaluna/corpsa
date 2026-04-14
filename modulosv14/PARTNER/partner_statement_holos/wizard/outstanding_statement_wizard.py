
from odoo import models


class OutstandingStatementWizard(models.TransientModel):
    """Outstanding Statement wizard."""

    _name = "outstanding.statement.holos.wizard"
    _inherit = "statement.common.holos.wizard"
    _description = "Outstanding Statement Holos Wizard"

    def _print_report(self, report_type):
        self.ensure_one()
        data = self._prepare_statement()
        if report_type == "xlsx":
            report_name = "p_s.report_outstanding_statement_holos_xlsx"
        else:
            report_name = "partner_statement_holos.outstanding_statement_holos"
        return (
            self.env["ir.actions.report"]
            .search(
                [("report_name", "=", report_name), ("report_type", "=", report_type)],
                limit=1,
            )
            .report_action(self, data=data)
        )

    def _export(self, report_type):
        """Default export is PDF."""
        return self._print_report(report_type)
