
from odoo import api, models, fields, _
from odoo.exceptions import UserError

class SaleOrder(models.Model):
    _inherit = 'sale.order'

    def action_confirm(self):
        self.ensure_one()
        charges = []
        for rec in self:
        	for line in self.order_line:
        		if line.product_id.categ_id.name == 'CARGOS':
        			charges.append(line.id)
        if len(charges) > 0:
        	return super(SaleOrder, self).action_confirm()

        self.add_charges()
        return super(SaleOrder, self).action_confirm()

    def add_charges(self):
        charge_ids = []
        charges = []
        for line in self.order_line:
            cont = 0
            if line.product_id.charge_product_id:
                if line.product_id.charge_product_id.id not in charge_ids:
                    charge_ids.append(line.product_id.charge_product_id.id)
                while cont < line.product_uom_qty:
                    charges.append(line.product_id.charge_product_id.id)
                    cont += 1

        print(charge_ids)
        for charge in charge_ids:
            total = 0
            qty = 0
            charge_id = self.env['product.product'].search([('id','=',charge)])
            taxes = []
            for tax in line.product_id.charge_product_id.taxes_id:
                taxes.append(tax.id)
            line_vals = {'product_id': charge_id.id,
                        'name': charge_id.name,
                        'product_uom_qty': charges.count(charge),
                        'product_uom': charge_id.uom_id.id,
                        'price_unit': charge_id.lst_price,
                        'order_id': self.id,
                        'tax_id': [(6, 0, taxes)],
                        'garantia': True,
                        }
            charge_line_id = self.env['sale.order.line'].sudo().create(line_vals)

    def update_discount(self):
        for line in self.order_line:
            for tarifa in self.pricelist_id.item_ids:
                print(tarifa.compute_price)
            #if not line.garantia:

class SaleOrderLine(models.Model):
    _inherit = 'sale.order.line'

    garantia = fields.Boolean('Garantía')
    desc2 = fields.Float('Descuento 2')

    @api.onchange('discount')
    def onchange_discount(self):
        self.desc2 = self.discount
        print(self.desc2)

    @api.model_create_multi
    def create(self, vals_list):
        cont = 0
        while cont < len(vals_list):
            vals_list[cont].update({'discount': vals_list[cont].get('desc2')})
            cont += 1
        print(vals_list)
        print(self.env.context)
        line = super(SaleOrderLine, self).create(vals_list)
        return line
        
class AccountJournal(models.Model):
    _inherit = 'account.journal'
    mx_cfdi_ppd = fields.Boolean('Metodo de pago (PPD)') 

    def _create_secure_sequence(self, sequence_fields):
        """This function creates a no_gap sequence on each journal in self that will ensure
        a unique number is given to all posted account.move in such a way that we can always
        find the previous move of a journal entry on a specific journal.
        """
        for journal in self:
            vals_write = {}
            for seq_field in sequence_fields:
                if not journal[seq_field]:
                    vals = {
                        'name': _('Securisation of %s - %s') % (seq_field, journal.name),
                        'code': 'SECUR%s-%s' % (journal.id, seq_field),
                        'implementation': 'no_gap',
                        'prefix': '',
                        'suffix': '',
                        'padding': 0,
                        'company_id': journal.company_id.id}
                    seq = self.env['ir.sequence'].create(vals)
                    vals_write[seq_field] = seq.id
            if vals_write:
                journal.write(vals_write)

class PosPaymentMethod(models.Model):
    _inherit = 'pos.payment.method'

    mx_cfdi_ppd = fields.Boolean('Metodo de pago (PPD)') 
    mx_cfdi_payment_method_id = fields.Many2one('mx_cfdi.payment.method',
        string="Forma de pago",
        help="Indicates the way the invoice was/will be paid, where the options could be: "
             "Cash, Nominal Check, Credit Card, etc. Leave empty if unkown and the XML will show 'Unidentified'.",
        default=lambda self: self.env.ref('mx_cfdi.payment_method_otros', raise_if_not_found=False))

class PosPayment(models.Model):
    _inherit = 'pos.payment'

    amount = fields.Monetary(string='Amount', required=True, currency_field='currency_id', readonly=False, help="Total amount of the payment.")
