odoo.define('pos_cache_partner.pos_cache_partner', function (require) {
"use strict";

    var models = require('point_of_sale.models');
    var core = require('web.core');
    var rpc = require('web.rpc');
    var _t = core._t;

    var posmodel_super = models.PosModel.prototype;
    models.PosModel = models.PosModel.extend({
        load_server_data: function () {
            var self = this;
            var partner_index = _.findIndex(this.models, function (model) {
                return model.model === "res.partner";
            });
            var partner_model = self.models[partner_index];
            var partner_fields = partner_model.fields;
            var partner_domain = [];
            // We don't want to load res.partner the normal
            // uncached way, so get rid of it.
            if (partner_index !== -1) {
                this.models.splice(partner_index, 1);
            }
            return posmodel_super.load_server_data.apply(this, arguments).then(function () {
                    var records = rpc.query({
                        model: 'pos.config',
                        method: 'get_partners_from_cache',
                        args: [self.pos_session.config_id[0], partner_fields, partner_domain],
                    });
                    self.setLoadingMessage(_t('Loading') + ' res.partner', 1);
                    return records.then(function (partners) {
                        self.partners = partners;
                        self.db.add_partners(partners);
                    });
                });
        },
    });
});