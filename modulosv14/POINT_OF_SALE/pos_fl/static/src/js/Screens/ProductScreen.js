odoo.define('pos_fl.ProductScreen',function(require){
	'use strict';

	const ProductScreen = require('point_of_sale.ProductScreen');
	const Registries = require('point_of_sale.Registries');
	const { useListener } = require('web.custom_hooks');

	const PosFlProductScreen = (ProductScreen) =>
	    class extends ProductScreen{

        constructor() {
            super(...arguments);
            useListener('click-doctor', this._onClickDoctor);
        }

        get currentOrder() {
            return this.env.pos.get_order();
        }

        async _onClickDoctor() {
            // IMPROVEMENT: This code snippet is very similar to selectClient of PaymentScreen.
            const currentDoctor = this.currentOrder.get_doctor();
            const { confirmed, payload: newClient } = await this.showTempScreen(
                'DoctorListScreen',
                { doctor: currentDoctor }
            );
            if (confirmed) {
                this.currentOrder.set_doctor(newClient);
            }
        }

	}

	Registries.Component.extend(ProductScreen,PosFlProductScreen);
	return ProductScreen;
});;