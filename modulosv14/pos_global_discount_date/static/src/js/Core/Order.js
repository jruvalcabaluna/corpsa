"use strict";
/*
    This module create by: thanhchatvn@gmail.com
    License: OPL-1
    Please do not modification if i not accept
    Thanks for understand
 */
odoo.define('pos_global_discount_date.order', function (require) {

    const models = require('point_of_sale.models');
    const core = require('web.core');
    const _t = core._t;
//    const MultiUnitWidget = require('pos_retail.multi_unit');
//    const rpc = require('pos.rpc');
    const qweb = core.qweb;
    const PosComponent = require('point_of_sale.PosComponent');
//    const PosComponent = require('point_of_sale.PosComponent');
    const utils = require('web.utils');
    const round_pr = utils.round_precision;
    const {posbus} = require('point_of_sale.utils');

    let _super_Order = models.Order.prototype;
    models.Order = models.Order.extend({
        validate_global_discount_date: function () {
            let self = this;
            let client = this && this.get_client();
            if (client && client['discount_date_id']) {
                this.pos.gui.show_screen('products');
                this.discount_date = this.pos.discount_by_id[client['discount_date_id'][0]];
                this.pos.gui.show_screen('products');
                let body = client['name'] + ' have discount ' + self.discount_date['name'] + '. Do you want to apply ?';
                return this.pos.chrome.showPopup('ConfirmPopup', {
                    'title': _t('Customer special discount ?'),
                    'body': body,
                    confirm: function () {
                        self.add_global_discount_date(self.discount_date);
                        self.pos.gui.show_screen('payment');
                        self.validate_payment();
                    },
                    cancel: function () {
                        self.pos.gui.show_screen('payment');
                        self.validate_payment();
                    }
                });
            } else {
                this.validate_payment();
            }
        },

        add_global_discount_date: function (discount_date) {
            let lines = this.orderlines.models;
            if (!lines.length) {
                return this.pos.chrome.showPopup('ErrorPopup', {
                    title: _t('Warning'),
                    body: _t('Your order is blank cart'),
                })
            }
            if (discount_date.type == 'percent') {
                for (let i = 0; i < lines.length; i++) {
                    let line = lines[i];
                    line.discount_extra = discount_date.amount;
                    line.trigger('change', line)
                }
            } else {
                for (let i = 0; i < lines.length; i++) {
                    let line = lines[i];
                    line.price_extra = -discount_date.amount / lines.length;
                    line.trigger('change', line)
                }
            }
        },

    });
});