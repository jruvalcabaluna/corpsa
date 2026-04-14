odoo.define('pos_cash_in_out_alert_pf.pos_cash_alert',function(require){
"use strict";

    var pos_model=require('point_of_sale.models');
    var rpc=require('web.rpc')
    var core=require('web.core');
    var _t=core._t;
    const ReceiptScreen=require('point_of_sale.ReceiptScreen');
    const Registries=require('point_of_sale.Registries');

    pos_model.load_fields('pos.session','cash_register_difference');

    var PosResReceiptScreen=ReceiptScreen=>class extends ReceiptScreen{

        mounted(){
            var self=this;
            super.mounted();
            if(self.env.pos.config.cash_threshold!=0){
                setTimeout(function(){
                    rpc.query({
                        model:'pos.session',
                        method:'get_cash_register_difference',
                        args:[self.env.pos.pos_session.id]
                        }).then(function(cash_register_difference){
                               self.env.pos.cash_register_difference = cash_register_difference;
                               console.log('self.env.pos.cash_register_difference',self.env.pos.cash_register_difference)
                               var cash_difference = Math.abs(self.env.pos.cash_register_difference);
                               console.log('cash_difference',cash_difference)
                               var cash_threshold = self.env.pos.config.cash_threshold;
                               console.log('cash_threshold',cash_threshold)
                               if(cash_difference > cash_threshold)
//                               self.showPopup('CashOutPopup', {});
                               self.showPopup('CashOutPopupAlert', {});
                        })
                        },1000);
                    }
                }
     }

    Registries.Component.extend(ReceiptScreen,PosResReceiptScreen);

    Registries.Component.freeze();

    return ReceiptScreen;
});