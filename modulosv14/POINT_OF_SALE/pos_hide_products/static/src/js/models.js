odoo.define('pos_hide_products.models', (require) => {
    const { load_fields } = require('point_of_sale.models');

    load_fields('product.product', ['pos_hide_product']);
});