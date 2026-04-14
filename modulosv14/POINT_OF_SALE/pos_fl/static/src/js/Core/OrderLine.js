odoo.define("pos_fl.OrderLine", function (require) {
    "use strict";

    const Orderline = require("point_of_sale.Orderline");
    const Registries = require("point_of_sale.Registries");
    const core = require('web.core');
    const _t = core._t;

    const PosOrderline = (Orderline) =>
        class extends Orderline {
//            removeLine() {
//                this.props.line.set_quantity("remove");
//            }
            async removeLine() {
                    let validate = await this._validate_action(this.env._t(' Necesario aprobar por Supervisor: '));
                    if (!validate) {
                        return this.showPopup('ErrorPopup', {
                            title: this.env._t('Advertencia!'),
                            body: this.env._t('No tienes permisos para eliminar lineas, solocita la aprobacion de un Supervisor!')
                        });
                    }
                this.props.line.set_quantity("remove");
            }

            async _validate_action(title) {
            let validate = await this._validate_by_manager(title);
            if (!validate) {
                this.showPopup('ErrorPopup', {
                    title: this.env._t('Fallo Validacion !!!'),
                    body: this.env._t(
                        'Tu accion requiere aprobacion de un Supervisor'
                        ),
                    });
                    return false;
                }
                return true
            }

            async _validate_by_manager(title) {
                let self = this;
                let manager_validate = [];
                _.each(this.env.pos.config.manager_ids, function (user_id) {
                    let user = self.env.pos.user_by_id[user_id];
                    if (user) {
                        manager_validate.push({
                            id: user.id,
                            label: user.name,
                            item: user,
                            imageUrl: 'data:image/png;base64, ' + user['image_1920'],
                        })
                    }
                });
                if (manager_validate.length == 0) {
                    this.showPopup('ConfirmPopup', {
                        title: this.env._t('Advertencia!'),
                        body: this.env._t('La configuracion POS PIN de Seguridad no esta establecida!'),
                        disableCancelButton: true,
                    })
                    return false
                }
                let popup_title = this.env._t('Selecciona Supervisor');
                if (title) {
                    popup_title += ' : ' + title;
                }
                if (manager_validate.length > 1) {
                    let {confirmed, payload: selected_user} = await this.showPopup('SelectionPopup', {
                        title: popup_title,
                        list: manager_validate,
                    })
                    if (confirmed) {
                        let manager_user = selected_user;
                        let {confirmed, payload: password} = await self.showPopup('NumberPopup', {
                            title: _t('Estimado:  ') + manager_user.name + this.env._t('. Digitar PIN para validar esta accion de ') + this.env.pos.user.name,
                            isPassword: true,
                            allowScanBarcode: true,
                        });
                        if (confirmed) {
                            if (manager_user['pos_security_pin'] != password) {
                                alert('PIN Seguridad de ' + manager_user.name + ' es Incorrecto!')
//                                this.alert_message({
//                                    title: _t('Warning'),
//                                    body: _t('Pos Security Pin of ') + manager_user.name + _t(' Incorrect.')
//                                })
                                return self._validate_by_manager(title)
                            } else {
                                return true
                            }
                        } else {
                            return false
                        }
                    } else {
                        return false
                    }
                } else {
                    let manager_user = manager_validate[0]['item'];
                    let {confirmed, payload: password} = await self.showPopup('NumberPopup', {
                        title: _t('Estimado:  ') + manager_user.name + this.env._t('. Digitar PIN para validar esta accion de ') + this.env.pos.user.name,
                        isPassword: true,
                        allowScanBarcode: true,
                    });
                    if (confirmed) {
                        if (manager_user['pos_security_pin'] != password) {
                            alert('PIN Seguridad de ' + manager_user.name + ' es Incorrecto!')
//                            this.env.pos.alert_message({
//                                title: _t('Warning'),
//                                body: _t('Pos Security Pin of ') + manager_user.name + _t(' Incorrect.')
//                            })
                            return self._validate_by_manager(title)
                        } else {
                            return true
                        }
                    } else {
                        return false
                    }
                }
            }
        };
    Registries.Component.extend(Orderline, PosOrderline);
    return Orderline;
});
