odoo.define('pos_loyalty_odoo.CashInOutStatementPopupWidget', function(require){
	'use strict';

	const Popup = require('point_of_sale.ConfirmPopup');
	const Registries = require('point_of_sale.Registries');
	const PosComponent = require('point_of_sale.PosComponent');


	class CashInOutStatementPopupWidget extends Popup {

		constructor() {
            super(...arguments);
            // this.show();
            
        }

		go_back_screen() {
			this.showScreen('ProductScreen');
			this.trigger('close-popup');
		}

		
		print_cash_in_out_statement(){
			var self = this;
			var stmt_st_date = $('#stmt_st_date').val();
			var stmt_end_date = $('#stmt_end_date').val();
			var selected_cashier = $('#cashier').val();
			if(stmt_st_date == false){
				$('#statement_error').text('Please Enter Start Date')
				$('#statement_error').show()
				setTimeout(function() {$('#statement_error').hide()},3000);
				return;
			}
			else if(stmt_end_date == false){
				$('#statement_error').text('Please Enter End Date')
				$('#statement_error').show()
				setTimeout(function() {$('#statement_error').hide()},3000);
				return;
			}
			else{
				this.rpc({
					model: 'pos.cash.in.out',
					method: 'get_statement_data',
					args: [1, stmt_st_date, stmt_end_date,selected_cashier],
				}).then(function(output){
					self.showScreen('StatementReportScreenWidget',{
						statement_data:output,
						stmt_st_date:stmt_st_date,
						stmt_end_date:stmt_end_date,
						});
					self.trigger('close-popup')
					});

			}

		}
	};
	
	CashInOutStatementPopupWidget.template = 'CashInOutStatementPopupWidget';

	Registries.Component.add(CashInOutStatementPopupWidget);

	return CashInOutStatementPopupWidget;

});