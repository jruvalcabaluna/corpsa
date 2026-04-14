
from odoo import api, models, fields, _
from odoo.exceptions import UserError

class PurchaseOrder(models.Model):
    _inherit = 'purchase.order'

    def button_confirm(self):
        self.ensure_one()
        charges = []
        for rec in self:
        	for line in self.order_line:
        		if line.product_id.categ_id.name == 'CARGOS':
        			charges.append(line.id)
        if len(charges) > 0:
        	return super(PurchaseOrder, self).button_confirm()

        self.add_charges()
        return super(PurchaseOrder, self).button_confirm()

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
                        'taxes_id': [(6, 0, taxes)],
                        'garantia': True,
                        }
            charge_line_id = self.env['purchase.order.line'].sudo().create(line_vals)

    def update_discount(self):
        for line in self.order_line:
            for tarifa in self.pricelist_id.item_ids:
                print(tarifa.compute_price)
            #if not line.garantia:

class PurchaseOrderLine(models.Model):
    _inherit = 'purchase.order.line'

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
        line = super(PurchaseOrderLine, self).create(vals_list)
        return line
        
