odoo.define('pos_global_discount_date.ListFeaturesButtonsGlobalDiscountDate', function (require) {
    'use strict';

    const PosComponent = require('point_of_sale.PosComponent');
    const Registries = require('point_of_sale.Registries');
    const core = require('web.core');
    const qweb = core.qweb;
    const {posbus} = require('point_of_sale.utils');
    const {Printer} = require('point_of_sale.Printer');
    const OrderReceipt = require('point_of_sale.OrderReceipt');

    class ListFeaturesButtonsGlobalDiscountDate extends PosComponent {

        async setGlobalDiscountDate() {
            const selectedOrder = this.env.pos.get_order();
            if (selectedOrder.orderlines.length == 0) {
                return this.showPopup('ErrorPopup', {
                    title: this.env._t('Error'),
                    body: this.env._t('Your order cart is blank')
                })
            }
            if (selectedOrder.is_return) {
                return this.showPopup('ErrorPopup', {
                    title: this.env._t('Error'),
                    body: this.env._t('It not possible add Global Dicsount for Order Return')
                })
            }
            selectedOrder.clear_discount_extra()
            const list = this.env.pos.discounts.map(discount => ({
                id: discount.id,
                name: discount.name,
                item: discount
            }))
            let {confirmed, payload: selectedItems} = await this.showPopup(
                'PopUpSelectionBox',
                {
                    title: this.env._t('Please select one Global Discount Date need to apply'),
                    items: list,
                    onlySelectOne: true,
                }
            );
            if (confirmed) {
                selectedOrder.add_global_discount(selectedItems.items[0]['item'])
            }
        }
    }

    ListFeaturesButtonsGlobalDiscountDate.template = 'ListFeaturesButtonsGlobalDiscountDate';

//    Registries.Component.add(ListFeaturesButtons);

    return ListFeaturesButtonsGlobalDiscountDate;
});
