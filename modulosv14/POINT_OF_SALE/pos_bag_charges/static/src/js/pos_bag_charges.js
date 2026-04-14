odoo.define('pos_bag_charges.PosBagWidget', function(require) {
    "use strict";

    var models = require('point_of_sale.models');
    const ProductScreen = require('point_of_sale.ProductScreen');
    var core = require('web.core');
    const { Gui } = require('point_of_sale.Gui');
    const PosComponent = require('point_of_sale.PosComponent');
    const Registries = require('point_of_sale.Registries');
    var _t = core._t;



// Start PosBagWidget
    class PosBagWidget extends PosComponent {
        constructor() {
            super(...arguments);
        }
        
        renderElement (){
            var self = this;
            var selectedOrder = self.env.pos.get_order();
            var category = self.env.pos.config.pos_bag_category_id;
            var categ = self.env.pos.db.get_product_by_category(category[0])
            
            var products = self.env.pos.db.get_product_by_category(category[0])[0];
            //console.log("productssssssssssssssssssssssssssssssssssssssssss",products)
                
            //if (product.length == 1) {   
            if (self.env.pos.db.get_product_by_category(self.env.pos.config.pos_bag_category_id[0]).length == 1) { 
                selectedOrder.add_product(products);
                //console.log("lasttttttttttttttttttttttt selewcted orderrrrrrrrrrrrrr",selectedOrder)
                self.env.pos.set_order(selectedOrder);
                

                self.showScreen('ProductScreen');
            }else{
                var orderlines = self.env.pos.db.get_product_by_category(category[0]);
                console.log(orderlines,"---------------orderlines")
                for(var i = 0 ; i<orderlines.length ; i++){
                     orderlines[i]['image_url'] = window.location.origin + '/web/binary/image?model=product.product&field=image_medium&id=' + orderlines[i].id;
                 }
                self.showPopup('PosBagPopupWidget', {'orderlines': orderlines});
            }

            
        }

    };
    PosBagWidget.template = 'PosBagWidget';

    Registries.Component.add(PosBagWidget);

    return PosBagWidget;

});
