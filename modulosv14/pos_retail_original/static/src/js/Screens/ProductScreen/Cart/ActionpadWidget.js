odoo.define('pos_retail.RetailActionpadWidget', function (require) {
    'use strict';

    const ActionpadWidget = require('point_of_sale.ActionpadWidget');
    const {useState} = owl.hooks;
    const Registries = require('point_of_sale.Registries');
    ActionpadWidget.template = 'RetailActionpadWidget';
    Registries.Component.add(ActionpadWidget);

    const RetailActionpadWidget = (ActionpadWidget) =>
        class extends ActionpadWidget {
            constructor() {
                super(...arguments);
                this._currentOrder = this.env.pos.get_order();
                if (this._currentOrder) {
                    this._currentOrder.orderlines.on('change', this._totalWillPaid, this);
                    this._currentOrder.orderlines.on('remove', this._totalWillPaid, this);
                    this._currentOrder.paymentlines.on('change', this._totalWillPaid, this);
                    this._currentOrder.paymentlines.on('remove', this._totalWillPaid, this);
                    this.env.pos.on('change:selectedOrder', this._updateCurrentOrder, this);
                }
                this.state = useState({total: 0, tax: 0});
                this._totalWillPaid()
            }

            willUnmount() {
                if (this._currentOrder) {
                    this._currentOrder.orderlines.off('change', null, this);
                }
                this.env.pos.off('change:selectedOrder', null, this);
            }

            _updateCurrentOrder(pos, newSelectedOrder) {
                this._currentOrder.orderlines.off('change', null, this);
                if (newSelectedOrder) {
                    this._currentOrder = newSelectedOrder;
                    this._currentOrder.orderlines.on('change', this._totalWillPaid, this);
                }
            }

            _totalWillPaid() {
                const total = this._currentOrder ? this._currentOrder.get_total_with_tax() : 0;
                const due = this._currentOrder ? this._currentOrder.get_due() : 0;
                const tax = this._currentOrder ? total - this._currentOrder.get_total_without_tax() : 0;
                this.state.total = this.env.pos.format_currency(due);
                this.state.tax = this.env.pos.format_currency(tax);
                this.render();
            }

            get allowDisplay() {
                let selectedOrder = this.env.pos.get_order();
                if (!selectedOrder || !this.env.pos.config.allow_payment || (selectedOrder && selectedOrder.get_orderlines().length == 0)) {
                    return false
                } else {
                    return true
                }
            }
        }
    Registries.Component.extend(ActionpadWidget, RetailActionpadWidget);

    return ActionpadWidget;
});
