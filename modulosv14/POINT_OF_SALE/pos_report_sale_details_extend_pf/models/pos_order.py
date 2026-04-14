# -*- coding: utf-8 -*-
from datetime import timedelta
from odoo import api, fields, models, _
from odoo.osv.expression import AND

class ReportSaleDetails(models.AbstractModel):
    _inherit = 'report.point_of_sale.report_saledetails'

    @api.model
    def get_sale_details(self, date_start=False, date_stop=False, config_ids=False, session_ids=False):
        """ Serialise the orders of the requested time period, configs and sessions.

        :param date_start: The dateTime to start, default today 00:00:00.
        :type date_start: str.
        :param date_stop: The dateTime to stop, default date_start + 23:59:59.
        :type date_stop: str.
        :param config_ids: Pos Config id's to include.
        :type config_ids: list of numbers.
        :param session_ids: Pos Config id's to include.
        :type session_ids: list of numbers.

        :returns: dict -- Serialised sales.
        """
        domain = [('state', 'in', ['paid','invoiced','done'])]

        if (session_ids):
            domain = AND([domain, [('session_id', 'in', session_ids)]])
        else:
            if date_start:
                date_start = fields.Datetime.from_string(date_start)
            else:
                # start by default today 00:00:00
                user_tz = pytz.timezone(self.env.context.get('tz') or self.env.user.tz or 'UTC')
                today = user_tz.localize(fields.Datetime.from_string(fields.Date.context_today(self)))
                date_start = today.astimezone(pytz.timezone('UTC'))

            if date_stop:
                date_stop = fields.Datetime.from_string(date_stop)
                # avoid a date_stop smaller than date_start
                if (date_stop < date_start):
                    date_stop = date_start + timedelta(days=1, seconds=-1)
            else:
                # stop by default today 23:59:59
                date_stop = date_start + timedelta(days=1, seconds=-1)

            domain = AND([domain,
                [('date_order', '>=', fields.Datetime.to_string(date_start)),
                ('date_order', '<=', fields.Datetime.to_string(date_stop))]
            ])

            if config_ids:
                domain = AND([domain, [('config_id', 'in', config_ids)]])

        orders = self.env['pos.order'].search(domain)
        user_currency = self.env.company.currency_id
        total = 0.0
        products_sold = {}
        taxes = {}
        for order in orders:
            if user_currency != order.pricelist_id.currency_id:
                total += order.pricelist_id.currency_id._convert(
                    order.amount_total, user_currency, order.company_id, order.date_order or fields.Date.today())
            else:
                total += order.amount_total
            currency = order.session_id.currency_id

            for line in order.lines:
                key = (line.product_id, line.price_unit, line.discount)
                products_sold.setdefault(key, 0.0)
                products_sold[key] += line.qty

                if line.tax_ids_after_fiscal_position:
                    line_taxes = line.tax_ids_after_fiscal_position.compute_all(line.price_unit * (1-(line.discount or 0.0)/100.0), currency, line.qty, product=line.product_id, partner=line.order_id.partner_id or False)
                    for tax in line_taxes['taxes']:
                        taxes.setdefault(tax['id'], {'name': tax['name'], 'tax_amount':0.0, 'base_amount':0.0})
                        taxes[tax['id']]['tax_amount'] += tax['amount']
                        taxes[tax['id']]['base_amount'] += tax['base']
                else:
                    taxes.setdefault(0, {'name': _('No Taxes'), 'tax_amount':0.0, 'base_amount':0.0})
                    taxes[0]['base_amount'] += line.price_subtotal_incl

        payment_ids = self.env["pos.payment"].search([('pos_order_id', 'in', orders.ids)]).ids
        if payment_ids:
            self.env.cr.execute("""
                SELECT method.name, sum(amount) total
                FROM pos_payment AS payment,
                     pos_payment_method AS method
                WHERE payment.payment_method_id = method.id
                    AND payment.id IN %s
                GROUP BY method.name
            """, (tuple(payment_ids),))
            payments = self.env.cr.dictfetchall()
        else:
            payments = []


