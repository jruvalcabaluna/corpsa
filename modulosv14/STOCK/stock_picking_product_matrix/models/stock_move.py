# -*- coding: utf-8 -*-
import json
from odoo import api, fields, models, _
from odoo.exceptions import ValidationError


class StockPicking(models.Model):
    _inherit = 'stock.picking'

    report_grids = fields.Boolean(string="Print Variant Grids", default=True,
                                  help="If set, the matrix of configurable products will be shown on the report of this order.")

    """ Matrix loading and update: fields and methods :

    NOTE: The matrix functionality was done in python, server side, to avoid js
        restriction.  Indeed, the js framework only loads the x first lines displayed
        in the client, which means in case of big matrices and lots of po_lines,
        the js doesn't have access to the 41st and following lines.

        To force the loading, a 'hack' of the js framework would have been needed...
    """

    grid_product_tmpl_id = fields.Many2one('product.template', store=False, help="Technical field for product_matrix functionalities.")
    grid_update = fields.Boolean(default=False, store=False, help="Whether the grid field contains a new matrix to apply or not.")
    grid = fields.Char(store=False, help="Technical storage of grid. \nIf grid_update, will be loaded on the PO. \nIf not, represents the matrix to open.")

    @api.onchange('grid_product_tmpl_id')
    def _set_grid_up(self):
        if self.grid_product_tmpl_id:
            self.grid_update = False
            self.grid = json.dumps(self._get_matrix(self.grid_product_tmpl_id))

    @api.onchange('grid')
    def _apply_grid(self):
        if self.grid and self.grid_update:
            grid = json.loads(self.grid)
            product_template = self.env['product.template'].browse(grid['product_template_id'])
            product_ids = set()
            dirty_cells = grid['changes']
            Attrib = self.env['product.template.attribute.value']
            default_sm_line_vals = {}
            new_lines = []
            for cell in dirty_cells:
                combination = Attrib.browse(cell['ptav_ids'])
                no_variant_attribute_values = combination - combination._without_no_variant_attributes()

                # create or find product variant from combination
                product = product_template._create_product_variant(combination)
                # TODO replace the check on product_id by a first check on the ptavs and pnavs?
                # and only create/require variant after no line has been found ???
                order_lines = self.move_line_ids_without_package.filtered(lambda line: (line._origin or line).product_id == product and (line._origin or line).product_no_variant_attribute_value_ids == no_variant_attribute_values)

                # if product variant already exist in order lines
                old_qty = sum(order_lines.mapped('qty_done'))
                qty = cell['qty']
                diff = qty - old_qty

                if not diff:
                    continue

                product_ids.add(product.id)

                if order_lines:
                    if qty == 0:
                        if self.state in ['draft', 'sent']:
                            # Remove lines if qty was set to 0 in matrix
                            # only if ML state = draft/sent
                            self.move_line_ids_without_package -= order_lines
                        else:
                            order_lines.update({'qty_done': 0.0})
                    else:
                        """
                        When there are multiple lines for same product and its quantity was changed in the matrix,
                        An error is raised.
                        A 'good' strategy would be to:
                            * Sets the quantity of the first found line to the cell value
                            * Remove the other lines.
                        But this would remove all business logic linked to the other lines...
                        Therefore, it only raises an Error for now.
                        """
                        if len(order_lines) > 1:
                            raise ValidationError(_("You cannot change the quantity of a product present in multiple purchase lines."))
                        else:
                            order_lines[0].qty_done = qty
                            # order_lines[0]._onchange_quantity()
                            # If we want to support multiple lines edition:
                            # removal of other lines.
                            # For now, an error is raised instead
                            # if len(order_lines) > 1:
                            #     # Remove 1+ lines
                            #     self.order_line -= order_lines[1:]
                else:
                    if not default_sm_line_vals:
                        MoveLine = self.env['stock.move.line']
                        default_sm_line_vals = MoveLine.default_get(MoveLine._fields.keys())
                    # last_sequence = self.move_line_ids_without_package[-1:].sequence
                    # if last_sequence:
                    #     default_sm_line_vals['sequence'] = last_sequence
                    new_lines.append((0, 0, dict(
                        default_sm_line_vals,
                        product_id=product.id,
                        qty_done=qty,
                        product_no_variant_attribute_value_ids=no_variant_attribute_values.ids)
                    ))
            if product_ids:
                res = False
                if new_lines:
                    # Add new ML lines
                    self.update(dict(move_line_ids_without_package=new_lines))
                # Recompute for new/modified lines:
                for line in self.move_line_ids_without_package.filtered(lambda line: line.product_id.id in product_ids):
                    line._onchange_product_id()
                    line._compute_product_qty()
                    line.write({
                        'location_id': self.location_id.id,
                        'location_dest_id': self.location_dest_id.id,
                    })
                return res

    def _get_matrix(self, product_template):
        def has_ptavs(line, sorted_attr_ids):
            ptav = line.product_template_attribute_value_ids.ids
            pnav = line.product_no_variant_attribute_value_ids.ids
            pav = pnav + ptav
            pav.sort()
            return pav == sorted_attr_ids
        matrix = product_template._get_template_matrix(company_id=self.company_id, currency_id=self.company_id.currency_id)
        if self.move_line_ids_without_package:
            lines = matrix['matrix']
            move_lines = self.move_line_ids_without_package.filtered(lambda l: l.product_template_id == product_template)
            for line in lines:
                for cell in line:
                    if not cell.get('name', False):
                        line = move_lines.filtered(lambda line: has_ptavs(line, cell['ptav_ids']))
                        if line:
                            cell.update({
                                'qty': sum(line.mapped('qty_done'))
                            })
        return matrix

    def get_report_matrixes(self):
        """Reporting method."""
        matrixes = []
        if self.report_grids:
            grid_configured_templates = self.move_line_ids_without_package.filtered('is_configurable_product').product_template_id
            # TODO is configurable product and product_variant_count > 1
            # configurable products are only configured through the matrix in purchase, so no need to check product_add_mode.
            for template in grid_configured_templates:
                if len(self.move_line_ids_without_package.filtered(lambda line: line.product_template_id == template)) > 1:
                    matrixes.append(self._get_matrix(template))
        return matrixes


class StockMoveLine(models.Model):
    _inherit = "stock.move.line"

    product_template_id = fields.Many2one('product.template', string='Product Template',
                                          related="product_id.product_tmpl_id")
    is_configurable_product = fields.Boolean('Is the product configurable?',
                                             related="product_template_id.has_configurable_attributes")
    product_template_attribute_value_ids = fields.Many2many(related='product_id.product_template_attribute_value_ids',
                                                            readonly=True)
    product_no_variant_attribute_value_ids = fields.Many2many('product.template.attribute.value',
                                                              string='Product attribute values that do not create variants',
                                                              ondelete='restrict')
