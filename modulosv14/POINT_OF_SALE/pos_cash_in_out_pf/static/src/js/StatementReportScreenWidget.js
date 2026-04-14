
odoo.define('pos_coupons_gift_voucher.StatementReportScreenWidget', function(require) {
    'use strict';

    const PosComponent = require('point_of_sale.PosComponent');
    const ReceiptScreen = require('point_of_sale.ReceiptScreen');
    const Registries = require('point_of_sale.Registries');
    const ProductScreen = require('point_of_sale.ProductScreen');
    var core = require('web.core');
    var QWeb = core.qweb;

    const StatementReportScreenWidget = (ReceiptScreen) => {
    	class StatementReportScreenWidget extends ReceiptScreen {
	        constructor() {
	            super(...arguments);
	            this.show();
	            if(this.env.pos.config.iface_print_auto)
					{
						this.print_coupon();
					}
	        	}

    		next_screen(){
			this.showScreen('ProductScreen');
			}

			show(options){
				var self = this;
				// this.get_cash_receipt_render_env();
				if (self.should_auto_print()) {
					// window.print();
					setTimeout(function(){
						window.print();
						return;
					}, 500);
				}
			}

			get_product_receipt_render_env() {
				var data=this.env.pos.get_order().get_screen_data();
				return {
					widget: this,
					pos: this.env.pos,
					statement_data : data.props.statement_data,
					stmt_st_date:  data.props.stmt_st_date,
					stmt_end_date:  data.props.stmt_end_date,
				};
			}
			
			
			print_xml_cash_receipt() {
				var receipt = QWeb.render('StatementSummaryReceipt', this.get_product_receipt_render_env ());
				this.env.pos.proxy.print_receipt(receipt);
			}
			
			print_web_cash_receipt() {
				window.print();
			}
			
			print_cash_receipt() {
				var self = this;
				if (!this.env.pos.config.iface_print_via_proxy) { 

					this.print_web_cash_receipt();
				} else {    
					this.print_xml_cash_receipt();
				}
			}
			

			should_auto_print() {
				return this.env.pos.config.iface_print_auto && !this.env.pos.get_order()._printed;
			}

	    }

	    StatementReportScreenWidget.template = 'StatementReportScreenWidget';
	    return StatementReportScreenWidget
	};
    Registries.Component.addByExtending(StatementReportScreenWidget,ReceiptScreen);

    return StatementReportScreenWidget;

});