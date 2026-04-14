odoo.define('pos_retail.LicenseExpiredDays', function (require) {
    'use strict';

    const PosComponent = require('point_of_sale.PosComponent');
    const Registries = require('point_of_sale.Registries');
    var BarcodeEvents = require('barcodes.BarcodeEvents').BarcodeEvents;
    const {useState, useRef, useContext} = owl.hooks;

    class LicenseExpiredDays extends PosComponent {
        constructor() {
            super(...arguments);
            this.changes = {
                code: 403,
                isValid: false,
                expiredDays: 30,
                message: 'License Activated'
            }
            this.state = useState(this.changes);
        }

        mounted() {
            super.mounted();
            this._bindBackendServer();
        }

        onClick() {
            this.showPopup('ErrorPopup', {
                title: this.env._t('Please contact direct us email thanhchatvn@gmail.com get License'),
                body: this.env._t('Your pos will Expired after ' + this.state.expiredDays + ' (days). Please contact direct us active this license')
            })
        }

        async _bindBackendServer(ev) {
            const value = await this.rpc({
                 model: 'pos.session',
                method: 'getExpiredDays',
                args: [[]]
            })
            this.state.isValid = value.isValid
            this.state.code = value.code
            if (!this.state.isValid) {
                if (value.usedDays > 30) {
                    this.state.expiredDays = 0
                } else {
                    this.state.expiredDays = 30 - value.usedDays
                }
                if (this.state.expiredDays > 0) {
                    this.state.message = 'Your POS License will Expired after: ' + this.state.expiredDays + ' (days)'
                } else {
                    this.state.message = 'Your POS License is Expired !!!'
                    this.env.pos.chrome.state.uiState = 'CLOSING'
                    this.env.pos.chrome.setLoadingMessage('We so Sorry, Your License is expired. We required Blocked your POS Session. Please contact direct us thanhchatvn@gmail.con for register license')
                }
            }
            this.render()
        }


    }

    LicenseExpiredDays.template = 'LicenseExpiredDays';

    Registries.Component.add(LicenseExpiredDays);

    return LicenseExpiredDays;
});