#--------------------------------------------------------------------------------------------------------------------------------------------------
        domain_picking = [('state', 'in', ['done']),('location_id', '!=', 5)]
        config_picking_type = self.env['pos.config'].browse(config_ids[0]).picking_type_id
        domain_picking = AND([domain_picking, [('picking_type_id', '=', config_picking_type.id)]])
        if (session_ids):
            domain_picking = AND([domain_picking, [('pos_session_id', 'in', session_ids)]])
        else:
            if date_start:
                date_start = fields.Datetime.from_string(date_start)
            else:
                # start by default today 00:00:00
                user_tz = pytz.timezone(self.env.context.get('tz') or self.env.user.tz or 'UTC')
                today = user_tz.localize(fields.Datetime.from_string(fields.Date.context_today(self)))
                date_start = today.astimezone(pytz.timezone('UTC'))
            if date_stop:
                date_stop = fields.Datetime.from_string(date_stop)
                # avoid a date_stop smaller than date_start
                if (date_stop < date_start):
                    date_stop = date_start + timedelta(days=1, seconds=-1)
            else:
                # stop by default today 23:59:59
                date_stop = date_start + timedelta(days=1, seconds=-1)
            domain_picking = AND([domain_picking,
                [('date', '>=', fields.Datetime.to_string(date_start)),
                ('date', '<=', fields.Datetime.to_string(date_stop))]
            ])

        pickings = self.env['stock.picking'].search(domain_picking)
        print(pickings)
        total_picking = 0.0
        products_picking = {}
        for picking in pickings:
            # total_picking += picking.amount_total
            for line in picking.move_lines:
                key = (line.product_id)
                products_picking.setdefault(key, 0.0)
                products_picking[key] += line.quantity_done
#--------------------------------------------------------------------------------------------------------------------------------------------------
        domain_picking_dev = [('state', 'in', ['done']),('location_id', '=', 5)]
        config_picking_type = self.env['pos.config'].browse(config_ids[0]).picking_type_id
        domain_picking_dev = AND([domain_picking_dev, [('picking_type_id', '=', config_picking_type.id)]])
        if (session_ids):
            domain_picking_dev = AND([domain_picking_dev, [('pos_session_id', 'in', session_ids)]])
        else:
            if date_start:
                date_start = fields.Datetime.from_string(date_start)
            else:
                # start by default today 00:00:00
                user_tz = pytz.timezone(self.env.context.get('tz') or self.env.user.tz or 'UTC')
                today = user_tz.localize(fields.Datetime.from_string(fields.Date.context_today(self)))
                date_start = today.astimezone(pytz.timezone('UTC'))
            if date_stop:
                date_stop = fields.Datetime.from_string(date_stop)
                # avoid a date_stop smaller than date_start
                if (date_stop < date_start):
                    date_stop = date_start + timedelta(days=1, seconds=-1)
            else:
                # stop by default today 23:59:59
                date_stop = date_start + timedelta(days=1, seconds=-1)
            domain_picking_dev = AND([domain_picking_dev,
                [('date', '>=', fields.Datetime.to_string(date_start)),
                ('date', '<=', fields.Datetime.to_string(date_stop))]
            ])

        pickings_dev = self.env['stock.picking'].search(domain_picking_dev)
        print(pickings_dev)
        total_picking_dev = 0.0
        products_picking_dev = {}
        for picking_dev in pickings_dev:
            # total_picking += picking.amount_total
            for line in picking_dev.move_lines:
                key = (line.product_id)
                products_picking_dev.setdefault(key, 0.0)
                products_picking_dev[key] += line.quantity_done
#--------------------------------------------------------------------------------------------------------------------------------------------------

        return {
            'currency_precision': user_currency.decimal_places,
            'total_paid': user_currency.round(total),
            'payments': payments,
            'company_name': self.env.company.name,
            'taxes': list(taxes.values()),

            'products_picking': sorted([{
                'product_id': product.id,
                'product_name': product.name,
                'code': product.default_code,
                'quantity_done': quantity_done,
            } for (product), quantity_done in products_picking.items()], key=lambda l: l['product_name']),

            'products_picking_dev': sorted([{
                'product_id': product.id,
                'product_name': product.name,
                'code': product.default_code,
                'quantity_done': quantity_done,
            } for (product), quantity_done in products_picking_dev.items()], key=lambda l: l['product_name']),

            'products': sorted([{
                'product_id': product.id,
                'product_name': product.name,
                'code': product.default_code,
                'quantity': qty,
                'price_unit': price_unit,
                'discount': discount,
                'uom': product.uom_id.name
            } for (product, price_unit, discount), qty in products_sold.items()], key=lambda l: l['product_name'])
        }