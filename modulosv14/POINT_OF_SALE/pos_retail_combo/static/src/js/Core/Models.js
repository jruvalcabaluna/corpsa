
odoo.define('pos_retail_combo.model', function (require) {
    const models = require('point_of_sale.models');
    const utils = require('web.utils');
    const core = require('web.core');
    const round_pr = utils.round_precision;
    const _t = core._t;
    const rpc = require('web.rpc');
//    const rpc = require('pos.rpc');
//    const session = require('web.session');
    const time = require('web.time');
//    const Session = require('web.Session');
//    const load_model = require('point_of_sale.load_models');
//    const {Printer} = require('point_of_sale.Printer');
    const {posbus} = require('point_of_sale.utils');

    let _super_PosModel = models.PosModel.prototype;
    models.PosModel = models.PosModel.extend({
        generate_wrapped_name: function (name) {
            let MAX_LENGTH = 24; // 40 * line ratio of .6
            let wrapped = [];
            let current_line = "";

            while (name.length > 0) {
                let space_index = name.indexOf(" ");

                if (space_index === -1) {
                    space_index = name.length;
                }

                if (current_line.length + space_index > MAX_LENGTH) {
                    if (current_line.length) {
                        wrapped.push(current_line);
                    }
                    current_line = "";
                }

                current_line += name.slice(0, space_index + 1);
                name = name.slice(space_index + 1);
            }

            if (current_line.length) {
                wrapped.push(current_line);
            }

            return wrapped;
        },
        getReceiptEnv() {
            let selectedOrder = this.get_order();
            if (!selectedOrder) {
                return null
            }
            let receiptEnv = selectedOrder.getOrderReceiptEnv();
            receiptEnv['pos'] = this;
            if (this.company.contact_address) {
                receiptEnv.receipt.contact_address = this.company.contact_address
            }
            let orderlines_by_category_name = {};
            let order = this.get_order();
            let orderlines = order.orderlines.models;
            let categories = [];
            if (this.config.category_wise_receipt) {
                for (let i = 0; i < orderlines.length; i++) {
                    let line = orderlines[i];
                    let line_print = line.export_for_printing();
                    line['product_name_wrapped'] = line_print['product_name_wrapped'][0];
                    let pos_categ_id = line['product']['pos_categ_id'];
                    if (pos_categ_id && pos_categ_id.length == 2) {
                        let root_category_id = order.get_root_category_by_category_id(pos_categ_id[0]);
                        let category = this.db.category_by_id[root_category_id];
                        let category_name = category['name'];
                        if (!orderlines_by_category_name[category_name]) {
                            orderlines_by_category_name[category_name] = [line];
                            let category_index = _.findIndex(categories, function (category) {
                                return category == category_name;
                            });
                            if (category_index == -1) {
                                categories.push(category_name)
                            }
                        } else {
                            orderlines_by_category_name[category_name].push(line)
                        }

                    } else {
                        if (!orderlines_by_category_name['None']) {
                            orderlines_by_category_name['None'] = [line]
                        } else {
                            orderlines_by_category_name['None'].push(line)
                        }
                        let category_index = _.findIndex(categories, function (category) {
                            return category == 'None';
                        });
                        if (category_index == -1) {
                            categories.push('None')
                        }
                    }
                }
            }
            receiptEnv['orderlines_by_category_name'] = orderlines_by_category_name;
            receiptEnv['categories'] = categories;
            receiptEnv['total_paid'] = order.get_total_paid(); // save amount due if have (display on receipt of partial order)
            receiptEnv['total_due'] = order.get_due(); // save amount due if have (display on receipt of partial order)
            receiptEnv['invoice_ref'] = order.invoice_ref;
            receiptEnv['picking_ref'] = order.picking_ref;
            receiptEnv['order_fields_extend'] = order.order_fields_extend;
            receiptEnv['delivery_fields_extend'] = order.delivery_fields_extend;
            receiptEnv['invoice_fields_extend'] = order.invoice_fields_extend;
            return receiptEnv
        },
//        highlight_control_button: function (button_class) {
//            $('.' + button_class).addClass('highlight')
//        },
//        remove_highlight_control_button: function (button_class) {
//            $('.' + button_class).removeClass('highlight')
//        },

//        get_model: function (_name) {
//            let _index = this.models.map(function (e) {
//                return e.model;
//            }).indexOf(_name);
//            if (_index > -1) {
//                return this.models[_index];
//            }
//            return false;
//        },
//        initialize: function (session, attributes) {
//            this.is_mobile = odoo.is_mobile;
//            let account_tax_model = this.get_model('account.tax');
//            account_tax_model.fields.push('type_tax_use');
//            let wait_currency = this.get_model('res.currency');
//            wait_currency.fields.push(
//                'rate'
//            );
//            let account_fiscal_position_tax_model = this.get_model('account.fiscal.position.tax');
//            let _super_account_fiscal_position_tax_model_loaded = account_fiscal_position_tax_model.loaded;
//            account_fiscal_position_tax_model.loaded = function (self, fiscal_position_taxes) {
//                fiscal_position_taxes = _.filter(fiscal_position_taxes, function (tax) {
//                    return tax.tax_dest_id != false;
//                });
//                if (fiscal_position_taxes.length > 0) {
//                    _super_account_fiscal_position_tax_model_loaded(self, fiscal_position_taxes);
//                }
//            };
//            let pos_category_model = this.get_model('pos.category');
//            pos_category_model.condition = function (self) {
//                return self.config.product_category_ids.length == 0
//            }
//            let _super_loaded_pos_category_model = pos_category_model.loaded;
//            pos_category_model.loaded = function (self, categories) {
//                if (!self.pos_categories) {
//                    self.pos_categories = categories;
//                    self.pos_category_by_id = {};
//                } else {
//                    self.pos_categories = self.pos_categories.concat(categories);
//                }
//                for (let i = 0; i < categories.length; i++) {
//                    let category = categories[i];
//                    self.pos_category_by_id[category.id] = category;
//                }
//                _.each(categories, function (category) {
//                    category.parent = self.pos_category_by_id[category.parent_id[0]];
//                });
//                _super_loaded_pos_category_model(self, categories);
//            };
//            pos_category_model.fields = pos_category_model.fields.concat([
//                'is_category_combo',
//                'sale_limit_time',
//                'from_time',
//                'to_time',
//                'submit_all_pos',
//                'pos_branch_ids',
//                'pos_config_ids',
//                'category_type',
//            ]);

//            let product_category_model = this.get_model('product.category');
//            product_category_model.domain = function (self) {
//                if (self.config.product_category_ids) {
//                    return [['id', 'in', self.config.product_category_ids]]
//                } else {
//                    return []
//                }
//            }
//            let _super_loaded_product_category_model = product_category_model.loaded;
//            product_category_model.loaded = function (self, categories) {
//                self.pos_categories_appetizer = []
//                if (!self.pos_categories) {
//                    self.pos_categories = categories;
//                    self.pos_category_by_id = {};
//                } else {
//                    self.pos_categories = self.pos_categories.concat(categories);
//                }
//                for (let i = 0; i < categories.length; i++) {
//                    let category = categories[i];
//                    self.pos_category_by_id[category.id] = category;
//                    if (category['category_type'] == 'appetizer') {
//                        self.pos_categories_appetizer.push(category.id)
//                    }
//                }
//                _.each(categories, function (category) {
//                    category.parent = self.pos_category_by_id[category.parent_id[0]];
//                });
//                _super_loaded_product_category_model(self, categories);
//                self.db.add_categories(categories);
//            };
//            let product_model = this.get_model('product.product');
//            product_model.fields.push(
//                'name',
//                'is_credit',
//                'multi_category',
//                'multi_uom',
//                'multi_variant',
//                'supplier_barcode',
//                'is_combo',
//                'sale_ok',
//                'combo_limit',
//                'uom_po_id',
//                'barcode_ids',
//                'pos_categ_ids',
//                'supplier_taxes_id',
//                'volume',
//                'weight',
//                'description_sale',
//                'description_picking',
//                'type',
//                'cross_selling',
//                'standard_price',
//                'pos_sequence',
//                'is_voucher',
//                'minimum_list_price',
//                'sale_with_package',
//                'qty_warning_out_stock',
//                'write_date',
//                'is_voucher',
//                'combo_price',
//                'is_combo_item',
//                'name_second',
//                'note_ids',
//                'tag_ids',
//                'commission_rate',
//                'company_id',
//                'uom_ids',
//                'attribute_line_ids',
//                'product_template_attribute_value_ids',
//                'addon_id',
//                'college_id',
//                'model_id',
//                'sex_id',
//            );
//            this.bus_location = null;
//            let partner_model = this.get_model('res.partner');
//            partner_model.fields.push(
//                'display_name',
//                'ref',
//                'vat',
//                'comment',
//                'discount_id',
//                'credit',
//                'debit',
//                'balance',
//                'limit_debit',
//                'wallet',
//                'property_product_pricelist',
//                'property_payment_term_id',
//                'is_company',
//                'write_date',
//                'birthday_date',
//                'group_ids',
//                'title',
//                'company_id',
//                'pos_loyalty_point',
//                'pos_loyalty_type',
//                'pos_order_count',
//                'pos_total_amount',
//                'type',
//                'parent_id',
//                'company_type',
//            );
//            const productAttributeModel = this.get_model('product.attribute');
//            if (productAttributeModel) {
//                productAttributeModel.domain = []
//            }
//            let pricelist_model = this.get_model('product.pricelist');
//            pricelist_model.fields.push('id', 'currency_id');
//            pricelist_model['pricelist'] = true;
//            let _super_pricelist_loaded = pricelist_model.loaded;
//            pricelist_model.loaded = function (self, pricelists) {
//                self.pricelist_currency_ids = [];
//                self.pricelist_by_id = {};
//                for (let i = 0; i < pricelists.length; i++) {
//                    let pricelist = pricelists[i];
//                    if (pricelist.currency_id) {
//                        pricelist.name = pricelist.name + '(' + pricelist.currency_id[1] + ')'
//                    }
//                    self.pricelist_by_id[pricelist.id] = pricelist;
//                    if (pricelist.currency_id) {
//                        self.pricelist_currency_ids.push(pricelist.currency_id[0])
//                    }
//                }
//                _super_pricelist_loaded(self, pricelists);
//            };
//            let pricelist_item_model = this.get_model('product.pricelist.item');
//            pricelist_item_model['pricelist'] = true;
//            let payment_method_object = this.get_model('pos.payment.method');
//            let _super_payment_method_loaded = payment_method_object.loaded;
//            payment_method_object.fields = payment_method_object.fields.concat(['cash_journal_id', 'fullfill_amount', 'shortcut_keyboard', 'cheque_bank_information']);
//            payment_method_object.loaded = function (self, payment_methods) {
//                self.payment_methods = payment_methods;
//                _super_payment_method_loaded(self, payment_methods);
//            };
//            let res_users_object = this.get_model('res.users');
//            if (res_users_object) {
//                res_users_object.fields = res_users_object.fields.concat([
//                    'pos_security_pin',
//                    'barcode',
//                    'pos_config_id',
//                    'partner_id',
//                    'company_ids',
//                ]);
//                // todo: move load res.users after pos.config, we dont want load res.users after partners or products because we need checking company_ids of user
//                let res_users = _.filter(this.models, function (model) {
//                    return model.model == 'res.users';
//                });
//                this.models = _.filter(this.models, function (model) {
//                    return model.model != 'res.users';
//                })
//                if (res_users) {
//                    let index_number_pos_config = null;
//                    for (let i = 0; i < this.models.length; i++) {
//                        let model = this.models[i];
//                        if (model.model == 'pos.config') {
//                            index_number_pos_config = i;
//                            break
//                        }
//                    }
//                    for (let i = 0; i < res_users.length; i++) {
//                        let user_model = res_users[i];
//                        this.models.splice(index_number_pos_config + 1, 0, user_model)
//                    }
//                }
//            }
//            let pos_session_model = this.get_model('pos.session');
//            pos_session_model.fields.push('lock_state');
//            let pos_config_model = this.get_model('pos.config');
//            let _pos_config_loaded = pos_config_model.loaded;
//            pos_config_model.loaded = function (self, configs) {
//                _pos_config_loaded(self, configs);
//                self.config.sync_to_pos_config_ids = _.filter(self.config.sync_to_pos_config_ids, function (id) {
//                    return id != self.config.id
//                })
//            };
//            _super_PosModel.initialize.apply(this, arguments);
//            let employee_model = this.get_model('hr.employee');
//            if (employee_model) {
//                let _super_employee_model_loaded = employee_model.loaded;
//                employee_model.fields = employee_model.fields.concat([
//                    'allow_discount',
//                    'allow_qty',
//                    'allow_price',
//                    'allow_remove_line',
//                    'allow_minus',
//                    'allow_payment',
//                    'allow_customer',
//                    'allow_add_order',
//                    'allow_remove_order',
//                    'allow_add_product',
//                    'allow_payment_zero',
//                    'allow_offline_mode',
//                    'image_1920',
//                ])
//                employee_model.loaded = function (self, employees) {
//                    _super_employee_model_loaded(self, employees);
//                    self.employee_by_id = {};
//                    for (let i = 0; i < employees.length; i++) {
//                        let emp = employees[i];
//                        self.employee_by_id[emp.id] = emp;
//                    }
//                };
//            }
//        },
//        async add_new_order() {
//            _super_PosModel.add_new_order.apply(this, arguments);
//            let order = this.get_order();
//            let client = order.get_client();
//            if (!client && this.config.customer_default_id) {
//                let client_default = this.db.get_partner_by_id(this.config.customer_default_id[0]);
//                let order = this.get_order();
//                order.set_client(client_default);
//            }
//            this._required_set_client()
//        },
//        formatDateTime: function (value, field, options) {
//            if (value === false) {
//                return "";
//            }
//            if (!options || !('timezone' in options) || options.timezone) {
//                value = value.clone().add(session.getTZOffset(value), 'minutes');
//            }
//            return value.format(time.getLangDatetimeFormat());
//        },
//        format_date: function (date) { // covert datetime backend to pos
//            if (date) {
//                return this.formatDateTime(
//                    moment(date), {}, {timezone: true});
//            } else {
//                return ''
//            }
//        },
//        get_config: function () {
//            return this.config;
//        },
    });
});
