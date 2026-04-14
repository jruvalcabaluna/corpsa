odoo.define("pos_fl.Screens", function (require) {
    "use strict";

    const ProductScreen = require("point_of_sale.ProductScreen");
    const Registries = require("point_of_sale.Registries");
    const {Gui} = require("point_of_sale.Gui");
    var core = require("web.core");
    var _t = core._t;

    const CustomProductScreen = (ProductScreen) =>
        class extends ProductScreen {
            _onClickPay() {
                const result = super._onClickPay(...arguments);
                let lots = _.filter(
                    this.env.pos.get_order().get_orderlines(),
                    function (line) {
                        return line.has_product_lot === true;
                    }
                );
                if (lots.length > 0) {
                    var doctor = this.env.pos.get_order().get_doctor();
                    if (doctor === undefined || doctor === null){
                        this.showScreen("ProductScreen");
                        this.showPopup("ErrorPopup", {
                            title: this.env._t('El Doctor es Requerido!'),
                            body: this.env._t('Estas vendiendo un producto que requiere capturar la informacion del Doctor!'),
                        });
                    }
                }
            return result;
            }
        };

    Registries.Component.extend(ProductScreen, CustomProductScreen);
    return ProductScreen;
});