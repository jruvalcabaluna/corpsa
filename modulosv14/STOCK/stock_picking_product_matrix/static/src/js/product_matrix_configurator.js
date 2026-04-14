odoo.define('stock_picking_product_matrix.stock_product_matrix_configurator', function (require) {

var relationalFields = require('web.relational_fields');
var FieldsRegistry = require('web.field_registry');
var core = require('web.core');
var _t = core._t;


var StockMatrixConfiguratorWidget = relationalFields.FieldMany2One.extend({
    events: _.extend({}, relationalFields.FieldMany2One.prototype.events, {
        'click .o_edit_product_configuration': '_onEditProductConfiguration'
    }),

    _render: function () {
       this._super.apply(this, arguments);
       if (this.mode === 'edit' && this.value &&
       (this._isConfigurableProduct())) {
           this._addProductLinkButton();
           this._addConfigurationEditButton();
       } else if (this.mode === 'edit' && this.value) {
           this._addProductLinkButton();
       } else {
           this.$('.o_edit_product_configuration').hide();
       }
    },

    _addProductLinkButton: function () {
       if (this.$('.o_external_button').length === 0) {
           var $productLinkButton = $('<button>', {
               type: 'button',
               class: 'fa fa-external-link btn btn-secondary o_external_button',
               tabindex: '-1',
               draggable: false,
               'aria-label': _t('External Link'),
               title: _t('External Link')
           });
           var $inputDropdown = this.$('.o_input_dropdown');
           $inputDropdown.after($productLinkButton);
       }
    },

    _addConfigurationEditButton: function () {
       var $inputDropdown = this.$('.o_input_dropdown');
       if ($inputDropdown.length !== 0 &&
           this.$('.o_edit_product_configuration').length === 0) {
           var $editConfigurationButton = $('<button>', {
               type: 'button',
               class: 'fa fa-pencil btn btn-secondary o_edit_product_configuration',
               tabindex: '-1',
               draggable: false,
               'aria-label': _t('Edit Configuration'),
               title: _t('Edit Configuration')
           });
           $inputDropdown.after($editConfigurationButton);
       }
    },

    _isConfigurableProduct: function () {
        return this.recordData.is_configurable_product;
    },

    reset: async function (record, ev) {
        await this._super(...arguments);
        if (ev && ev.target === this && ev.data.changes && ev.data.changes.product_template_id && record.data.product_template_id.data.id) {
            this._onTemplateChange(record.data.product_template_id.data.id, ev.data.dataPointID);
        }
    },

    _onTemplateChange: function (productTemplateId, dataPointId) {
        var self = this;
        this._rpc({
            model: 'product.template',
            method: 'get_single_product_variant',
            args: [
                productTemplateId
            ]
        }).then(function (result) {
            if (result.product_id) {
                self.trigger_up('field_changed', {
                    dataPointID: dataPointId,
                    changes: {
                        product_id: {id: result.product_id},
                    },
                });
            } else {

                self._openMatrix(productTemplateId, dataPointId, false);
            }
        });
    },

    _onEditProductConfiguration: function () {
        if (this.recordData.is_configurable_product) {
            this._openMatrix(this.recordData.product_template_id.data.id, this.dataPointID, true);
        }
    },

    _openMatrix: function (productTemplateId, dataPointId, edit) {
        var attribs = edit ? this._getPTAVS() : [];
        this.trigger_up('open_matrix', {
            product_template_id: productTemplateId,
            model: 'stock.picking',
            dataPointId: dataPointId,
            edit: edit,
            editedCellAttributes: attribs,
            // used to focus the cell representing the line on which the pencil was clicked.
        });
    },

    _getPTAVS: function () {
        var PTAVSIDS = [];
        _.each(this.recordData.product_no_variant_attribute_value_ids.res_ids, function (id) {
            PTAVSIDS.push(id);
        });
        _.each(this.recordData.product_template_attribute_value_ids.res_ids, function (id) {
            PTAVSIDS.push(id);
        });
        return PTAVSIDS.sort(function (a, b) {return a - b;});
    }
});

FieldsRegistry.add('stock_matrix_configurator', StockMatrixConfiguratorWidget);

return StockMatrixConfiguratorWidget;

});
