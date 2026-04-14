odoo.define('pos_retail.AbstractReceiptScreen', function (require) {
    'use strict';

    const AbstractReceiptScreen = require('point_of_sale.AbstractReceiptScreen');
    const Registries = require('point_of_sale.Registries');

    const RetailAbstractReceiptScreen = (AbstractReceiptScreen) =>
        class extends AbstractReceiptScreen {
            constructor() {
                super(...arguments);
            }

            async _printReceipt() {
                if (this.env.pos.config.proxy_ip && this.env.pos.config.iface_print_via_proxy) {
                    console.log('[_printReceipt] POSBOX proxy setup succeed. Auto print direct POSBOX')
                    if (this.env.pos.reportXML) {
                        const printResult = await this.env.pos.proxy.printer.print_receipt(this.env.pos.reportXML);
                        if (printResult.successful) {
                            return true;
                        }
                    } else {
                        return super._printReceipt()
                    }
                    this.env.pos.reportXML = null;
                    return true
                }
                if (!this.orderReceipt.el || this.orderReceipt.el || (this.orderReceipt.el && !this.orderReceipt.el.outerHTML)) {
                    return await this._printWeb();
                } else {
                    return super._printReceipt()
                }
            }
        }
    Registries.Component.extend(AbstractReceiptScreen, RetailAbstractReceiptScreen);

    return RetailAbstractReceiptScreen;
});
