odoo.define('pos_quotations.pos_quotations', function (require) {
    "use strict";

    const models = require('point_of_sale.models');
    const PosComponent = require('point_of_sale.PosComponent');
    const {useListener} = require('web.custom_hooks');
    const Registries = require('point_of_sale.Registries');
    const ProductScreen = require('point_of_sale.ProductScreen');
    const AbstractAwaitablePopup = require('point_of_sale.AbstractAwaitablePopup');
    const {useState, useRef} = owl.hooks;



    var _super_order = models.Order.prototype;
    models.Order = models.Order.extend({
        initialize: function() {
            _super_order.initialize.apply(this,arguments);
            this.wv_note = "";
            this.save_to_db();
            this.quotation_id = "";
            this.quot_id = false;
        },
        export_as_JSON: function() {
            var json = _super_order.export_as_JSON.apply(this,arguments);
            json.wv_note = this.wv_note;
            json.quotation_id = this.quotation_id;
            json.quot_id = this.quot_id;
            return json;
        },
        init_from_JSON: function(json) {
            _super_order.init_from_JSON.apply(this,arguments);
            this.wv_note = json.wv_note;
            this.quotation_id = json.quotation_id;
            this.quot_id = json.quot_id;
        },
        export_for_printing:function() {
            var json = _super_order.export_for_printing.apply(this,arguments);
            json.wv_note = this.wv_note;
            json.quotation_id = this.quotation_id;
            return json
        },
    });



    class CreateNote extends PosComponent {
        constructor() {
            super(...arguments);
            useListener('click', this.onClick);
        }

        async onClick() {
            //var self = this;
            await this.showPopup('CreateNotePopupWidget');

        }

    }

    CreateNote.template = 'CreateNote';

    ProductScreen.addControlButton({
        component: CreateNote,
        condition: function () {
            return this.env.pos.config.allow_invoice_note;

        },
    });

    Registries.Component.add(CreateNote);


    class CreateNotePopupWidget extends AbstractAwaitablePopup {
        constructor() {
            super(...arguments);
            this.state = useState({inputValue: this.props.startingValue});
            this.inputRef = useRef('input');
            this.changes = {};
        }

        getPayload() {
            return this.state.inputValue;
        }

        async captureChange(event) {
            var order = this.env.pos.get('selectedOrder');
            if (order.get_client() != null) {
                order.wv_note = $(".wv_note").val();
                //////console.log("note",order);

                //console.log("print note",order.wv_note);
                // await this.save_order();

                //  await this.save_order();
                await this.trigger('close-popup');

            } else {
                alert("Customer is required for sale order. Please select customer first !!!!");
            }
            // this.cancel();
        }



    }

    CreateNotePopupWidget.template = 'CreateNotePopupWidget';
    Registries.Component.add(CreateNotePopupWidget);
    CreateNotePopupWidget.defaultProps = {
        confirmText: 'Ok',
        cancelText: 'Cancel',
        title: 'Create Note',
        body: '',
    }
});
