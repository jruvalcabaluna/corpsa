odoo.define('pos_cache_pricelist.pos_cache_pricelist', function (require) {
"use strict";

var models = require('point_of_sale.models');
var core = require('web.core');
var rpc = require('web.rpc');
var _t = core._t;

var posmodel_super = models.PosModel.prototype;
    models.PosModel = models.PosModel.extend({
        load_server_data: function () {
            var self = this;
            var curr_index = 0;
            var pricelist_index = _.findIndex(this.models, function (model) {
                return model.model === "product.pricelist";
            });
            var pricelist_model = this.models[pricelist_index];
            var pricelist_fields = pricelist_model.fields;
            var pricelist_domain = []
            if (pricelist_index !== -1) {
                this.models.splice(pricelist_index, 1);
            }
//ITEM
            var pricelist_item_index = _.findIndex(this.models, function (model) {
                return model.model === "product.pricelist.item";
            });
            var pricelist_item_model = this.models[pricelist_item_index];
            var pricelist_item_fields = pricelist_item_model.fields;
            var pricelist_item_domain = []
//            curr_index = pricelist_item_index
            if (pricelist_item_index !== -1) {
                this.models.splice(pricelist_item_index, 1);
            }
            console.log('pricelist_item_index IF',pricelist_item_index)

            return posmodel_super.load_server_data.apply(this, arguments).then(function () {
                var records = rpc.query({
                    model: 'pos.config',
                    method: 'get_pricelists_from_cache',
                    args: [self.pos_session.config_id[0], pricelist_fields, pricelist_domain],
                });
                console.log('ENTER TO records')
                var pListItem = rpc.query({
                    model: 'pos.config',
//                    model: 'product.pricelist.item',
                    method: 'get_pricelist_items_from_cache',
                    args: [self.pos_session.config_id[0], pricelist_item_fields, pricelist_item_domain],
//                    args: [[['pricelist_id','=',self.config.pricelist_id[0]]]],
                });
//                var pListItem = rpc.query({
//                    model: 'product.pricelist.item',
//                    method: 'search_read',
////                    args: [[]],
//                    args: [[['pricelist_id','=',self.config.pricelist_id[0]]]],
//                });
                self.setLoadingMessage(_t('Loading') + ' product.pricelist', 1);
                return records.then(function (pricelists) {
                    _.map(pricelists, function (pricelist) { pricelist.items = []; });
                    self.default_pricelist = _.findWhere(pricelists, {id: self.config.pricelist_id[0]});
                    self.pricelists = pricelists;
                    return pListItem.then(function (pricelist_items) {
                        var pricelist_by_id = {};
                        _.each(self.pricelists, function (pricelist) {
                            pricelist_by_id[pricelist.id] = pricelist;
                        });
                        _.each(pricelist_items, function (item) {
                            var pricelist = pricelist_by_id[item.pricelist_id[0]];
                            pricelist.items.push(item);
                            item.base_pricelist = pricelist_by_id[item.base_pricelist_id[0]];
                        });

                    });
                });
            });
        },
    });
});