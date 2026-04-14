"use strict";
odoo.define('pos_retail_combo.order', function (require) {

    const { Gui } = require('point_of_sale.Gui');
    const models = require('point_of_sale.models');
    const core = require('web.core');
    const _t = core._t;
//    const MultiUnitWidget = require('pos_retail.multi_unit');
//    const rpc = require('pos.rpc');
    const rpc = require('web.rpc');
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
//                if (order) {
//                    order.add_barcode('barcode'); // TODO: add barcode to html page
//                }
            });
        }
    });


    let _super_Order = models.Order.prototype;
    models.Order = models.Order.extend({
        async setBundlePackItems() {
            let order = this;
            let selectedLine = order.get_selected_orderline();
            if (selectedLine) {
                let combo_items = this.pos.combo_items.filter((c) => selectedLine.product.product_tmpl_id == c.product_combo_id[0])
                if (combo_items.length == 0) {
                    return this.pos.chrome.showPopup('ErrorPopup', {
                        title: _t('Error'),
                        body: selectedLine.product.display_name + _t(' No es un Combo Pack')
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
                    let {confirmed, payload: result} = await Gui.showPopup("PopUpSelectionBox", {
//                    let {confirmed, payload: result} = await this.pos.chrome.showPopup('PopUpSelectionBox', {
                        title: _t('Selecciona Combo/Pack Items'),
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
                    body: _t('Por favor Selecciona 1 linea')
                })
            }
        },

    add_product: async function (product, options) {
            if (!options) {
                options = {}
            }
            let res = _super_Order.add_product.call(this, product, options);
            let selected_orderline = this.get_selected_orderline();
            console.log('combo_items')
            let combo_items = [];
            if (selected_orderline) {
                // TODO: auto set hardcode combo items
                for (let i = 0; i < this.pos.combo_items.length; i++) {
                    let combo_item = this.pos.combo_items[i];
                    if (combo_item.product_combo_id[0] == selected_orderline.product.product_tmpl_id && (combo_item.default == true || combo_item.required == true)) {
                        combo_items.push(combo_item);
                    }
                }
                if (combo_items) {
                    selected_orderline.set_combo_bundle_pack(combo_items)
                }
                // TODO: auto set dynamic combo items
//                if (selected_orderline.product.product_tmpl_id) {
//                    let default_combo_items = this.pos.combo_limiteds_by_product_tmpl_id[selected_orderline.product.product_tmpl_id];
//                    if (default_combo_items && default_combo_items.length) {
//                        let selected_combo_items = {};
//                        for (let i = 0; i < default_combo_items.length; i++) {
//                            let default_combo_item = default_combo_items[i];
//                            if (default_combo_item.default_product_ids.length) {
//                                for (let j = 0; j < default_combo_item.default_product_ids.length; j++) {
//                                    selected_combo_items[default_combo_item.default_product_ids[j]] = 1
//                                }
//                            }
//                        }
//                        selected_orderline.set_dynamic_combo_items(selected_combo_items);
//                    }
//
//                }
            }
            return res
        },

});

    let _super_Orderline = models.Orderline.prototype;
    models.Orderline = models.Orderline.extend({
        initialize: function (attributes, options) {
            let res = _super_Orderline.initialize.apply(this, arguments);
            if (!options.json) {
                this.selected_combo_items = {};
            }
            return res;
        },
        init_from_JSON: function (json) {
            _super_Orderline.init_from_JSON.apply(this, arguments);
            if (json.combo_item_ids && json.combo_item_ids.length) {
                this.set_combo_bundle_pack(json.combo_item_ids);
            }
            if (json.selected_combo_items) {
                this.set_dynamic_combo_items(json.selected_combo_items)
            }
        },
        export_as_JSON: function () {
            let json = _super_Orderline.export_as_JSON.apply(this, arguments);
            if (this.combo_items && this.combo_items.length) {
                json.combo_item_ids = [];
                for (let n = 0; n < this.combo_items.length; n++) {
                    json.combo_item_ids.push({
                        id: this.combo_items[n].id,
                        quantity: this.combo_items[n].quantity
                    })
                }
            }
            if (this.selected_combo_items) {
                json.selected_combo_items = this.selected_combo_items;
            }
            return json;
        },
//        clone: function () {
//            let orderline = _super_Orderline.clone.call(this);
//            orderline.note = this.note;
//            orderline.discount_reason = this.discount_reason;
//            orderline.uom_id = this.uom_id;
//            if (this.combo_item_ids && this.combo_item_ids.length) {
//                orderline.set_combo_bundle_pack(this.combo_item_ids);
//            }
//            if (this.variant_ids && this.variant_ids.length) {
//                let variant_ids = this.variant_ids[0][2];
//                if (variant_ids) {
//                    orderline.set_variants(variant_ids)
//                }
//            }
//            orderline.mp_dirty = this.mp_dirty;
//            orderline.mp_skip = this.mp_skip;
//            orderline.discountStr = this.discountStr;
//            orderline.price_extra = this.price_extra;
//            orderline.discount_extra = this.discount_extra;
//            orderline.discount_reason = this.discount_reason;
//            orderline.plus_point = this.plus_point;
//            orderline.redeem_point = this.redeem_point;
//            orderline.user_id = this.user_id;
//            return orderline;
//        },
//        export_for_printing: function () {
//            let receipt_line = _super_Orderline.export_for_printing.apply(this, arguments);
//            receipt_line['promotion'] = null;
//            receipt_line['promotion_reason'] = null;
//            if (this.promotion) {
//                receipt_line.promotion = this.promotion;
//                receipt_line.promotion_reason = this.promotion_reason;
//            }
//            if (this.coupon_program_name) {
//                receipt_line.coupon_program_name = this.coupon_program_name
//            }
//            receipt_line['combo_items'] = [];
//            receipt_line['variants'] = [];
//            receipt_line['tags'] = [];
//            receipt_line['addons'] = [];
//            receipt_line['note'] = this.note || '';
//            receipt_line['combo_items'] = [];
//            if (this.combo_items) {
//                receipt_line['combo_items'] = this.combo_items;
//            }
//            if (this.variants) {
//                receipt_line['variants'] = this.variants;
//            }
//            if (this.tags) {
//                receipt_line['tags'] = this.tags;
//            }
//            if (this.discount_reason) {
//                receipt_line['discount_reason'] = this.discount_reason;
//            }
//            receipt_line['tax_amount'] = this.get_tax() || 0.00;
//            if (this.variants) {
//                receipt_line['variants'] = this.variants;
//            }
//            if (this.packaging) {
//                receipt_line['packaging'] = this.packaging;
//            }
//            if (this.product.name_second) {
//                receipt_line['name_second'] = this.product.name_second
//            }
//            if (this.selected_combo_items) {
//                receipt_line['selected_combo_items'] = this.selected_combo_items;
//            }
//            if (this.generic_options) {
//                receipt_line['generic_options'] = this.generic_options;
//            }
//            if (this.bom_lines) {
//                receipt_line['bom_lines'] = this.get_bom_lines()
//            }
//            if (this.mrp_production_id) {
//                receipt_line['mrp_production_id'] = this.mrp_production_id;
//            }
//            if (this.mrp_production_state) {
//                receipt_line['mrp_production_state'] = this.mrp_production_state;
//            }
//            if (this.mrp_production_name) {
//                receipt_line['mrp_production_name'] = this.mrp_production_name;
//            }
//            if (this.addon_ids) {
//                for (let index in this.addon_ids.length) {
//                    let product = this.pos.db.get_product_by_id(this.addon_ids[index]);
//                    if (product) {
//                        receipt_line['addons'].push(product)
//                    }
//                }
//            }
//            return receipt_line;
//        },

        // TODO: this is combo bundle pack
        set_combo_bundle_pack: function (combo_item_ids) {
            // TODO: combo_item_ids is dict value have id is id of combo item, and quantity if quantity of combo item
            let price_extra = 0;
            this.combo_items = [];
            for (let n = 0; n < combo_item_ids.length; n++) {
                let combo_item_id = combo_item_ids[n].id;
                let quantity = combo_item_ids[n].quantity;
                let combo_item = this.pos.combo_item_by_id[combo_item_id];
                if (combo_item) {
                    this.combo_items.push({
                        id: combo_item['id'],
                        quantity: quantity,
                        price_extra: combo_item.price_extra,
                        product_id: combo_item.product_id,
                    });
                    price_extra += combo_item.price_extra * quantity;
                }
            }
            if (price_extra) {
                this.price_extra = price_extra;
            }
            this.trigger('change', this);
        },

        is_combo: function () {
            for (let product_id in this.selected_combo_items) {
                return true
            }
            return false
        },
        has_combo_item_tracking_lot: function () {
            let tracking = false;
            for (let i = 0; i < this.pos.combo_items.length; i++) {
                let combo_item = this.pos.combo_items[i];
                if (combo_item['tracking']) {
                    tracking = true;
                }
            }
            return tracking;
        },
//        set_quantity: function (quantity, keep_price) {
//            let self = this;
//            let update_combo_items = false;
//            if (this.uom_id || this.redeem_point) {
//                keep_price = 'keep price because changed uom id or have redeem point'
//            }
//            let qty_will_set = parseFloat(quantity);
//            if (qty_will_set <= 0) {
//                this.selected_combo_items = {}
//                update_combo_items = true
//            } else {
//                for (let product_id in this.selected_combo_items) {
//                    let qty_of_combo_item = this.selected_combo_items[product_id]
//                    let new_qty = qty_will_set / this.quantity * qty_of_combo_item;
//                    this.selected_combo_items[product_id] = new_qty
//                    update_combo_items = true;
//                }
//            }
//            let res = _super_Orderline.set_quantity.call(this, quantity, keep_price); // call style change parent parameter : keep_price
//            if (update_combo_items) {
//                this.set_dynamic_combo_items(this.selected_combo_items)
//            }
//            if (this.combo_items && this.pos.config.screen_type != 'kitchen') { // if kitchen screen, no need reset combo items
//                this.trigger('change', this);
//            }
//            let get_product_price_quantity = this.get_product_price_quantity_item(); // product price filter by quantity of cart line. Example: buy 1 unit price 1, buy 10 price is 0.5
//            let order = this.order;
//            let orderlines = order.orderlines.models;
//            return res;
//        },

    });
});