

odoo.define('pos_loyalty_odoo.CashOutPopupWidget', function(require){
	'use strict';

	const Popup = require('point_of_sale.ConfirmPopup');
	const Registries = require('point_of_sale.Registries');
	const PosComponent = require('point_of_sale.PosComponent');
	var redeem;
	var point_value = 0;
	var remove_line;
	var remove_true = false;
	var entered_code;

	class CashOutPopupWidget extends Popup {

		constructor() {
            super(...arguments);
            console.log(this,"--111this")
            this.show();
            
        }

		go_back_screen() {
			this.showScreen('ProductScreen');
			this.trigger('close-popup');
		}

		// events: {
		// 	'click #apply_cash_out': 'cash_out',
		// 	'click .button.cancel': 'click_cancel',
		// },

		//
		show(options) {
			var self = this;
			$('#error').hide();
		}
		//


		save_summary_details(operation, entered_reason, entered_amount){
			var self = this;
			this.trigger('close-popup');
			self.showScreen('CashInOutReceiptScreenWidget',{ 
												operation:operation,
												purpose:entered_reason,
												amount:entered_amount});
		}

		cash_out() {
			var self = this;
			var order = this.env.pos.get_order();
			var selectedOrder = self.env.pos.get('selectedOrder');
			var cashier = self.env.pos.cashier || self.env.pos.user;
			var entered_reason = $("#reason").val();
			var entered_amount = $("#amount").val();
			var session_id = self.env.pos.pos_session.id;

			if(entered_amount == '')
			{
				$("#error").text("Please enter amount to withdraw");
				$('#error').show();
				setTimeout(function() {$('#error').hide()},2000);
				return;
			}
			else if(entered_reason == '')
			{
				$("#error").text("Please enter reason to withdraw");
				$('#error').show();
				setTimeout(function() {$('#error').hide()},2000);
				return;
			}
			else{
				this.rpc({
					model: 'cash.box.out',
					method: 'create_cash_out',
					args: [cashier ? cashier.id : 0, cashier ? cashier.id : 0, entered_reason, entered_amount, session_id],

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
	
	CashOutPopupWidget.template = 'CashOutPopupWidget';

	Registries.Component.add(CashOutPopupWidget);

	return CashOutPopupWidget;

});