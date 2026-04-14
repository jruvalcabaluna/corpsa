from odoo import api, fields, models, _


class ProductTemplate(models.Model):
    _inherit = 'product.template'

    min_margin_result = fields.Float('%', compute='_compute_min_margin_result', help='Diferencia', )

    min_price = fields.Float('Precio minimo', compute='_compute_min_price',
                             help='Margen entre precio de venta vs Costo Reposición')

    cost_repo = fields.Float('Costo reposición', help='Costo de reposición')
    min_margin_product = fields.Float('Margen minimo', help='Margen mínimo')

    replenishment_margin = fields.Float('% Util. UC', compute='_compute_replenishment_margin',
                                        help='Margen entre precio de venta vs Ultimo costo')

    real_margin = fields.Float('% Util. CP', compute='_compute_real_margin',
                               help='Margen entre precio de venta vs Costo Promedio')

    repo_margin = fields.Float('% Util. Repo', compute='_compute_repo_margin', store=True,
                               help='Margen entre precio de venta vs Costo Reposición')



    # @api.onchange('min_margin_result')
    # @api.depends('repo_margin')
    # @api.onchange('repo_margin')
    # def onchange_min_margin_result(self):
    #     for product in self:
    #         normal = self.env['product.state'].search([('code', '=', 0)])
    #         des = self.env['product.state'].search([('code', '=', 1)])
    #
    #
    #         if product.min_margin_product < product.repo_margin:
    #             product.write({"product_state_id": des})
    #         elif product.min_margin_product >= product.repo_margin:
    #             product.write({"product_state_id": normal})


            # if product.min_margin_result >= 0:
            #     product.write({"product_state_id": normal})
            # else:
            #     product.write({"product_state_id": des})

    def _compute_replenishment_margin(self):
        for product in self:
            if product.list_price and product.last_purchase_price:
                product.replenishment_margin = (product.list_price - product.last_purchase_price) / product.list_price
            else:
                product.replenishment_margin = 0

    def _compute_real_margin(self):
        for product in self:
            if product.list_price and product.standard_price:
                product.real_margin = (product.list_price - product.standard_price) / product.list_price
            else:
                product.real_margin = 0

    @api.depends('cost_repo')
    def _compute_repo_margin(self):
        for product in self:
            if product.list_price and product.cost_repo:
                product.repo_margin = (product.list_price - product.cost_repo) / product.list_price
                #ToDo Validation State
                normal = self.env['product.state'].search([('code', '=', 0)])
                des = self.env['product.state'].search([('code', '=', 1)])
                if product.min_margin_product > product.repo_margin:
                    product.write({"product_state_id": des})
                elif product.min_margin_product <= product.repo_margin:
                    product.write({"product_state_id": normal})
            else:
                product.repo_margin = 0

    def _compute_min_margin_result(self):
        for product in self:
            if product.repo_margin and product.min_margin_product:
                product.min_margin_result = (product.repo_margin - product.min_margin_product)
            else:
                product.min_margin_result = 0

    def _compute_min_price(self):
        for product in self:
            if product.min_margin_product:
                product.min_price = (product.cost_repo / (1 - product.min_margin_product))
            else:
                product.min_margin_result = 0
