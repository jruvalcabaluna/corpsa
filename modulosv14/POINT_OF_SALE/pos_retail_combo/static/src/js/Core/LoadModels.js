
odoo.define('pos_retail_combo.load_models', function (require) {
    const models = require('point_of_sale.models');
    const time = require('web.time');
    const exports = {};
    const Backbone = window.Backbone;
    const core = require('web.core');
    const _t = core._t;
    const session = require('web.session');
    const rpc = require('web.rpc');

models.load_models({
    model: 'pos.combo.item',
    fields: ['product_id', 'product_combo_id', 'default', 'quantity', 'uom_id', 'tracking', 'required', 'price_extra'],
    domain: [],
    loaded: function (self, combo_items) {
                self.combo_items = combo_items;
                self.combo_item_by_id = {};
                for (let i = 0; i < combo_items.length; i++) {
                    let item = combo_items[i];
                    self.combo_item_by_id[item.id] = item;
                }
            }
});

    let extend_models = [
//            {
//            model: 'pos.combo.item',
//            fields: ['product_id', 'product_combo_id', 'default', 'quantity', 'uom_id', 'tracking', 'required', 'price_extra'],
//            domain: [],
//            loaded: function (self, combo_items) {
//                self.combo_items = combo_items;
//                self.combo_item_by_id = {};
//                for (let i = 0; i < combo_items.length; i++) {
//                    let item = combo_items[i];
//                    self.combo_item_by_id[item.id] = item;
//                }
//            }
//        },
        {
            label: 'Stock Picking',
            model: 'stock.picking',
            fields: ['id', 'pos_order_id'],
            condition: function (self) {
                return self.config.pos_orders_management;
            },
            domain: [['is_picking_combo', '=', true], ['pos_order_id', '!=', null]],
            loaded: function (self, combo_pickings) {
                self.combo_pickings = combo_pickings;
                self.combo_picking_by_order_id = {};
                self.combo_picking_ids = [];
                for (let i = 0; i < combo_pickings.length; i++) {
                    let combo_picking = combo_pickings[i];
                    self.combo_picking_by_order_id[combo_picking.pos_order_id[0]] = combo_picking.id;
                    self.combo_picking_ids.push(combo_picking.id)
                }
            }
        },
        {
            label: 'Stock Move',
            model: 'stock.move',
            fields: ['combo_item_id', 'picking_id', 'product_id', 'product_uom_qty'],
            condition: function (self) {
                return self.config.pos_orders_management;
            },
            domain: function (self) {
                return [['picking_id', 'in', self.combo_picking_ids]]
            },
            loaded: function (self, moves) {
                self.stock_moves_by_picking_id = {};
                for (let i = 0; i < moves.length; i++) {
                    let move = moves[i];
                    if (!self.stock_moves_by_picking_id[move.picking_id[0]]) {
                        self.stock_moves_by_picking_id[move.picking_id[0]] = [move]
                    } else {
                        self.stock_moves_by_picking_id[move.picking_id[0]].push(move)
                    }
                }
            }
        },
        {
            label: 'Combo Items Limited',
            model: 'pos.combo.limit',
            fields: ['product_tmpl_id', 'pos_categ_id', 'quantity_limited', 'default_product_ids'],
            loaded: function (self, combo_limiteds) {
                self.combo_limiteds = combo_limiteds;
                self.combo_limiteds_by_product_tmpl_id = {};
                self.combo_category_limited_by_product_tmpl_id = {};
                for (let i = 0; i < combo_limiteds.length; i++) {
                    let combo_limited = combo_limiteds[i];
                    if (self.combo_limiteds_by_product_tmpl_id[combo_limited.product_tmpl_id[0]]) {
                        self.combo_limiteds_by_product_tmpl_id[combo_limited.product_tmpl_id[0]].push(combo_limited);
                    } else {
                        self.combo_limiteds_by_product_tmpl_id[combo_limited.product_tmpl_id[0]] = [combo_limited];
                    }
                    if (!self.combo_category_limited_by_product_tmpl_id[combo_limited.product_tmpl_id[0]]) {
                        self.combo_category_limited_by_product_tmpl_id[combo_limited.product_tmpl_id[0]] = {};
                        self.combo_category_limited_by_product_tmpl_id[combo_limited.product_tmpl_id[0]][combo_limited.pos_categ_id[0]] = combo_limited.quantity_limited;
                    } else {
                        self.combo_category_limited_by_product_tmpl_id[combo_limited.product_tmpl_id[0]][combo_limited.pos_categ_id[0]] = combo_limited.quantity_limited;
                    }
                }
            }
        },
    ];
    return exports;
});
