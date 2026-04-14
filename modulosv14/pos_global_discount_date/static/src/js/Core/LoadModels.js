odoo.define('pos_global_discount_based_on_date.load_models', function (require) {
    const models = require('point_of_sale.models');
//    const time = require('web.time');
    const exports = {};
//    const Backbone = window.Backbone;
//    const bus = require('pos_retail.core_bus');
    const core = require('web.core');
//    const _t = core._t;
//    const session = require('web.session');
    const rpc = require('web.rpc');
//    const ERROR_DELAY = 30000;


    let extend_models = [

        {
            label: 'Global Discount',
            model: 'pos.global.discount.date',
            fields: ['name', 'amount', 'product_id', 'reason', 'type'],
            domain: function (self) {
                return [['id', 'in', self.config.discount_date_ids]];
            },
            condition: function (self) {
                return self.config.discount_date && self.config.discount_date_ids.length > 0;
            },
            loaded: function (self, discounts) {
                discounts = _.filter(discounts, function (discount) {
                    return discount.branch_ids.length == 0 || (self.config.pos_branch_id && discount.branch_ids && discount.branch_ids.indexOf(self.config.pos_branch_id[0]) != -1)
                });
                self.discounts = discounts;
                self.discount_by_id = {};
                let i = 0;
                while (i < discounts.length) {
                    self.discount_by_id[discounts[i].id] = discounts[i];
                    i++;
                }
            }
        },

    ];

    return exports;
});
