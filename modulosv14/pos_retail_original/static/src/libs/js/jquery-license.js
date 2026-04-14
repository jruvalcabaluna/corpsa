odoo.define('pos_retail.license', function (require) {
    var models = require('point_of_sale.models');
    var rpc = require('web.rpc');
    var core = require('web.core');
    var _super_PosModel = models.PosModel.prototype;
    var qweb = core.qweb;

    models.PosModel = models.PosModel.extend({
        async _auto_check_license() {
            const registerLicense = async (...args) => {
                let {confirmed, payload: license} = await self.chrome.showPopup('TextAreaPopup', {
                    title: 'Input Your License Code here, If you have not, Please send email to: thanhchatvn@gmail.com with Subject [REQUEST-LICENSE][Your Purchased Number][Your Database (' + this.session.db + ')]',
                    startingValue: '',
                })
                if (confirmed) {
                    let isValid = await rpc.query({
                        model: 'pos.session',
                        method: 'register_license',
                        args: [[], license]
                    }, {
                        shadow: true,
                        timeout: 65000,
                    }).then(function (isValid) {
                        return isValid
                    }, function (err) {
                        window.location = '/web#action=point_of_sale.action_client_pos_menu';
                    });
                    if (!isValid) {
                        return self.chrome.showPopup('ErrorPopup', {
                            title: 'Error !!!',
                            body: 'Your License Code is wrong !!!'
                        })
                    } else {
                        self.session.license = true
                        $('.trial').addClass('oe_hidden')
                        return self.chrome.showPopup('ConfirmPopup', {
                            title: 'Great Job',
                            body: 'License register succeed, thanks for your purchased. We starting support your POS 2 months from now. If have any issues or bugs or something like that, pelase contact direct us email: thanhchatvn@gmail.com'
                        })
                    }
                }
            }

            const logOutPOS = async (...args) => {
                let {confirmed, payload: license} = await self.chrome.showPopup('TextAreaPopup', {
                    title: 'Warning',
                    startingValue: 'Your POS Retail is Standard Version, ONLY TOTAL 3 POS SESSIONS OPENED THE SAME TIME, If you need Nothing Limited, Please contact us via email: thanhchatvn@gmail.com for Upgrade to Pro Version',
                })
                if (confirmed) {
                    window.location = '/web#action=point_of_sale.action_client_pos_menu';
                    window.open('https://apps.odoo.com/apps/modules/14.0/pos_retail/', '_blank');
                } else {
                    window.location = '/web#action=point_of_sale.action_client_pos_menu';
                    window.open('https://apps.odoo.com/apps/modules/14.0/pos_retail/', '_blank');
                }
            }


            var self = this;
            if (!this.session.license) {
                setTimeout(function () {
                    var TrialWidget = qweb.render('TrialWidget', {
                        database: self.session.db,
                        message: ': Trial Version will Expired after 1 Month, Please input your license (Click here)'
                    });
                    $('.placeholder-Base').html(TrialWidget)
                    $('.trial').click(function () {
                        registerLicense()
                    })
                }, 5000)
                setTimeout(function () {
                    $('.placeholder-Base').addClass('oe_hidden')
                }, 15000)
            }
            if (!this.session['pos_retail']) {
                let total_sessions_opened = await rpc.query({
                    model: 'pos.session',
                    method: 'get_session_online',
                    args: [[]]
                }, {
                    shadow: true,
                    timeout: 65000,
                }).then(function (total_sessions_opened) {
                    return total_sessions_opened
                }, function (err) {
                    logOutPOS()
                });
                if (total_sessions_opened >= 3) {
                    logOutPOS()
                }
            }
            setTimeout(_.bind(this._auto_check_license, this), 60000);
        },
        load_server_data: function () {
            var self = this;
            return _super_PosModel.load_server_data.apply(this, arguments).then(function () {
                self._auto_check_license()
                rpc.query({
                    model: 'pos.session',
                    method: 'check_expired_license',
                    args: [[]]
                }, {
                    shadow: true,
                    timeout: 65000,
                }).then(function (balanceDay) {
                    if (balanceDay >= 350 && balanceDay <= 365) {
                        self.chrome.showPopup('ConfirmPopup', {
                            title: 'Warning, Your License will Expired after : ' + (365 - balanceDay) + ' (days).',
                            body: 'Please contact us direct email: thanhchatvn@gmail.com for renew license'
                        })
                    }
                    if (balanceDay >= 366) {
                        self.chrome.showPopup('ErrorPopup', {
                            title: 'Warning',
                            body: 'Your license is expired, please contact us direct email: thanchchatvn@gmail.com for renew License. We will closing your pos session after 30 seconds from now'
                        })
                        setTimeout(function (p) {
                            window.location = '/web#action=point_of_sale.action_client_pos_menu';
                        }, 30000)
                    }
                }, function (err) {
                    setTimeout(function () {
                        self.chrome.showPopup('ErrorPopup', {
                            title: 'Great Jobs',
                            body: 'You are Pro, have crasked license POS Retail. We will closing POS Now, few 30 seconds from now. if you need renew license, please contact us direct email thanhchatvn@gmail.com'
                        })
                    }, 500)
                    setTimeout(function (p) {
                        window.location = '/web#action=point_of_sale.action_client_pos_menu';
                    }, 30000)
                });

            })
        },
    })
})
