odoo.define('pos_fl.EditListInput',function(require){
	'use strict';
    console.log('EditListInput')
	const EditListInput=require('point_of_sale.EditListInput');
	const Registries=require('point_of_sale.Registries');
	const { useListener } = require('web.custom_hooks');

	const PosFlEditListInput=(EditListInput)=>class extends EditListInput{

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
                console.log(this)
                console.log(this.currentOrder)
                this.currentOrder.set_doctor(newClient);
            }
        }

	}

	Registries.Component.extend(EditListInput,PosFlEditListInput);
	return EditListInput;
});;