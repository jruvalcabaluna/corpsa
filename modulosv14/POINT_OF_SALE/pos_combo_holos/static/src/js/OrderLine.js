odoo.define('pos_combo_holos.Orderline', function (require) {
    'use strict';

    const Orderline = require('point_of_sale.Orderline');
    const Registries = require('point_of_sale.Registries');
    const {useState} = owl.hooks;
    const {posbus} = require('point_of_sale.utils');

    const RetailOrderline = (Orderline) =>
        class extends Orderline {
//    const RetailOrderline = Orderline.extend{
//        class extends Orderline {
//            constructor() {
//                super(...arguments);
//                this.state = useState({
//                    showStockInformation: false,
//                });
//            }

            showBundlePackItems() {
                const selectedOrder = this.env.pos.get_order();
                if (selectedOrder) {
                    selectedOrder.setBundlePackItems()
                }
            }

            async editBundlePackItems() {
                console.log('0ello')
                if (this.props.line.combo_items && this.props.line.combo_items.length) {
                    let {confirmed, payload: result} = await this.showPopup('ItemsQuantities', {
                        title: this.env._t('Edit Bundle/Pack items of [ ') + this.props.line.product.display_name + ' ]',
                        isSingleItem: false,
                        array: this.props.line.combo_items,
                    })
                    if (confirmed) {
                        const newStockArray = result.newArray
                        debugger
                    }
                } else {
                    return this.showPopup('ErrorPopup', {
                        title: this.env._t('Error'),
                        body: this.props.line.product.display_name + this.env._t(' is not Combo/Bundle Pack, or Combo/Bundle Pack Items not set !!!')
                    })
                }
            }

//            get isBundlePackProduct() {
//                let combo_items = this.env.pos.combo_items.filter((c) => this.props.line.product.product_tmpl_id == c.product_combo_id[0])
//                if (combo_items.length) {
//                    return true
//                } else {
//                    return false
//                }
//            }
        }
    Registries.Component.extend(Orderline, RetailOrderline);

    return RetailOrderline;
});
