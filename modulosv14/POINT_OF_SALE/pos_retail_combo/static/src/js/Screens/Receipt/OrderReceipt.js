odoo.define('pos_retail_combo.OrderReceipt', function (require) {
    'use strict';

    const Registries = require('point_of_sale.Registries');
    const OrderReceipt = require('point_of_sale.OrderReceipt');

    const RetailOrderReceipt = (OrderReceipt) =>
        class extends OrderReceipt {
            constructor() {
                super(...arguments);
                this._receiptEnv = this.env.pos.getReceiptEnv();
                if (!this._receiptEnv) { // reprint at order management
                    this._receiptEnv = this.props.order.getOrderReceiptEnv();
                }
            }

            willUpdateProps(nextProps) {
                if (nextProps.order) { // restaurant has error when back to floor sreeen, order is null and nextProps.order is not found
                    super.willUpdateProps(nextProps)
                } else {
                    console.warn('Your POS active iface_print_skip_screen, please turn it off. This feature make lose order')
                }
            }
        }

    Registries.Component.extend(OrderReceipt, RetailOrderReceipt);
//    if (self.odoo.session_info && self.odoo.session_info['config']['receipt_template'] == 'retail') {
//        OrderReceipt.template = 'RetailOrderReceipt';
//    }

    Registries.Component.add(RetailOrderReceipt);
    return OrderReceipt;
});