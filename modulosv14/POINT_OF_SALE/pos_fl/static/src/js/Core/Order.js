odoo.define('pos_fl.order', function (require) {
"use strict";

    const models = require('point_of_sale.models');
    const core = require('web.core');
    const _t = core._t;
    const rpc = require("web.rpc");
    const qweb = core.qweb;
    const PosComponent = require('point_of_sale.PosComponent');
    const utils = require('web.utils');
    const round_pr = utils.round_precision;
    const {posbus} = require('point_of_sale.utils');

    let _super_Order = models.Order.prototype;
    models.Order = models.Order.extend({
//        initialize: function (attributes, options) {
//            _super_Order.initialize.apply(this, arguments);
//            let self = this;
//            if (!this.seller && this.pos.default_seller) {
//                this.seller = this.pos.default_seller;
//            }
//            if (!this.seller && this.pos.config.default_seller_id) {
//                let seller = this.pos.user_by_id[this.pos.config.default_seller_id[1]];
//                console.log('seller',seller)
//                if (seller) {
//                    this.seller = seller;
//                }
//            }
//        },
        set_doctor: function(doctor){
            this.assert_editable();
            this.set('doctor',doctor);
        },
        get_doctor: function(){
            return this.get('doctor');
        },

    });

});
