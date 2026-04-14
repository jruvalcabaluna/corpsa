odoo.define('pos_discounts_8a.PosDiscountGroupWidget', function(require) {
    "use strict";

    var models = require('point_of_sale.models');
    const ProductScreen = require('point_of_sale.ProductScreen');
    var core = require('web.core');
    const { Gui } = require('point_of_sale.Gui');
    const PosComponent = require('point_of_sale.PosComponent');
    const Registries = require('point_of_sale.Registries');
    var _t = core._t;

// Start PosDiscountGroupWidget
    class PosDiscountGroupWidget extends PosComponent {
        constructor() {
            super(...arguments);
        }

        mounted() {
            this.env.pos.get('orders').on('add remove change', () => this.render(), this);
            this.env.pos.on('change:selectedOrder', () => this.render(), this);
            this.env.pos.get_order().orderlines.on('change', () => {
                this.render();
            });
        }

        get isHighlighted() {
            let selectedOrder = this.env.pos.get_order();
            if (!selectedOrder || !selectedOrder.get_selected_orderline()) {
                return false
            }
            let selectedLine = this.env.pos.get_order().get_selected_orderline();
            if (selectedLine.product.categ.name == 'CARGOS') {
                return true
            } else {
                return false
            }
        }

        renderElement (){
            let selectedLine = this.env.pos.get_order().get_selected_orderline();
            var self = this;
            if (this.env.pos.get_order().get_orderlines().length == 0) {
                return this.showPopup('ErrorPopup', {
                    title: this.env._t('Warning'),
                    body: this.env._t('La Orden esta vacia'),
                })
            }
            if (!self.env.pos.get_order().get_client()) {
                    return this.showPopup('ErrorPopup', {
                        title: this.env._t('Error'),
                        body: this.env._t('El Cliente es requerido')
                    })
                }
            if (this.env.pos.get_order().get_selected_orderline().product.categ.name !== 'CARGOS') {
                    return this.showPopup('ErrorPopup', {
                        title: this.env._t('Error'),
                        body: this.env._t('Este producto no acepta descuentos de grupo')
                    })
                }
            var selectedOrder = self.env.pos.get_order();
            var category = self.env.pos.config.pos_discounts_8a_category_id;
            var categ = self.env.pos.db.get_product_by_category(category[0])
            var products = self.env.pos.db.get_product_by_category(category[0])[0];

            if (self.env.pos.db.get_product_by_category(self.env.pos.config.pos_discounts_8a_category_id[0]).length == 1) {
                selectedOrder.add_product(products);
                self.env.pos.set_order(selectedOrder);
                self.showScreen('ProductScreen');
            }else{
                var orderlines = self.env.pos.db.get_product_by_category(category[0]);
                for(var i = 0 ; i<orderlines.length ; i++){
                     orderlines[i]['image_url'] = window.location.origin + '/web/binary/image?model=product.product&field=image_medium&id=' + orderlines[i].id;
                 }
                self.showPopup('PosDiscountsGroupPopupWidget', {'orderlines': orderlines});
            }
        }

    };
    PosDiscountGroupWidget.template = 'PosDiscountGroupWidget';

    Registries.Component.add(PosDiscountGroupWidget);

    return PosDiscountGroupWidget;

});
