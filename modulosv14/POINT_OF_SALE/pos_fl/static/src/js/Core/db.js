odoo.define('pos_fl.db', function (require) {
    const db = require('point_of_sale.db');
    const _super_db = db.prototype;
    const utils = require('web.utils');

    _super_db._partner_search_string = function (partner) {
        let str = partner.display_name;
        if (partner.parent_id) {
            str += '|' + partner.parent_id[1];
        }
        if (partner.ref) {
            str += '|' + partner.ref;
        }
        if (partner.vat) {
            str += '|' + partner.vat;
        }
        if (partner.barcode) {
            str += '|' + partner.barcode;
        }
        if (partner.phone) {
            str += '|' + partner.phone.split(' ').join('');
        }
        if (partner.mobile) {
            str += '|' + partner.mobile.split(' ').join('');
        }
        if (partner.email) {
            str += '|' + partner.email;
        }
        str = '' + partner.id + ':' + str.replace(':', '') + '\n';
        return str;
    };

});