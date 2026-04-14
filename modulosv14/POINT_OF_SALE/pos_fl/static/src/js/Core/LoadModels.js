odoo.define('pos_fl.load_models', function (require) {
"use strict";

    const models = require('point_of_sale.models');
    const core = require('web.core');
    const _t = core._t;
    const rpc = require('web.rpc');
    const hr = require('pos_hr.employees')

    models.load_models([
        {
            label: 'Sellers',
            model: 'res.users',
            fields: ['display_name', 'name', 'pos_security_pin', 'barcode', 'pos_config_id', 'partner_id', 'image_1920'],
            context: {sudo: true},
            loaded: function (self, users) {
                // TODO: have 2 case
                // TODO 1) If have set default_seller_id, default seller is default_seller_id
                // TODO 2) If have NOT set default_seller_id, default seller is pos_session.user_id
                self.users = users;
                self.user_by_id = {};
                self.user_by_pos_security_pin = {};
                self.user_by_barcode = {};
                self.default_seller = null;
                self.sellers = [];
                for (let i = 0; i < users.length; i++) {
                    let user = users[i];
                    if (user['pos_security_pin']) {
                        self.user_by_pos_security_pin[user['pos_security_pin']] = user;
                    }
                    if (user['barcode']) {
                        self.user_by_barcode[user['barcode']] = user;
                    }
                    self.user_by_id[user['id']] = user;
                    if (self.config.default_seller_id && self.config.default_seller_id[0] == user['id']) {
                        self.default_seller = user;
                    }
                }
                if (!self.default_seller) { // TODO: if have not POS Config / default_seller_id: we set default_seller is user of pos session
                    let pos_session_user_id = self.pos_session.user_id[0];
                    if (self.user_by_id[pos_session_user_id]) {
                        self.default_seller = self.user_by_id[pos_session_user_id]
                    }
                }
            }
        },


    ]);

});
