odoo.define('pos_cash_in_out_alert_pf.CashOutPopupAlert', function(require){
	'use strict';

	const Popup = require('point_of_sale.ConfirmPopup');
	const Registries = require('point_of_sale.Registries');
	const PosComponent = require('point_of_sale.PosComponent');

	class CashOutPopupAlert extends Popup {

		constructor() {
			super(...arguments);
		}

		cancel() {
			this.trigger('close-popup');
		}

		mounted(){
			$('#error1').hide();
			var cash_threshold = this.env.pos.config.cash_threshold;
			$('#amount').val(cash_threshold);
		}

		save_summary_details(operation, entered_reason, entered_amount){
			let self = this;
			var date = new Date().toLocaleString();
			this.trigger('close-popup');
			self.showTempScreen('CashInOutReceiptScreen',{
			    date: date,
				operation:operation,
				purpose:entered_reason,
				amount:entered_amount
			});
		}

		cash_out() {
			let self = this;
			let order = this.env.pos.get_order();
			let user = self.env.pos.user;
			let entered_reason = $("#reason").val();
			let entered_amount = $("#amount").val();
			let session_id = self.env.pos.pos_session.id;
			if(entered_amount == '')
			{
				$("#error1").text("Ingrese el monto a retirar.");
				$('#error1').show();
				setTimeout(function() {$('#error1').hide()},2000);
				return;
			}
			else{
				this.rpc({
					model: 'cash.box.out',
					method: 'create_cash_out',
					args: [0,user.id, entered_reason, entered_amount, session_id],

				}).then(function(output) {
					if (output == true){
						self.save_summary_details('Retiro Efectivo', entered_reason,entered_amount)
					} else {
						self.showPopup('ErrorPopup', {
							'title': this.env._t('No Cash Register'),
							'body': this.env._t('There is no cash register for this PoS Session'),
						});
					}
				});
			}
		}
	};

	CashOutPopupAlert.template = 'CashOutPopupAlert';

	Registries.Component.add(CashOutPopupAlert);

	return CashOutPopupAlert;

});