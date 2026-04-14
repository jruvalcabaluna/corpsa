from odoo import fields, models


class ProductBrand(models.Model):
    _inherit = "product.brand"

    item_ids = fields.One2many('product.brand.item', 'brand_id', 'Brand Items',copy=True)


class ProductBrandItem(models.Model):
    _name = "product.brand.item"
    _description = "Brand Items"

    brand_id = fields.Many2one('product.brand', 'Product Brand', index=True, ondelete='cascade')
    month = fields.Float(string="Month")
    percentage = fields.Float(string="Percentage")
    use_type = fields.Selection([
        ('commercial', 'Commercial'),
        ('particular', 'Particular')], default="particular", required=True, string="Use Type")
    color_cap = fields.Selection([
        ('no_aplica', 'No Aplica'),
        ('agm_gpo_31', 'AGM_GPO_31'),
        ('amarilla', 'Amarilla'),
        ('amarilla_esecial', 'Amarilla Especial'),
        ('azul', 'Azul'),
        ('bat_especiales)', 'Bat Especiales'),
        ('bat_pesado', 'Bat Pesado'),
        ('bat_solares', 'Bat Solares'),
        ('roja_12v', 'Roja 12V'),
        ('roja_v6', 'Roja 6v')], default="no_aplica", required=True, string="Color Cap")
