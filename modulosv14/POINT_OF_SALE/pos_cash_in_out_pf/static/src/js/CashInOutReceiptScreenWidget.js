odoo.define('pos_coupons_gift_voucher.CashInOutReceiptScreenWidget', function(require) {
    'use strict';

    const PosComponent = require('point_of_sale.PosComponent');
    const ReceiptScreen = require('point_of_sale.ReceiptScreen');
    const Registries = require('point_of_sale.Registries');
    const ProductScreen = require('point_of_sale.ProductScreen');
    var core = require('web.core');
    var QWeb = core.qweb;

    const CashInOutReceiptScreenWidget = (ReceiptScreen) => {
    	class CashInOutReceiptScreenWidget extends ReceiptScreen {
	        constructor() {
	            super(...arguments);
	            this.show();
	            if(!this.env.pos.config.iface_print_auto)
					{
//					    this.handleAutoPrint();
						this.print_coupon();
					}
	        	}

    		next_screen(){
			this.showScreen('ProductScreen');
			}

			show(options){
				var self = this;
				// this.get_cash_receipt_render_env();
				console.log(this,"---------show")
				if (self.should_auto_print()) {
					// window.print();
					setTimeout(function(){
						window.print();
						return;
					}, 500);
				}
			}
			
			get_cash_receipt_render_env () {
				return {
					widget: this,
					pos: this.pos,
					operation : this.gui.get_current_screen_param('operation'),
					purpose: this.gui.get_current_screen_param('purpose'),
					amount: this.gui.get_current_screen_param('amount'),
				};
			}
			cash_render_reciept(){
				this.$('.pos-cash-receipt-container').html(QWeb.render('CashInOutReceipt', this.get_cash_receipt_render_env ()));
			}
			
			print_xml_cash_receipt() {
				var receipt = QWeb.render('CashInOutReceipt', this.get_cash_receipt_render_env ());
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
			
			renderElement() {
				var self = this;
				this._super();
				
				this.$('.next').click(function(){
					self.gui.show_screen('products');
				});
				
				this.$('.button.print-cash').click(function(){
					self.print_cash_receipt();
				}); 
			}

			should_auto_print() {
				return this.env.pos.config.iface_print_auto && !this.env.pos.get_order()._printed;
			}

	    }

	    CashInOutReceiptScreenWidget.template = 'CashInOutReceiptScreenWidget';
	    return CashInOutReceiptScreenWidget
	};
    Registries.Component.addByExtending(CashInOutReceiptScreenWidget,ReceiptScreen);

    return CashInOutReceiptScreenWidget;

});