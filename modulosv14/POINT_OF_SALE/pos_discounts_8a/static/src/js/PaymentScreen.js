odoo.define('pos_discounts_8a.PaymentScreen', function(require) {
    'use strict';

    const PaymentScreen = require('point_of_sale.PaymentScreen');
    const Registries = require('point_of_sale.Registries');
    const session = require('web.session');

    const UpdatePaymentScreen = PaymentScreen =>
        class extends PaymentScreen {

            discount_group_made_internal_transfer(group_id, discount_to_purchase) {
            var self = this;
            let orderSelected = this.env.pos.get_order();
            let toDay = new Date().toISOString().split('T')[0];
            var refund_stock_location = this.env.pos.config.refund_stock_location_id;
            var refund_stock_location_dest_id = this.env.pos.config.refund_stock_location_dest_id;
            var refund_stock_operation_type_id = this.env.pos.config.refund_stock_operation_type_id;
            var moveLines = [];
                moveLines.push({
                                name: 'ENTRADA POR DESCUENTO',
                                picking_type_id: parseInt(refund_stock_operation_type_id),
                                location_id: parseInt(refund_stock_location),
                                location_dest_id: parseInt(refund_stock_location_dest_id),
                                product_id: group_id,
                                product_uom_qty: 1,
                                product_uom: 1
                            });
            var pickingVals = {
                        is_locked: true,
                        origin: orderSelected['name'],
                        picking_type_id: parseInt(refund_stock_operation_type_id),
                        location_id: parseInt(refund_stock_location),
                        location_dest_id: parseInt(refund_stock_location_dest_id),
                        move_type: 'direct',
                        note: 'note',
                        scheduled_date: toDay,
                        immediate_transfer: true,
            };
            return this.rpc({
                model: 'stock.picking',
                method: 'pos_discount_group_made_internal_transfer',
                args: [pickingVals, moveLines],
                        context: {}
            }).then(function (value) {
               return value
            }, function (error) {
               return (error)
             });
            }

//          Override validateOrder function for add discount_group_made_internal_transfer
            validateOrder(isForceValidate) {
                super.validateOrder(isForceValidate);
                console.log('product Discount',this._currentOrder.selected_orderline.product_group_discount_id)
                console.log('amount Discount',this._currentOrder.selected_orderline.amount_group_discount)
                var group_id = this._currentOrder.selected_orderline.product_group_discount_id;
                var discount_to_purchase = this._currentOrder.selected_orderline.amount_group_discount;

                if(discount_to_purchase > 0 && group_id !== null){
                    this.discount_group_made_internal_transfer(group_id, discount_to_purchase);
                    var display_name = this.env.pos.db.product_by_id[group_id].display_name;
                    this.showPopup('ConfirmPopup', {
                        title: this.env._t('Operacion Exitosa'),
                        body: this.env._t('Se creo una Entrada al Inventario del producto ' + display_name),
                    });
                }
            }
        };

    Registries.Component.extend(PaymentScreen, UpdatePaymentScreen);
    return PaymentScreen;
});