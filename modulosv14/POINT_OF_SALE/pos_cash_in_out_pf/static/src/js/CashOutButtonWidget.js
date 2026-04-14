
odoo.define('pos_cash_in_out_pf.CashOutButtonWidget', function(require) {
    "use strict";

    var models = require('point_of_sale.models');
    const ProductScreen = require('point_of_sale.ProductScreen');
    var core = require('web.core');
    const { Gui } = require('point_of_sale.Gui');
    const PosComponent = require('point_of_sale.PosComponent');
    const Registries = require('point_of_sale.Registries');
    var _t = core._t;
    


// Start PosBagWidget
    class CashOutButtonWidget extends ProductScreen {
        constructor() {
            super(...arguments);
        }

        button_click () {
			var order = this.env.pos.get_order();
			var self = this;
			this.showPopup('CashOutPopupWidget', {});
		}

    }
    CashOutButtonWidget.template = 'CashOutButtonWidget';

    Registries.Component.add(CashOutButtonWidget);

    return CashOutButtonWidget;

});
