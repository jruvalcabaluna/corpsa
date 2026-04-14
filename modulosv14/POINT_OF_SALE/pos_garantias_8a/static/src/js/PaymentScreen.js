odoo.define('pos_garantias_8a.PaymentScreen', function(require) {
    'use strict';

    const PaymentScreen = require('point_of_sale.PaymentScreen');
    const Registries = require('point_of_sale.Registries');
    const session = require('web.session');

    const WarrantyUpdatePaymentScreen = PaymentScreen =>
        class extends PaymentScreen {

            warranty_made_internal_transfer(amount_warranty_discount) {
                var self = this;
                let orderSelected = this.env.pos.get_order();
                console.log('1',this._currentOrder.selected_orderline.product_return_id)
                var adjustment_product_id = this._currentOrder.selected_orderline.product_return_id.adjustment_product_id[0];
                console.log('adjustment_product_id in warranty_made_internal_transfer',adjustment_product_id)
                var warranty_product_id = this._currentOrder.selected_orderline.product_return_id.warranty_product_id[0];
                console.log('warranty_product_id in warranty_made_internal_transfer',warranty_product_id)
                var return_product_id = 0;
                if(amount_warranty_discount >= 100){
                        var return_product_id = warranty_product_id;
                    }else
                       var return_product_id = adjustment_product_id;
                let toDay = new Date().toISOString().split('T')[0];
                var warranty_stock_location_id = this.env.pos.config.warranty_stock_location_id;
                var warranty_stock_location_dest_id = this.env.pos.config.warranty_stock_location_dest_id;
                var warranty_stock_operation_type_id = this.env.pos.config.warranty_stock_operation_type_id;

                var moveLines = [];
                var quantity_by_lot = 1;
    //values for stock.production.lot
                var lot = this._currentOrder.selected_orderline.lot;
                console.log('lot in warranty_made_internal_transfer',lot)
                var aut_code = this._currentOrder.selected_orderline.aut_code;
                console.log('aut_code in warranty_made_internal_transfer',aut_code)
                var set_code = this._currentOrder.selected_orderline.set_code;
                console.log('set_code in warranty_made_internal_transfer',set_code)
                var inspect_code = this._currentOrder.selected_orderline.inspect_code;
                console.log('inspect_code in warranty_made_internal_transfer',inspect_code)
                var use_type = this._currentOrder.selected_orderline.use_type;
                console.log('set_code in warranty_made_internal_transfer',use_type)
    //            var revision_number = $('#revision_number').val();
                var defective = this._currentOrder.selected_orderline.defective;
                console.log('defective in warranty_made_internal_transfer',defective)
                var type_policy = this._currentOrder.selected_orderline.type_policy;
                console.log('type_policy in warranty_made_internal_transfer',type_policy)
                var new_lot = lot;
                    moveLines.push({
                                    pack_lots: new_lot,
                                    name: 'ENTRADA POR GARANTIA',
                                    picking_type_id: parseInt(warranty_stock_operation_type_id),
                                    location_id: parseInt(warranty_stock_location_id),
                                    location_dest_id: parseInt(warranty_stock_location_dest_id),
                                    product_id: return_product_id,
                                    product_uom_qty: 1,
                                    product_uom: 1
                                });
                var pickingVals = {
                            is_locked: true,
                            pos_session_id: orderSelected.pos_session_id,
                            origin: orderSelected['name'],
                            picking_type_id: parseInt(warranty_stock_operation_type_id),
                            location_id: parseInt(warranty_stock_location_id),
                            location_dest_id: parseInt(warranty_stock_location_dest_id),
                            move_type: 'direct',
                            note: '',
                            scheduled_date: toDay,
                            immediate_transfer: true,
                };
                var Details = {
                            aut_code: aut_code,
                            set_code: set_code,
                            inspect_code: inspect_code,
                            use_type: use_type,
    //                        revision_number: revision_number,
                            defective: defective,
                            type_policy: type_policy,
                };
                return this.rpc({
                    model: 'stock.picking',
                    method: 'pos_warranty_made_internal_transfer',
                    args: [pickingVals, moveLines, Details],
                            context: {}
                }).then(function (value) {
                   return value
                }, function (error) {
                   return (error)
                 });
            }

//          Override validateOrder function for add warranty_made_internal_transfer
            validateOrder(isForceValidate) {
                super.validateOrder(isForceValidate);
                var return_product_id = this._currentOrder.selected_orderline.product_return_id;
                console.log('return_product_id Warranty',return_product_id)
                var amount_warranty_discount = this._currentOrder.selected_orderline.amount_warranty_discount;
                console.log('amount_warranty_discount Warranty',amount_warranty_discount)
                if(return_product_id !== undefined && amount_warranty_discount > 0){
                    console.log('enter to warranty_made_internal_transfer')
                    this.warranty_made_internal_transfer(amount_warranty_discount);
                    this.showPopup('ConfirmPopup', {
                        title: this.env._t('Operacion Exitosa'),
                        body: this.env._t('Se creo una transferencia del producto ' + return_product_id.display_name),
                        });
                }
            }
        };

    Registries.Component.extend(PaymentScreen, WarrantyUpdatePaymentScreen);
    return PaymentScreen;
});