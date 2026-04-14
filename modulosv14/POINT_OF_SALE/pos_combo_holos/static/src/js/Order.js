"use strict";

odoo.define('pos_combo_holos.order', function (require) {

    const models = require('point_of_sale.models');
    const core = require('web.core');
    const _t = core._t;
//    const rpc = require('pos.rpc');
    const qweb = core.qweb;
    const PosComponent = require('point_of_sale.PosComponent');
    const utils = require('web.utils');
    const round_pr = utils.round_precision;
    const {posbus} = require('point_of_sale.utils');

    let _super_PosModel = models.PosModel.prototype;
    models.PosModel = models.PosModel.extend({
        initialize: function (session, attributes) {
            _super_PosModel.initialize.apply(this, arguments);
            this.bind('change:selectedOrder', function (pos) {
                let order = pos.get_order();
            });
        }
    });


    let _super_Order = models.Order.prototype;
    models.Order = models.Order.extend({
        async setBundlePackItems() {
                    let order = this;
                    console.log(order)
                    let selectedLine = order.get_selected_orderline();
                    if (selectedLine) {
                        let combo_items = this.pos.combo_items.filter((c) => selectedLine.product.product_tmpl_id == c.product_combo_id[0])
                        if (combo_items.length == 0) {
                            return this.pos.chrome.showPopup('ErrorPopup', {
                                title: _t('Error'),
                                body: selectedLine.product.display_name + _t(' it not Bundle Pack')
                            })
                        } else {
                            if (!selectedLine.combo_items) {
                                selectedLine.combo_items = [];
                            }
                            let selectedComboItems = selectedLine.combo_items.map((c) => c.id)
                            combo_items.forEach(function (c) {
                                if (selectedComboItems.indexOf(c.id) != -1) {
                                    c.selected = true
                                } else {
                                    c.selected = false;
                                }
                                c.display_name = c.product_id[1];
                            })
                            let {confirmed, payload: result} = await this.pos.chrome.showPopup('PopUpSelectionBox', {
                                title: _t('Select Bundle/Pack Items'),
                                items: combo_items
                            })
                            if (confirmed) {
                                if (result.items.length) {
                                    selectedLine.set_combo_bundle_pack(result.items);
                                } else {
                                    selectedLine.set_combo_bundle_pack([]);
                                }
                            }
                        }

                    } else {
                        return this.pos.chrome.showPopup('ErrorPopup', {
                            title: _t('Error'),
                            body: _t('Please selected 1 line')
                        })
                    }
                },
        });
});