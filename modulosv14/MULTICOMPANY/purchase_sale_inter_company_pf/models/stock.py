from odoo import _, fields, models
from odoo.exceptions import UserError

class StockPicking(models.Model):
    _inherit = "stock.picking"

    intercompany_picking_id = fields.Many2one(comodel_name="stock.picking")

    def _action_done(self):
        print('1.enter to picking')
        # Only DropShip pickings
        po_picks = self.browse()
        print('2.po_picks **browse de pickings', po_picks)
        for pick in self.filtered(lambda x: x.location_dest_id.usage == "customer").sudo(): #for search stock.picking with usage customer
            print('3.pick **search id stock.picking with usage customer', pick)
            purchase = pick.sale_id.auto_purchase_order_id #id from purchase
            print('4.purchase', purchase)
            if not purchase: #if not id from purchase **SKIP
                continue
            purchase.picking_ids.write({"intercompany_picking_id": pick.id}) #assign id from 'stock.picking' (SALE) to 'stock.picking' (PURCHASE)
            print('5.purchase.picking_ids', purchase.picking_ids)
            for move_line in pick.move_line_ids: #for 'stock.move.line' in stock picking OUT
                print('6.move_line', move_line)
                qty_done = move_line.qty_done #assign qty done to move_line
                sale_line_id = move_line.move_id.sale_line_id
                print('7.sale_line_id',sale_line_id)
                po_move_lines = sale_line_id.auto_purchase_line_id.move_ids.mapped("move_line_ids") #id from 'stock.move.line' IN
                print('8.po_move_lines',po_move_lines)
                for po_move_line in po_move_lines: #for lines (po_move_lines) id from 'stock.move.line' IN
                    print('9.po_move_line',po_move_line)
                    if po_move_line.product_qty >= qty_done:
                        po_move_line.qty_done = qty_done
                        qty_done = 0.0
                    else:
                        po_move_line.qty_done = po_move_line.product_qty
                        qty_done -= po_move_line.product_qty
                    po_picks |= po_move_line.picking_id
                    print('10.po_picks',po_picks)
                if qty_done and po_move_lines:
                    po_move_lines[-1:].qty_done += qty_done
                elif not po_move_lines:
                    raise UserError(
                        _(
                            "There's no corresponding line in PO %s for assigning "
                            "qty from %s for product %s"
                        )
                        % (purchase.name, pick.name, move_line.product_id.name)
                    )
        # Transfer dropship pickings
        # for po_pick in po_picks.sudo():
        #     print('11.po_pick',po_pick)
        #     po_pick.with_context(with_company=po_pick.company_id.id,)._action_done()
        # return super(StockPicking, self)._action_done()
        #custom PF only Confirm in the Purchase Order
        for po_pick in po_picks.sudo():
            print('11.po_pick',po_pick)
            po_pick.with_context(with_company=po_pick.company_id.id,).action_confirm()
        return super(StockPicking, self)._action_done()