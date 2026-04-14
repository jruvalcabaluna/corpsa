odoo.define('pos_fl.DoctorButtonWidget', function (require) {
    'use strict';

    const PosComponent = require('point_of_sale.PosComponent');
    const ProductScreen = require('point_of_sale.ProductScreen');
    const { useListener } = require('web.custom_hooks');
    const Registries = require('point_of_sale.Registries');

    class DoctorButtonWidget extends PosComponent {

        get currentDoctorName() {
            let doctor = this.env.pos.get_order().get_doctor();
            return doctor === undefined || doctor === null  ? 'No Seleccionado' : doctor.name;
        }

        get isHighlighted() {
            let order = this.env.pos.get_order();
            if (order && order.get_selected_orderline()) {
                let lines = order.get_selected_orderline();
                let lots = lines.pack_lot_lines;
                if (lots && lots.get_valid_lots()) {
                    return true
                } else {
                    return false
                }
            }
        }
//        get isLongName() {
//            return this.doctor && this.doctor.name.length > 10;
//        }
//        get doctor() {
//            return this.props.doctor;
//        }
    }
    DoctorButtonWidget.template = 'DoctorButtonWidget';

    Registries.Component.add(DoctorButtonWidget);

    return DoctorButtonWidget;
});