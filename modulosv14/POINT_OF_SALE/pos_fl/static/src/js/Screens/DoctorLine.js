odoo.define('pos_fl.DoctorLine', function(require) {
    'use strict';

    const PosComponent = require('point_of_sale.PosComponent');
    const Registries = require('point_of_sale.Registries');

    class DoctorLine extends PosComponent {
        get highlight() {
            return this.props.partner !== this.props.selectedDoctor ? '' : 'highlight';
        }
    }
    DoctorLine.template = 'DoctorLine';

    Registries.Component.add(DoctorLine);

    return DoctorLine;
});