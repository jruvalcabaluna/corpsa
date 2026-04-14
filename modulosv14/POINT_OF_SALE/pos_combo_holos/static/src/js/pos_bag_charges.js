odoo.define('pos_combo_holos.ButtonSetBundlePack', function(require) {
    "use strict";

    var models = require('point_of_sale.models');
    const ProductScreen = require('point_of_sale.ProductScreen');
    var core = require('web.core');
    const { Gui } = require('point_of_sale.Gui');
    const PosComponent = require('point_of_sale.PosComponent');
    const Registries = require('point_of_sale.Registries');
    var _t = core._t;



// Start PosBagWidget
    class ButtonSetBundlePack extends PosComponent {
        constructor() {
            super(...arguments);
        }
        
        renderElement (){
            var self = this;
            var selectedOrder = self.env.pos.get_order();
//            var category = self.env.pos.config.pos_bag_category_id;
//            var categ = self.env.pos.db.get_product_by_category(category[0])
            
//            var products = self.env.pos.db.get_product_by_category(category[0])[0];
            console.log("products")
            var order = this.env.pos.get_order();

            let selectedLine = order.get_selected_orderline();
//            let combo_items = this.env.pos.combo_items.filter((c) => selectedLine.product.product_tmpl_id == c.product_combo_id[0])

//            if (order && order.get_selected_orderline()) {
//                let selectedLine = order.get_selected_orderline();
//                let combo_items = this.env.pos.combo_items.filter((c) => selectedLine.product.product_tmpl_id == c.product_combo_id[0])
//                if (combo_items.length) {
//                    return true
//                }
//            }
            console.log("combo")



                
            //if (product.length == 1) {
//            if (self.env.pos.db.get_product_by_category(self.env.pos.config.pos_bag_category_id[0]).length == 1) {
//                selectedOrder.add_product(products);
//                //console.log("lasttttttttttttttttttttttt selewcted orderrrrrrrrrrrrrr",selectedOrder)
//                self.env.pos.set_order(selectedOrder);
//
//
//                self.showScreen('ProductScreen');
//            }else{
//                var orderlines = self.env.pos.db.get_product_by_category(category[0]);
//                console.log(orderlines,"---------------orderlines")
//                for(var i = 0 ; i<orderlines.length ; i++){
//                     orderlines[i]['image_url'] = window.location.origin + '/web/binary/image?model=product.product&field=image_medium&id=' + orderlines[i].id;
//                 }
//                self.showPopup('PosBagPopupWidget', {'orderlines': orderlines});
//            }


        }

    };
    ButtonSetBundlePack.template = 'ButtonSetBundlePack';

    Registries.Component.add(ButtonSetBundlePack);

    return ButtonSetBundlePack;

});
