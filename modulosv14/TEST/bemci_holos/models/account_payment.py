from odoo import fields, models

class AccountPayment(models.Model):

    _inherit = "account.payment"

    relation_ids = fields.One2many('account.payment.invoices', 'relation_id', string="Relación")


class AccountPaymentInvoices(models.Model):

    _name = "account.payment.invoices"
    _description = "Relación"

    name = fields.Char('Folio')
    amount = fields.Float()

    relation_id = fields.Many2one('account.payment', string='Relación facturas', ondelete='cascade', index=True)