odoo.define("pos_fl.models", function (require) {
    "use strict";

    const models = require("point_of_sale.models");
    const rpc = require("web.rpc");
    const session = require("web.session");
    const concurrency = require("web.concurrency");

    const core = require("web.core");
    var utils = require('web.utils');
    const _t = core._t;

    const Chrome = require('point_of_sale.Chrome');

    models.load_fields('res.partner','is_doctor');

    var _order_super = models.Order.prototype;
    models.Order = models.Order.extend({
        initialize: function(attr, options) {
        _order_super.initialize.call(this,attr,options);
        this.doctor_id = this.doctor_id || [];
        },

        init_from_JSON: function (json) {
            let res = _order_super.init_from_JSON.apply(this, arguments);
            if (json.doctor_id) {
                this.doctor_id = json.doctor_id
            }
            return res;
        },

        export_as_JSON: function () {
            let json = _order_super.export_as_JSON.apply(this, arguments);
            if (this.doctor_id) {
                json.doctor_id = this.doctor_id;
            }
            return json;

        },
    });

});




