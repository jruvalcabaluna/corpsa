odoo.define('pos_garantias_8a.models', function (require) {
  "use strict";

  var models = require('point_of_sale.models');

  var existing_models = models.PosModel.prototype.models;
  var product_index = _.findIndex(existing_models, function (model) {
      return model.model === "product.product";
  });
  var product_model = existing_models[product_index];

  models.load_models([
  {
    model:  product_model.model,
    fields: product_model.fields,
    order:  product_model.order,
    domain: function(self) {return [['id', '=', self.config.discount_product_id[0]]];},
    context: product_model.context,
    loaded: product_model.loaded,
  },
    {
    model:  'product.brand.item',
    fields: ['brand_id', 'month', 'percentage', 'use_type', 'color_cap'],
    loaded: function(self, product_brands_items){
        var brand_item_by_id = {};
        _.each(product_brands_items, function (brand_item) {
            brand_item_by_id[brand_item.id] = brand_item;
        });
        self.product_brands_items = product_brands_items;
//        console.log('product_brands_items',product_brands_items)
        },
    }
  ]);

});
