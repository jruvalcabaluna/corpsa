odoo.define('pos_bag_charges.PosDiscountsGroupPopupWidget', function(require) {
    "use strict";

    const Popup = require('point_of_sale.ConfirmPopup');
    const Registries = require('point_of_sale.Registries');
    const PosComponent = require('point_of_sale.PosComponent');
    const rpc = require('web.rpc');

    class PosDiscountsGroupPopupWidget extends Popup {

        constructor() {
            super(...arguments);
        }

        go_back_screen() {
            this.showScreen('ProductScreen');
            this.trigger('close-popup');
        }

        click_on_group_product(event) {
            var self = this;
            var group_id = parseInt(event.currentTarget.dataset['productId'])
            var order = this.env.pos.get_order();
            var line_price = order.selected_orderline.price;
//            var display_name = self.env.pos.db.product_by_id[group_id].display_name;
            var discount_amount = line_price - self.env.pos.db.product_by_id[group_id].lst_price;
            var discount_percentage = -((discount_amount - line_price)/line_price)*100;
            var val = Math.round(Math.max(0,Math.min(100,parseFloat(discount_percentage))));
            var discount_to_purchase = 0;
            if(self.env.pos.db.product_by_id[group_id].lst_price >= line_price){
                var val = 100;
                var discount_to_purchase = line_price;
                order.selected_orderline.set_discount(val);
            }else
                var discount_to_purchase = self.env.pos.db.product_by_id[group_id].lst_price;;
                order.selected_orderline.set_discount(val);
            this.env.pos.get_order().selected_orderline.product_group_discount_id = group_id;
            this.env.pos.get_order().selected_orderline.amount_group_discount = discount_to_purchase;
            self.trigger('close-popup');
        }

    };
    PosDiscountsGroupPopupWidget.template = 'PosDiscountsGroupPopupWidget';

    Registries.Component.add(PosDiscountsGroupPopupWidget);

    return PosDiscountsGroupPopupWidget;
});