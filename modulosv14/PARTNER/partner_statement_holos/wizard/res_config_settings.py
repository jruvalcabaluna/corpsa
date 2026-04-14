from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    group_activity_statement = fields.Boolean("Activar Informe hôlos Estado Cuenta", group="account.group_account_invoice",
                                              implied_group="partner_statement_holos.group_activity_statement_holos",)

    default_aging_type = fields.Selection([("days", "Antigüedad en Días"), ("months", "Antigüedad en Meses")],
        string="Tipo de Antigüedad", required=True, default="days", default_model="statement.common.holos.wizard")

    default_show_aging_buckets = fields.Boolean(string="Mostrar rangos antigüedad",
                                                default_model="statement.common.holos.wizard")

    default_filter_partners_non_due = fields.Boolean(string="Excluir clientes sin asientos vencidos",
                                                     default_model="statement.common.holos.wizard")

    default_filter_negative_balances = fields.Boolean("Excluir saldos negativos",
                                                      default_model="statement.common.holos.wizard")

    group_outstanding_statement = fields.Boolean("Activar Informe hôlos Pendientes Cuenta",
                                                 group="account.group_account_invoice",
                                                 implied_group="partner_statement_holos.group_outstanding_statement_holos")

    def set_values(self):
        self = self.with_context(active_test=False)
        # default values fields
        IrDefault = self.env["ir.default"].sudo()
        for name, field in self._fields.items():
            if (
                name.startswith("default_")
                and field.default_model == "statement.common.holos.wizard"
            ):
                if isinstance(self[name], models.BaseModel):
                    if self._fields[name].type == "many2one":
                        value = self[name].id
                    else:
                        value = self[name].ids
                else:
                    value = self[name]
                IrDefault.set("activity.statement.holos.wizard", name[8:], value)
                IrDefault.set("outstanding.statement.holos.wizard", name[8:], value)
        return super().set_values()
