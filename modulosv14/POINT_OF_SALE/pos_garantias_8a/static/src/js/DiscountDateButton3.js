odoo.define('pos_garantias_8a.DiscountDateButton', function(require) {
    'use strict';

    const PosComponent = require('point_of_sale.PosComponent');
    const ProductScreen = require('point_of_sale.ProductScreen');
    const {useListener} = require('web.custom_hooks');
    const Registries = require('point_of_sale.Registries');
    const field_utils = require('web.field_utils');
    const core = require('web.core');
    const _t = core._t;

    var rpc = require('web.rpc');
    const { Gui } = require('point_of_sale.Gui');

    class DiscountDateButton extends PosComponent {
        constructor() {
            super(...arguments);
            useListener('click', this.onClick);
        }
        mounted() {
            this.env.pos.get('orders').on('add remove change', () => this.render(), this);
            this.env.pos.on('change:selectedOrder', () => this.render(), this);
            this.env.pos.get_order().orderlines.on('change', () => {
                this.render();
            });
        }

        willUnmount() {
            this.env.pos.get('orders').off('add remove change', null, this);
            this.env.pos.off('change:selectedOrder', null, this);
        }

        get isHighlighted() {
            let selectedOrder = this.env.pos.get_order();
            if (!selectedOrder || !selectedOrder.get_selected_orderline()) {
                return false
            }
            let selectedLine = this.env.pos.get_order().get_selected_orderline();
            if (selectedLine.product.cross_selling && this.env.pos.cross_items_by_product_tmpl_id[selectedLine.product.product_tmpl_id]) {
                return true
            } else {
                return false
            }
        }

        made_internal_transfer(val, lot) {
        var self = this;
        let orderSelected = this.env.pos.get_order();
        var adjustment_product_id = self.env.pos.config.return_product_id.adjustment_product_id[0];
        var warranty_product_id = self.env.pos.config.return_product_id.warranty_product_id[0];
        var return_product_id = 0;
        if(val >= 100){
                var return_product_id = warranty_product_id;
            }else
               var return_product_id = adjustment_product_id;
        let toDay = new Date().toISOString().split('T')[0];
        var refund_stock_location = this.env.pos.config.refund_stock_location_id;
        var refund_stock_location_dest_id = this.env.pos.config.refund_stock_location_dest_id;
        var refund_stock_operation_type_id = this.env.pos.config.refund_stock_operation_type_id;

        var moveLines = [];
        var quantity_by_lot = 1;
        var new_lot = lot;
            moveLines.push({
                            pack_lots: new_lot,
                            name: 'ENTRADA',
                            picking_type_id: parseInt(refund_stock_operation_type_id),
                            location_id: parseInt(refund_stock_location),
                            location_dest_id: parseInt(refund_stock_location_dest_id),
                            product_id: return_product_id,
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
            method: 'pos_made_internal_transfer',
            args: [pickingVals, moveLines],
                    context: {}
        }).then(function (value) {
           return value
        }, function (error) {
           return (error)
         });
        }

        Search() {
            var self = this;
            var products = this.env.pos.db.product_by_id;
            var availableTags = [];
            $.each( products, function( i, val ) {
              availableTags.push({id:val.id,value:val.display_name});
            });
            setTimeout(function(){
                $('.screen-content-flexbox input').autocomplete({
                    source: availableTags,
                    select: function (event, ui) {
                        if(ui != undefined){
                            $('.searchbox input').val("");
                            var product = self.env.pos.db.product_by_id[ui.item.id];
                            self.props.product = product;
                            self.env.pos.config.return_product_id = product;

                            self.render();
                        }
                    }
                });
                }, 30);
        }


        async onClick() {
            var self = this;
            var pos = this.env.pos;
            self.Search();
            var hoy=moment().format('DD/MM/YYYY');
            let order = this.env.pos.get_order();
            const { confirmed, payload } = await this.showPopup('DateInputPopup',{
                title: this.env._t('Fecha Compra'),
                body: '',
                startingValue: hoy,
                product: '',

            });
            if (confirmed) {
                var selectedOrder = this.env.pos.get_order();
                var lot = $('#lot').val();
                var categ_id = selectedOrder.get_selected_orderline().product.categ_id[0];
                var hoy=moment();
                var compra = moment(payload);
                var monthDifference =  moment(hoy).diff(compra, 'months', true);
                var vals = Math.round(Math.max(0,Math.min(100,parseFloat(monthDifference))));
                var valsP = Math.round(Math.max(0,Math.min(100,parseFloat(monthDifference))));
                var valsS = Math.round(Math.max(0,Math.min(100,parseFloat(monthDifference))));
//              INICIO CATEGORIA PARTICULAR
                if (vals <= 12 >= 1) {
                    vals = 100;
                } else if (vals === 13) {
                    vals = 73;
                } else if (vals === 14) {
                    vals = 71;
                } else if (vals === 15) {
                    vals = 69;
                } else if (vals === 16) {
                    vals = 67;
                } else if (vals === 17) {
                    vals = 65;
                } else if (vals === 18) {
                    vals = 62;
                } else if (vals === 19) {
                    vals = 60;
                } else if (vals === 20) {
                    vals = 58;
                } else if (vals === 21) {
                    vals = 56;
                } else if (vals === 22) {
                    vals = 54;
                } else if (vals === 23) {
                    vals = 52;
                } else if (vals === 24) {
                    vals = 50;
                } else if (vals === 25) {
                    vals = 48;
                } else if (vals === 26) {
                    vals = 46;
                } else if (vals === 27) {
                    vals = 44;
                } else if (vals === 28) {
                    vals = 42;
                } else if (vals === 29) {
                    vals = 40;
                } else if (vals === 30) {
                    vals = 37;
                } else if (vals === 31) {
                    vals = 35;
                } else if (vals === 32) {
                    vals = 33;
                } else if (vals === 33) {
                    vals = 31;
                } else if (vals === 34) {
                    vals = 29;
                } else if (vals === 35) {
                    vals = 27;
                } else if (vals === 36) {
                    vals = 25;
                } else if (vals === 37) {
                    vals = 23;
                } else if (vals === 38) {
                    vals = 21;
                } else if (vals === 39) {
                    vals = 19;
                } else if (vals === 40) {
                    vals = 17;
                } else if (vals === 41) {
                    vals = 15;
                } else if (vals === 42) {
                    vals = 12;
                } else if (vals === 43) {
                    vals = 10;
                } else if (vals === 44) {
                    vals = 8;
                } else if (vals === 45) {
                    vals = 6;
                } else if (vals === 46) {
                    vals = 4;
                } else if (vals === 47) {
                    vals = 2;
                } else if (vals === 48) {
                    vals = 1;
                } else {
                    vals = 0;
                }
//              FINAL CATEGORIA PARTICULAR
//              INICIO CATEGORIA PESADO
                if (valsP <= 9 >= 1) {
                    valsP = 100;
                } else if (valsP === 10) {
                    valsP = 50;
                } else if (valsP === 11) {
                    valsP = 45;
                } else if (valsP === 12) {
                    valsP = 40;
                } else if (valsP === 13) {
                    valsP = 35;
                } else if (valsP === 14) {
                    valsP = 30;
                } else if (valsP === 15) {
                    valsP = 25;
                } else if (valsP === 16) {
                    valsP = 20;
                } else if (valsP === 17) {
                    valsP = 15;
                } else if (valsP === 18) {
                    valsP = 10;
                } else if (valsP === 19) {
                    valsP = 5;
                } else if (valsP === 20) {
                    valsP = 2;
                } else {
                    valsP = 0;
                }
//               FINAL CATEGORIA PESADO
//                INICIO CATEGORIA SOLARES
                if (valsS <= 12 >= 1) {
                    valsS = 100;
                } else {
                    valsS = 0;
                }
                console.log('Solares Final',valsS);
                var valores = 0;
                if (categ_id === 4) {
                    valores += vals;
                } else if (categ_id === 6) {
                    valores += valsP;
                } else if (categ_id === 8) {
                    valores += valsS;
                } else {
                    valores = 0;
                }
                var valor = valores;
                console.log('final final',valor)
                var val = Math.round(Math.max(0,Math.min(100,parseFloat(valor))));
                await self.apply_discount(val);
//made purchase order
                self.made_internal_transfer(val, lot);
                alert('Se creo una transferencia!');
            }
        }

        async apply_discount(pc) {
            var selectedOrder = this.env.pos.get_order();
            var lines    = selectedOrder.get_orderlines();
            var discount = pc;
            if (discount > 0) {
                var order = this.env.pos.get_order();
                order.selected_orderline.set_discount(discount);
            }

        }
    }
    DiscountDateButton.template = 'DiscountDateButton';
    ProductScreen.addControlButton({
        component: DiscountDateButton,
        condition: function() {
//            return this.env.pos.config.module_pos_discount && this.env.pos.config.discount_product_id;
            return true
        },
    });

    Registries.Component.add(DiscountDateButton);

    return DiscountDateButton;
});