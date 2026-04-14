odoo.define('pos_retail.NumberPopup', function (require) {
    'use strict';

    const NumberPopup = require('point_of_sale.NumberPopup');
    const Registries = require('point_of_sale.Registries');
    const {posbus} = require('point_of_sale.utils');
    const {useExternalListener} = owl.hooks;

    const RetailNumberPopup = (NumberPopup) =>
        class extends NumberPopup {
            constructor() {
                super(...arguments);
                useExternalListener(window, 'keyup', this._keyUp);
            }

            willUnmount() {
                super.willUnmount();
                posbus.off('scan.barcode.validate.badgeID', this, null);

            }

            mounted() {
                super.mounted();
                posbus.on('scan.barcode.validate.badgeID', this, this._scanbarcode); // validate by manager via scan badgetID of user manager
            }

            _scanbarcode(code) {
                const userValidate = this.env.pos.users.find(u => u.barcode == code)
                if (userValidate) {
                    this.props.resolve({confirmed: true, payload: userValidate['pos_security_pin']});
                    this.trigger('close-popup');
                    this.env.pos.alert_message({
                        title: this.env._t('Successfully'),
                        body: this.env._t('Manager Approved !!!'),
                        color: 'success'
                    })
                    this.env.pos.validate_manager = true;
                }
            }

            _keyUp(event) {
                if (event.key == 'F1') {
                    this.fullFillValue()
                }
                if (event.key == 'Enter') {
                    this.confirm()
                }
            }

            get inputBuffer() {
                if (this.state.buffer === null) {
                    return '';
                }
                if (this.props.isPassword) {
                    return this.state.buffer.replace(/./g, '•');
                } else {
                    if (this.state.buffer == "") {
                        return this.state.buffer
                    } else {
                        /**
                         * Stackoverflow: https://stackoverflow.com/questions/149055/how-to-format-numbers-as-currency-string
                         * Number.prototype.format(n, x, s, c)
                         *
                         * @param integer n: length of decimal
                         * @param integer x: length of whole part
                         * @param mixed   s: sections delimiter
                         * @param mixed   c: decimal delimiter
                         */
                        Number.prototype.format = function (n, x, s, c) {
                            var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
                                num = this.toFixed(Math.max(0, ~~n));

                            return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
                        };
                        const value = (parseFloat(this.state.buffer)).format(this.env.pos.config.decimal_places, 3, '.', ',');
                        return value
                        //return this.env.pos.format_currency_no_symbol(this.state.buffer)

                    }
                }
            }

            async fullFillValue() {
                this.state.buffer = this.props.fullFillAmount
                this.confirm()
            }
        };

    Registries.Component.extend(NumberPopup, RetailNumberPopup);
    return RetailNumberPopup

});
