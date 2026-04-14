
odoo.define('pos_loyalty_odoo.CashInPopupWidget', function(require){
	'use strict';

	const Popup = require('point_of_sale.ConfirmPopup');
	const Registries = require('point_of_sale.Registries');
	const PosComponent = require('point_of_sale.PosComponent');
	var redeem;
	var point_value = 0;
	var remove_line;
	var remove_true = false;
	var entered_code;

	class CashInPopupWidget extends Popup {

		constructor() {
            super(...arguments);
            console.log(this,"--111this")
            this.show();
            
        }

		go_back_screen() {
			this.showScreen('ProductScreen');
			this.trigger('close-popup');
		}

		show(options) {
			var self = this;
			$('#error1').hide();
		}

		save_summary_details(operation, entered_reason, entered_amount){
			var self = this;
			this.trigger('close-popup');
			self.showScreen('CashInOutReceiptScreenWidget',{ 
												operation:operation,
												purpose:entered_reason,
												amount:entered_amount});
		}

		// events: {
		// 	'click #apply_cash_in': 'cash_in',
		// 	'click .button.cancel': 'click_cancel',
		// },
		//

		cash_in()
		{
			var self = this;
			var order = this.env.pos.get_order();
			var selectedOrder = self.env.pos.get('selectedOrder');
			var cashier = self.env.pos.cashier || self.env.pos.user;
			var entered_reason = $("#inreason").val();
			var entered_amount = $("#cash_amount").val();
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
					model: 'cash.box.in',
					method: 'create_cash_in',
					args: [cashier ? cashier.id : 0, cashier ? cashier.id : 0, entered_reason, entered_amount, session_id],

				}).then(function(output) {
					if (output == true){
						self.save_summary_details('Ingreso Efectivo', entered_reason,entered_amount)
						
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
	
	CashInPopupWidget.template = 'CashInPopupWidget';

	Registries.Component.add(CashInPopupWidget);

	return CashInPopupWidget;

});