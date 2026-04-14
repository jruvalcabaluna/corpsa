odoo.define('pos_retail.Chrome', function (require) {
    'use strict';

    const Chrome = require('point_of_sale.Chrome');
    const Registries = require('point_of_sale.Registries');
    var web_framework = require('web.framework');
    var core = require('web.core');
    var QWeb = core.qweb;
    var field_utils = require('web.field_utils');
    const {posbus} = require('point_of_sale.utils');

    const RetailChrome = (Chrome) =>
        class extends Chrome {
            constructor() {
                super(...arguments);
            }

            get startScreen() {
                if (this.env.pos.config.sync_multi_session && this.env.pos.config.screen_type == 'kitchen') {
                    return {name: 'KitchenScreen', props: {}};
                } else {
                    return super.startScreen;
                }
            }

            resizeImageToDataUrl(img, maxwidth, maxheight, callback) {
                img.onload = function () {
                    var canvas = document.createElement('canvas');
                    var ctx = canvas.getContext('2d');
                    var ratio = 1;

                    if (img.width > maxwidth) {
                        ratio = maxwidth / img.width;
                    }
                    if (img.height * ratio > maxheight) {
                        ratio = maxheight / img.height;
                    }
                    var width = Math.floor(img.width * ratio);
                    var height = Math.floor(img.height * ratio);

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);

                    var dataurl = canvas.toDataURL();
                    callback(dataurl);
                };
            }

            async loadImageFile(file, callback) {
                var self = this;
                if (!file) {
                    return;
                }
                if (file.type && !file.type.match(/image.*/)) {
                    return this.this.showPopup('ErrorPopup', {
                        title: 'Error',
                        body: 'Unsupported File Format, Only web-compatible Image formats such as .png or .jpeg are supported',
                    });
                }
                var reader = new FileReader();
                reader.onload = function (event) {
                    var dataurl = event.target.result;
                    var img = new Image();
                    img.src = dataurl;
                    self.resizeImageToDataUrl(img, 600, 400, callback);
                };
                reader.onerror = function () {
                    return self.this.showPopup('ErrorPopup', {
                        title: 'Error',
                        body: 'Could Not Read Image, The provided file could not be read due to an unknown error',
                    });
                };
                await reader.readAsDataURL(file);
            }

            mounted() {
                super.mounted()
                posbus.on('hide-header', this, this.reloadScreen);
            }

            willUnmount() {
                super.willUnmount()
                posbus.off('hide-header', this);
            }

            reloadScreen() {
                this.state.hidden = true
                this.render()
            }

            _setIdleTimer() {
                // todo: odoo LISTEN EVENTS 'mousemove mousedown touchstart touchend touchmove click scroll keypress'
                // IF HAVE NOT EVENTS AUTO BACK TO FLOOR SCREEN
                return; // KIMANH
            }

            async start() {
                await super.start()
                this.env.pos.chrome = this
                this.closeOtherTabs()
                if (this.env.pos.config.restaurant_order || this.env.pos.session.restaurant_order) this.showTempScreen('RegisterScreen');
                if (this.env.pos.config.checkin_screen) this.showTempScreen('CheckInScreen');
            }

            closeOtherTabs() {
                const self = this;
                // avoid closing itself
                var now = Date.now();
                localStorage['message'] = '';
                localStorage['message'] = JSON.stringify({
                    'message': 'close_tabs',
                    'config': this.env.pos.config.id,
                    'window_uid': now,
                });
                window.addEventListener("storage", function (event) {
                    var msg = event.data;

                    if (event.key === 'message' && event.newValue) {

                        var msg = JSON.parse(event.newValue);
                        if (msg.message === 'close_tabs' &&
                            msg.config == self.env.pos.config.id &&
                            msg.window_uid != now && self.env.pos.config.sync_multi_session) {
                            console.info('POS Sync multi session, 1 Tab only allow open 1 session of 1 POS config');
                            window.location = '/web#action=point_of_sale.action_client_pos_menu';
                        }
                    }

                }, false);
            }

            async _showStartScreen() {
                // when start screen, we need loading to KitchenScreen for listen event sync from another sessions
                if (this.env.pos.config.sync_multi_session && this.env.pos.config.kitchen_screen) {
                    await this.showScreen('KitchenScreen')
                }
                if (this.env.pos.config.sync_multi_session && this.env.pos.config.qrcode_order_screen) {
                    await this.showScreen('QrCodeOrderScreen')
                }
                super._showStartScreen()
            }

            async openApplication() {
                let {confirmed, payload: result} = await this.showPopup('ConfirmPopup', {
                    title: 'Welcome to POS Retail. 1st POS Solution of Odoo',
                    body: 'Copyright (c) 2014-2020 of TL TECHNOLOGY \n' +
                        '  Email: thanhchatvn@gmail.com \n' +
                        '  Skype: thanhchatvn',
                    disableCancelButton: true,
                })
                if (confirmed) {
                    window.open('https://join.skype.com/invite/j2NiwpI0OFND', '_blank')
                }
            }

            async __showScreen({detail: {name, props = {}}}) {
                super.__showScreen(...arguments)
                // if (this.env.pos.config.big_datas_sync_realtime) { // todo: if bus.bus not active, when change screen we auto trigger update with backend
                //     this.env.pos.trigger('backend.request.pos.sync.datas');
                // }
                if (name == 'ProductScreen') {
                    posbus.trigger('back-products-screen')
                }
            }

            async showAppInformation() {
                let {confirmed, payload: result} = await this.showPopup('ConfirmPopup', {
                    title: 'Thanks for choice POS Retail. 1st POS Solution of Odoo',
                    body: 'Copyright (c) 2014-2020 of TL TECHNOLOGY \n' +
                        '  Email: thanhchatvn@gmail.com \n' +
                        '  Skype: thanhchatvn \n' +
                        'If you need support direct us, Please click OK button and direct message via Skype',
                    disableCancelButton: true,
                })
                if (confirmed) {
                    window.open('https://join.skype.com/invite/j2NiwpI0OFND', '_blank')
                }
            }

            async closingSession() {
                this.state.uiState = 'CLOSING'
                this.setLoadingMessage('Waiting few seconds, we closing and posting entries your POS Session. May be need few times ...')
                return await this.rpc({
                    model: 'pos.session',
                    method: 'force_action_pos_session_close', //close_session_and_validate
                    args: [[this.env.pos.pos_session.id]]
                })
            }

            __closePopup() {
                super.__closePopup()
                posbus.trigger('closed-popup') // i need add this event for listen event closed popup and add event keyboard back product screen
            }

            async _setClosingCash() {
                let sessions = await this.rpc({
                    model: 'pos.session',
                    method: 'search_read',
                    args: [[['id', '=', this.env.pos.pos_session.id]]]
                })
                if (sessions.length) {
                    const sessionSelected = sessions[0]
                    let startedAt = field_utils.parse.datetime(sessionSelected.start_at);
                    sessionSelected.start_at = field_utils.format.datetime(startedAt);
                    let {confirmed, payload: values} = await this.showPopup('CashSession', {
                        title: this.env._t('Management Cash Control your Session'),
                        session: sessionSelected
                    })
                    if (confirmed) {
                        let action = values.action;
                        if ((action == 'putMoneyIn' || action == 'takeMoneyOut') && values.value.amount != 0) {
                            await this.rpc({
                                model: 'cash.box.out',
                                method: 'cash_input_from_pos',
                                args: [0, values.value],
                            })
                            this.onClick();
                        }
                        if (action == 'setClosingBalance' && values.value.length > 0) {
                            await this.rpc({
                                model: 'account.bank.statement.cashbox',
                                method: 'validate_from_ui',
                                args: [0, this.env.pos.pos_session.id, 'end', values.value],
                            })
                            await this._setClosingCash();
                        }
                    }
                }
            }

            async _closePos() {
                const self = this;
                let lists = [
                    {
                        name: this.env._t('Only Close your POS Session'),
                        item: 0,
                        id: 0,
                    },
                    {
                        name: this.env._t('Logout Odoo'),
                        item: 2,
                        id: 2,
                    },
                ]
                if (this.env.pos.user && (this.env.pos.config.allow_closing_session || this.env.pos.user.role == 'manager')) {
                    lists.push({
                        name: this.env._t('Logout POS Session and auto Closing Posting Entries Current Session'),
                        item: 1,
                        id: 1,
                    })
                    lists.push({
                        name: this.env._t('Logout POS Session, auto Closing Posting Entries current Session and Logout Odoo'),
                        item: 3,
                        id: 3,
                    })
                    lists.push({
                        name: this.env._t('Closing Posting Entries current Session and Print Z-Report'),
                        item: 4,
                        id: 4,
                    })
                }
                if (this.env.pos.config.cash_control && this.env.pos.config.management_session) {
                    lists.push({
                        name: this.env._t('Set Closing Cash'),
                        item: 5,
                        id: 5,
                    })
                }
                let {confirmed, payload: selectedCloseTypes} = await this.showPopup(
                    'PopUpSelectionBox',
                    {
                        title: this.env._t('Select close session type'),
                        items: lists,
                        onlySelectOne: true,
                    }
                );
                if (confirmed && selectedCloseTypes['items'] && selectedCloseTypes['items'].length == 1) {
                    const typeId = selectedCloseTypes['items'][0]['id']
                    if (typeId == 0) {
                        return super._closePos()
                    }
                    if (typeId == 1) {
                        await this.closingSession()
                        super._closePos()
                        window.location = '/web?#id=' + this.env.pos.pos_session.id + '&model=pos.session&view_type=form'
                    }
                    if (typeId == 2) {
                        web_framework.redirect('/web/session/logout', 5000);
                        // super._closePos()
                    }
                    if (typeId == 3) {
                        await this.closingSession()
                        web_framework.redirect('/web/session/logout', 5000);
                        // super._closePos()
                    }
                    if (typeId == 4) {
                        await this.closingSession()
                        let params = {
                            model: 'pos.session',
                            method: 'build_sessions_report',
                            args: [[this.env.pos.pos_session.id]],
                        };
                        let values = await this.rpc(params, {shadow: true}).then(function (values) {
                            return values
                        }, function (err) {
                            return self.env.pos.query_backend_fail(err);
                        })
                        let reportData = values[this.env.pos.pos_session.id];
                        let start_at = field_utils.parse.datetime(reportData.session.start_at);
                        start_at = field_utils.format.datetime(start_at);
                        reportData['start_at'] = start_at;
                        if (reportData['stop_at']) {
                            var stop_at = field_utils.parse.datetime(reportData.session.stop_at);
                            stop_at = field_utils.format.datetime(stop_at);
                            reportData['stop_at'] = stop_at;
                        }
                        let reportHtml = QWeb.render('ReportSalesSummarySession', {
                            pos: this.env.pos,
                            report: reportData,
                        });
                        this.showScreen('ReportScreen', {
                            report_html: reportHtml
                        });
                        let {confirmed} = await this.showPopup('ConfirmPopup', {
                            title: this.env._t('Alert'),
                            body: this.env._t('We will closing after 10 seconds from now ?'),
                            disableCancelButton: true,
                        })
                        setTimeout(function () {
                            window.location = '/web#action=point_of_sale.action_client_pos_menu';
                        }, 10000)
                    }
                    if (typeId == 5) {
                        await this._setClosingCash()
                    }
                }
            }
        }
    Registries.Component.extend(Chrome, RetailChrome);

    return RetailChrome;
});
