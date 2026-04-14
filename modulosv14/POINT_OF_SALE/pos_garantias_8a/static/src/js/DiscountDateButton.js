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
            if (selectedLine.product.warranty_adjustment) {
                return true
            } else {
                return false
            }
        }

        Search() {
            var self = this;
            var products = Object.values(this.env.pos.db.product_by_id).filter(item => item.warranty_adjustment === true);
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
//set the product_select to selected_orderline.product_return_id in current order
                            self.env.pos.get_order().selected_orderline.product_return_id = product;
                            self.render();
                        }
                    }
                });
                }, 30);
        }

        async onClick() {
            var self = this;
            if (this.env.pos.get_order().get_orderlines().length == 0) {
                return this.showPopup('ErrorPopup', {
                    title: this.env._t('Warning'),
                    body: this.env._t('La Orden esta vacia'),
                })
            }
            if (!this.env.pos.get_order().get_selected_orderline().product.warranty_adjustment) {
                    return this.showPopup('ErrorPopup', {
                        title: this.env._t('Error'),
                        body: this.env._t('Este producto no acepta garantias')
                    })
                }
            self.Search();
            var today = moment();
            const { confirmed, payload } = await this.showPopup('DateInputPopup',{
                title: this.env._t('Fecha Compra'),
                body: '',
                startingValue: today,
            });
            if (confirmed) {
            var order = self.env.pos.get_order();
            var date_receipt = moment($('#date_receipt').val());
            var use_type = $('#use_type').val();
            if (!$('#set_code').val()) {
                    return this.showPopup('ErrorPopup', {
                        title: this.env._t('Error'),
                        body: this.env._t('Codigo de Ensamble es requerido')
                    })
                }
            console.log('1.start to call values and calculate for warranty')
//Array with category of CHARGES
            var charges_category_id = self.env.pos.config.charges_category_id[0];
            console.log('charges_category_id',charges_category_id)

//Array with LINES CHARGES in order_lines
            var orderLineCharges = [];
            self.env.pos.get_order().get_orderlines().forEach((orderLine) => {
                if(orderLine.get_product().categ_id[0] === charges_category_id)
                orderLineCharges.push(orderLine);
            });
            console.log('orderLineCharges',orderLineCharges)
//Calculate months difference
            var sale_date = moment(payload);
            var monthDifference =  moment(date_receipt).diff(sale_date, 'months', true);
            var months = Math.floor(monthDifference) + 1;
            console.log('months',months)
//variable of table brands with values
            var product_brands_items = self.env.pos.product_brands_items;
            console.log('product_brands_items',product_brands_items)
//variable brand of the product return
            let product_brand_id = self.env.pos.get_order().selected_orderline.product_return_id.product_brand_id[0];
            console.log('product_brand_id',product_brand_id)
//set product return for calculate difference between the new battery
            var return_product_id = self.env.pos.get_order().selected_orderline.product_return_id;
            console.log('return_product_id',return_product_id)
//set brand value filter in the table {array or object}
//old-->bellow new   const filterBrandsItems = product_brands_items.filter(item => item.brand_id[0] === product_brand_id && item.month === months && item.use_type === use_type)
            const filterBrandsItems = product_brands_items.filter(item => item.brand_id[0] === product_brand_id && item.month === months && item.use_type === use_type && item.color_cap === return_product_id.color_cap)
            console.log('filterBrandsItems',filterBrandsItems)
//set value in percentage from filterBrandsItems
            var filterBrandValue = filterBrandsItems[0].percentage
            console.log('filterBrandValue',filterBrandValue)
//value price of product return
            var ReturnProductPrice = self.env.pos.get_order().selected_orderline.product_return_id.lst_price;
            console.log('ReturnProductPrice',ReturnProductPrice)
            var ReturnProductPriceReducePercentage = ((self.env.pos.get_order().selected_orderline.product_return_id.lst_price * filterBrandValue)/100)
            console.log('ReturnProductPriceReducePercentage',ReturnProductPriceReducePercentage)
//value price of product in orderLine
            var linePrice = order.selected_orderline.price;
            console.log('linePrice',linePrice)
//value percentage for product in orderLine
            var percentageDiscount = Math.round((((ReturnProductPriceReducePercentage / linePrice)*100) + Number.EPSILON) * 100) / 100;
            console.log('percentageDiscount',percentageDiscount)
//set value for product charge
            var product_charge_id = this.env.pos.get_order().selected_orderline.product_return_id.charge_product_id !== false ? self.env.pos.db.product_by_id[self.env.pos.get_order().selected_orderline.product_return_id.charge_product_id[0]].lst_price : 0;
            console.log('product_charge_id',product_charge_id)
//percentage of discount for charges
            console.log('orderLineCharges length',orderLineCharges.length)
            var charge_discount_percentage = orderLineCharges.length == 0 ? 0 : Math.round((((product_charge_id / orderLineCharges[0].price)*100) + Number.EPSILON) * 100) / 100;
            console.log('charge_discount_percentage',charge_discount_percentage)
//percentage of discount for orderLine
            var product_discount = percentageDiscount;
            console.log('product_discount',product_discount)

            console.log('1.end to call values and calculate for warranty')
//saving values of warranty in current order
            console.log('2.start to saving values in the current order for warranty')
            this.env.pos.get_order().selected_orderline.amount_warranty_discount = product_discount;
            console.log('saving amount_warranty_discount in current order',this.env.pos.get_order().selected_orderline.amount_warranty_discount)
            this.env.pos.get_order().selected_orderline.lot = $('#lot').val();
            console.log('saving lot in current order',this.env.pos.get_order().selected_orderline.lot)
            this.env.pos.get_order().selected_orderline.aut_code = $('#aut_code').val();
            console.log('saving aut_code in current order',this.env.pos.get_order().selected_orderline.aut_code)
            this.env.pos.get_order().selected_orderline.set_code = $('#set_code').val();
            console.log('saving set_code in current order',this.env.pos.get_order().selected_orderline.set_code)
            this.env.pos.get_order().selected_orderline.inspect_code = $('#inspect_code').val();
            console.log('saving inspect_code in current order',this.env.pos.get_order().selected_orderline.inspect_code)
            this.env.pos.get_order().selected_orderline.use_type = $('#use_type').val();
            console.log('saving use_type in current order',this.env.pos.get_order().selected_orderline.use_type)
            this.env.pos.get_order().selected_orderline.defective = $('#defective').val();
            console.log('saving defective in current order',this.env.pos.get_order().selected_orderline.defective)
            this.env.pos.get_order().selected_orderline.type_policy = $('#type_policy').val();
            console.log('saving type_policy in current order',this.env.pos.get_order().selected_orderline.type_policy)

//set percentage discount for charges
            if(orderLineCharges.length !== 0){
                    orderLineCharges[0].set_discount(charge_discount_percentage);
             }
//set percentage discount for product
            order.selected_orderline.set_discount(product_discount);
            }
        }
    }
    DiscountDateButton.template = 'DiscountDateButton';
    ProductScreen.addControlButton({
        component: DiscountDateButton,
        condition: function() {
            return true
        },
    });

    Registries.Component.add(DiscountDateButton);

    return DiscountDateButton;
});