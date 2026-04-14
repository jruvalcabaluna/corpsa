
from odoo import fields, models


class SaleReport(models.Model):
    _inherit = "sale.report"

    user_code = fields.Char('Sucursal Code', readonly=True)
    short_name = fields.Char('Nombre Corto', readonly=True)
    effective_date = fields.Date('Fecha Efectiva', readonly=True)

    invoice_status = fields.Selection([
        ('upselling', 'Oportunidad de Upselling'),
        ('invoiced', 'Facturado'),
        ('to invoice', 'A facturar'),
        ('no', 'Nada que facturar')
        ], string='Estado Factura', readonly=True)

    def _query(self, with_clause='', fields=None, groupby='', from_clause=''):
        if fields is None:
            fields = {}
        select_str = """ ,
            s.user_code as user_code
        """
        select_str2 = """ ,
            t.name as short_name
        """
        select_str3 = """ ,
            s.invoice_status as invoice_status
        """
        select_str4 = """ ,
                    s.effective_date as effective_date
                """
        fields.update({
            'user_code': select_str,
            'short_name': select_str2,
            'invoice_status': select_str3,
            'effective_date': select_str4,
        })
        groupby += """,
            s.invoice_status,
            s.user_code,
            t.name,
            s.effective_date
        """
        return super()._query(with_clause=with_clause, fields=fields,
                              groupby=groupby, from_clause=from_clause)
