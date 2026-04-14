odoo.define('pos_retail.ClientLine', function (require) {
    'use strict';

    const ClientLine = require('point_of_sale.ClientLine');
    const {useListener} = require('web.custom_hooks');
    const Registries = require('point_of_sale.Registries');
    const {posbus} = require('point_of_sale.utils');

    const RetailClientLine = (ClientLine) =>
        class extends ClientLine {
            constructor() {
                super(...arguments);
                useListener('set-message', this.sendMessage);
                if (this.env.pos.config.big_datas_sync_backend) {
                    this._autoSyncBackend()
                }
            }

            async _autoSyncBackend() {
                let partner_object = this.env.pos.get_model('res.partner');
                let syncResponse = await this.rpc({
                    model: 'res.partner',
                    method: 'search_read',
                    fields: partner_object.fields,
                    args: [[['id', '=', this.props.partner.id], ['write_date', '!=', this.props.partner.write_date]]]
                }, {
                    shadow: true,
                    timeout: 7500
                })
                if (syncResponse.length == 1) {
                    console.log('[_autoSyncBackend] partner id: ' + syncResponse[0].id)
                    this.env.pos.sync_with_backend('res.partner', syncResponse, false)
                }
            }

            async addBarcode() {
                let newBarcode = await this.rpc({ // todo: template rpc
                    model: 'res.partner',
                    method: 'add_barcode',
                    args: [[this.props.partner.id]]
                })
                await this.env.pos.sync_products_partners();
                if (newBarcode) {
                    this.props.partner['barcode'] = newBarcode
                    this.render()
                }
            }

            async printBarcode() {
                await this.env.pos.do_action('pos_retail.res_partner_card_badge', {
                    additional_context: {
                        active_id: this.props.partner.id,
                        active_ids: [this.props.partner.id],
                    }
                }, {
                    shadow: true,
                    timeout: 6500
                });
            }

            async sendMessage(selectedClient) {
                if (!selectedClient['mobile'] && !selectedClient['phone']) {
                    return this.showPopup('ErrorPopup', {
                        title: this.env._t('Warning'),
                        body: this.env._t('Customer missed Mobile and Phone, it not possible send message via WhatsApp')
                    })
                } else {
                    let startingValue = this.env._t('Dear ') + selectedClient.name + '\n';
                    startingValue += this.env._t('---- *** This is your account information *** ------ \n');
                    startingValue += this.env._t('You have Total Loyalty Points: ') + this.env.pos.format_currency_no_symbol(selectedClient.pos_loyalty_point) + '\n';
                    startingValue += this.env._t('With Credit Points: ') + this.env.pos.format_currency_no_symbol(selectedClient.balance) + '\n';
                    startingValue += this.env._t('With Wallet Points: ') + this.env.pos.format_currency_no_symbol(selectedClient.wallet) + '\n';
                    startingValue += this.env._t('-------- \n');
                    startingValue += this.env._t('Thanks you for choice our services.');
                    let {confirmed, payload: messageNeedSend} = await this.showPopup('TextAreaPopup', {
                        title: this.env._t('What message need to send Client ?'),
                        startingValue: startingValue
                    })
                    if (confirmed) {
                        let mobile_no = selectedClient['phone'] || selectedClient['mobile']
                        let message = messageNeedSend
                        let responseOfWhatsApp = await this.rpc({
                            model: 'pos.config',
                            method: 'send_message_via_whatsapp',
                            args: [[], this.env.pos.config.id, mobile_no, message],
                        });
                        if (responseOfWhatsApp && responseOfWhatsApp['id']) {
                            return this.showPopup('ConfirmPopup', {
                                title: this.env._t('Successfully'),
                                body: this.env._t("Send successfully message to your Client's Phone WhatsApp: ") + mobile_no,
                                disableCancelButton: true,
                            })
                        } else {
                            return this.showPopup('ErrorPopup', {
                                title: this.env._t('Error'),
                                body: this.env._t("Send Message is fail, please check WhatsApp API and Token of your pos config or Your Server turn off Internet"),
                                disableCancelButton: true,
                            })
                        }
                    }
                }
            }

            get countOrdersByClient() {
                if (this.env.pos.db.order_by_partner_id[this.props.partner.id]) {
                    return this.env.pos.db.order_by_partner_id[this.props.partner.id].length
                } else {
                    return 0
                }
            }
        }
    Registries.Component.extend(ClientLine, RetailClientLine);

    return RetailClientLine;
});
