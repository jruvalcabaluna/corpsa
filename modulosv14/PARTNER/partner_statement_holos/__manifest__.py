
{
    "name": "Estado de Cuenta Cliente hôlos",
    "version": "14.0.1.2.0",
    "category": "Accounting & Finance",
    "license": "AGPL-3",
    "depends": ["account", "report_xlsx", "report_xlsx_helper"],
    "data": [
        "security/ir.model.access.csv",
        "security/statement_security.xml",
        "views/activity_statement.xml",
        "views/outstanding_statement.xml",
        "views/assets.xml",
        "views/aging_buckets.xml",
        "views/res_config_settings.xml",
        "wizard/statement_wizard.xml",
    ],
    "installable": True,
    "application": False,
}
