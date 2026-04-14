odoo.define('pos_retail.ProxyStatus', function (require) {
    'use strict';

    const ProxyStatus = require('point_of_sale.ProxyStatus');
    const Registries = require('point_of_sale.Registries');

    const RetailProxyStatus = (ProxyStatus) =>
        class extends ProxyStatus {
            constructor() {
                super(...arguments);
            }

            _setStatus(newStatus) {
                super._setStatus(newStatus)
                if (this.env.pos.config.proxy_ip && newStatus['drivers'] && newStatus['drivers']['escpos']) {
                    let msg = this.env._t('Escpos Connected');
                    this.state.status = newStatus['escpos'];
                    this.state.msg = msg;
                }
            }
        }
    Registries.Component.extend(ProxyStatus, RetailProxyStatus);

    return RetailProxyStatus;
});
