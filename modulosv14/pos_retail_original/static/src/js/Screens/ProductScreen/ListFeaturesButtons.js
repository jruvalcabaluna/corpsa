odoo.define('pos_retail.ListFeaturesButtons', function (require) {
    'use strict';

    const PosComponent = require('point_of_sale.PosComponent');
    const Registries = require('point_of_sale.Registries');
    const core = require('web.core');
    const qweb = core.qweb;
    const {posbus} = require('point_of_sale.utils');
    const {Printer} = require('point_of_sale.Printer');
    const OrderReceipt = require('point_of_sale.OrderReceipt');

    class ListFeaturesButtons extends PosComponent {
        constructor() {
            super(...arguments);
            this._currentOrder = this.env.pos.get_order();
            this._currentOrder.orderlines.on('change', this.render, this);
            this.env.pos.on('change:selectedOrder', this._updateCurrentOrder, this);
        }

        willUnmount() {
            this._currentOrder.orderlines.off('change', null, this);
            this.env.pos.off('change:selectedOrder', null, this);
        }

        _updateCurrentOrder(pos, newSelectedOrder) {
            this._currentOrder.orderlines.off('change', null, this);
            if (newSelectedOrder) {
                this._currentOrder = newSelectedOrder;
                this._currentOrder.orderlines.on('change', this.render, this);
            }
        }

        get getClientName() {
            if (this.env.pos.get_order()) {
                const selectedOrder = this.env.pos.get_order()
                if (selectedOrder.get_client()) {
                    return selectedOrder.get_client().display_name
                } else {
                    return this.env._t('Customer')
                }
            } else {
                return this.env._t('Customer')
            }
        }

        async clearCartItems() {
            const selectedOrder = this.env.pos.get_order();
            if (selectedOrder.orderlines.length == 0) {
                return this.showPopup('ErrorPopup', {
                    title: this.env._t('Error'),
                    body: this.env._t('Your order cart is blank')
                })
            }
            let {confirmed, payload: result} = await this.showPopup('ConfirmPopup', {
                title: this.env._t('Warning'),
                body: this.env._t('Are you want clear cart, all lines in cart will remove ?')
            })
            if (confirmed) {
                selectedOrder.orderlines.models.forEach(l => selectedOrder.remove_orderline(l))
                selectedOrder.orderlines.models.forEach(l => selectedOrder.remove_orderline(l))
                selectedOrder.orderlines.models.forEach(l => selectedOrder.remove_orderline(l))
                selectedOrder.orderlines.models.forEach(l => selectedOrder.remove_orderline(l))
                selectedOrder.is_return = false;
                this.render()
            }
        }

        get returnStringButton() {
            const selectedOrder = this.env.pos.get_order();
            if (selectedOrder.is_return) {
                return this.env._t('Return Mode [On]')
            } else {
                return this.env._t('Return Mode [Off]')
            }
        }

        get isReturnOrder() {
            const selectedOrder = this.env.pos.get_order();
            if (selectedOrder.is_return) {
                return true
            } else {
                return false
            }
        }

        async changeToReturnMode() {
            const selectedOrder = this.env.pos.get_order();
            if (selectedOrder.picking_type_id) {
                const pickingType = this.env.pos.stock_picking_type_by_id[selectedOrder.picking_type_id]
                if (!pickingType['return_picking_type_id']) {
                    return this.showPopup('ErrorPopup', {
                        title: this.env._t('Warning'),
                        body: this.env._t('Your POS [Operation Type]: [ ') + pickingType.name + this.env._t(' ] not set Return Picking Type. Please set it for Return Packing bring stock on hand come back Your POS Stock Location. Operation Type for return required have Default Source Location difference Default Destination Location. Is correctly if Destination Location is your POS stock Location')
                    })
                }

            }
            if (selectedOrder.is_to_invoice() && !selectedOrder.get_client()) {
                this.showPopup('ConfirmPopup', {
                    title: this.env._t('Warning'),
                    body: this.env._t('Order will process to Invoice, please select one Customer for set to current Order'),
                    disableCancelButton: true,
                })
                const {confirmed, payload: newClient} = await this.showTempScreen(
                    'ClientListScreen',
                    {client: null}
                );
                if (confirmed) {
                    selectedOrder.set_client(newClient);
                } else {
                    return this.showPopup('ErrorPopup', {
                        title: this.env._t('Error'),
                        body: this.env._t('Order will processing to Invoice, required set a Customer')
                    })
                }
            }
            if (selectedOrder.is_return) {
                selectedOrder.orderlines.models.forEach((l) => {
                    if (l.quantity < 0) {
                        l.set_quantity(-l.quantity, 'keep price when return')
                    }
                })
                selectedOrder.is_return = false
                selectedOrder.trigger('change', selectedOrder)
                return this.showPopup('ConfirmPopup', {
                    title: this.env._t('Successfully'),
                    body: this.env._t('Order change to Normal Mode'),
                    disableCancelButton: true,
                })
            }
            if (selectedOrder.orderlines.length == 0) {
                return this.showPopup('ErrorPopup', {
                    title: this.env._t('Error'),
                    body: this.env._t('Your order cart is blank')
                })
            }
            if (this.env.pos.config.validate_return) {
                let validate = await this.env.pos._validate_action(this.env._t('Need Approve of Your Manager'));
                if (!validate) {
                    return false;
                }
            }
            let returnMethod = null;
            if (this.env.pos.config.return_method_id) {
                returnMethod = this.env.pos.payment_methods.find((p) => this.env.pos.config.return_method_id && p.id == this.env.pos.config.return_method_id[0])
            }
            if (selectedOrder.orderlines.models.length <= 0) {
                return this.showPopup('ErrorPopup', {
                    title: this.env._t('Error'),
                    body: this.env._t('Your shopping cart is empty')
                })
            }
            let {confirmed, payload: text} = await this.showPopup('TextAreaPopup', {
                title: this.env._t('Add some notes why customer return products ?'),
                startingValue: selectedOrder.get_note()
            })
            if (confirmed) {
                selectedOrder.set_note(text);
                selectedOrder.orderlines.models.forEach((l) => {
                    if (l.quantity >= 0) {
                        l.set_quantity(-l.quantity, 'keep price when return')
                    }
                })
                if (!returnMethod) {
                    return this.showScreen('PaymentScreen');
                } else {
                    selectedOrder.is_return = true;
                    selectedOrder.paymentlines.models.forEach(function (p) {
                        selectedOrder.remove_paymentline(p)
                    })
                    selectedOrder.add_paymentline(returnMethod);
                    let order_ids = this.env.pos.push_single_order(selectedOrder, {})
                    return this.showScreen('ReceiptScreen');
                }

            }
        }

        async printReceipt() {
            const order = this.env.pos.get_order();
            if (!order) return;
            if (order.orderlines.length == 0) {
                return this.showPopup('ErrorPopup', {
                    title: this.env._t('Error'),
                    body: this.env._t('Your order cart is blank')
                })
            }
            if (this.env.pos.config.proxy_ip && this.env.pos.proxy.printer) {
                const printResult = await this.env.pos.proxy.printer.print_receipt(qweb.render('XmlReceipt', this.env.pos.getReceiptEnv()));
                if (printResult.successful) {
                    return true;
                } else {
                    this.showPopup('ErrorPopup', {
                        title: this.env._t('Error'),
                        body: this.env._t('Have something wrong about conntecion POSBOX and printer')
                    })
                    return false;
                }
            }
            if (this.env.pos.proxy.printer && !this.env.pos.config.proxy_ip) {
                const fixture = document.createElement('div');
                const orderReceipt = new (Registries.Component.get(OrderReceipt))(this, {order});
                await orderReceipt.mount(fixture);
                const receiptHtml = orderReceipt.el.outerHTML;
                const printResult = await this.env.pos.proxy.printer.print_receipt(receiptHtml);
                if (!printResult.successful) {
                    this.showTempScreen('ReprintReceiptScreen', {order: order});
                }
            } else {
                posbus.trigger('set-screen', 'Receipt')
                // this.showTempScreen('ReprintReceiptScreen', {order: order});
            }
        }

        async sendVoucherPdf() {
            let responseOfWhatsApp = await this.rpc({
                model: 'pos.config',
                method: 'send_pdf_via_whatsapp',
                args: [[], this.env.pos.config.id, 'Coupon', 'coupon.report_coupon_code', 78, '84902403918', 'PDF'],
            });
            if (responseOfWhatsApp && responseOfWhatsApp['id']) {
                return this.showPopup('ConfirmPopup', {
                    title: this.env._t('Successfully'),
                    body: this.env._t("Receipt send successfully to your Client's Phone WhatsApp: ") + mobile_no,
                    disableCancelButton: true,
                })
            } else {
                return this.showPopup('ErrorPopup', {
                    title: this.env._t('Error'),
                    body: this.env._t("Send Receipt is fail, please check WhatsApp API and Token of your pos config or Your Server turn off Internet"),
                    disableCancelButton: true,
                })
            }
        }

        async sendReceiptViaWhatsApp() {
            let fixture = document.createElement('div');
            const printer = new Printer();
            const order = this.env.pos.get_order()
            const orderReceipt = new (Registries.Component.get(OrderReceipt))(this, {order});
            await orderReceipt.mount(fixture);
            const receiptString = orderReceipt.el.outerHTML;
            const ticketImage = await printer.htmlToImg(receiptString);

            if (!order || order.get_orderlines().length == 0) {
                return this.showPopup('ErrorPopup', {
                    title: this.env._t('Warning'),
                    body: this.env._t('Your order is blank cart'),
                })
            }
            const client = order.get_client();
            let mobile_no = '';
            if (!client || (!client['mobile'] && !client['phone'])) {
                let {confirmed, payload: number} = await this.showPopup('NumberPopup', {
                    title: this.env._t("Order have not set Client or Client null Phone/Mobile. Please input Client's Mobile for send Receipt"),
                    startingValue: 0
                })
                if (confirmed) {
                    mobile_no = number
                } else {
                    return this.showPopup('ErrorPopup', {
                        title: this.env._t('Error'),
                        body: this.env._t("Mobile Number is required"),
                        disableCancelButton: true,
                    })
                }
            } else {
                mobile_no = client.mobile || client.phone
            }
            let message = this.env.pos.config.whatsapp_message_receipt + ' ' + order['name'];
            let {confirmed, payload: messageNeedSend} = await this.showPopup('TextAreaPopup', {
                title: this.env._t('What message need to send Client ?'),
                startingValue: message
            })
            if (confirmed) {
                message = messageNeedSend
            }

            if (mobile_no) {
                let {confirmed, payload: confirm} = await this.showPopup('ConfirmPopup', {
                    title: this.env._t('Please review Mobile Number'),
                    body: mobile_no + this.env._t(" will use for send the Receipt, are you sure ? If you need change, please click Cancel button"),
                })
                if (confirmed) {
                    let responseOfWhatsApp = await this.rpc({
                        model: 'pos.config',
                        method: 'send_receipt_via_whatsapp',
                        args: [[], this.env.pos.config.id, ticketImage, mobile_no, message],
                    });
                    if (responseOfWhatsApp && responseOfWhatsApp['id']) {
                        return this.showPopup('ConfirmPopup', {
                            title: this.env._t('Successfully'),
                            body: this.env._t("Receipt send successfully to your Client's Phone WhatsApp: ") + mobile_no,
                            disableCancelButton: true,
                        })
                    } else {
                        return this.showPopup('ErrorPopup', {
                            title: this.env._t('Error'),
                            body: this.env._t("Send Receipt is fail, please check WhatsApp API and Token of your pos config or Your Server turn off Internet"),
                            disableCancelButton: true,
                        })
                    }
                } else {
                    let {confirmed, payload: number} = await this.showPopup('NumberPopup', {
                        title: this.env._t("Please input WhatsApp Client's Mobile ?"),
                        startingValue: 0
                    })
                    if (confirmed) {
                        mobile_no = number
                        let responseOfWhatsApp = await this.rpc({
                            model: 'pos.config',
                            method: 'send_receipt_via_whatsapp',
                            args: [[], this.env.pos.config.id, ticketImage, mobile_no, message],
                        });
                        if (responseOfWhatsApp && responseOfWhatsApp['id']) {
                            return this.showPopup('ConfirmPopup', {
                                title: this.env._t('Successfully'),
                                body: this.env._t("Receipt send successfully to your Client's Phone WhatsApp: ") + mobile_no,
                                disableCancelButton: true,
                            })
                        } else {
                            return this.showPopup('ErrorPopup', {
                                title: this.env._t('Error'),
                                body: this.env._t("Send Receipt is fail, please check WhatsApp API and Token of your pos config or Your Server turn off Internet"),
                                disableCancelButton: true,
                            })
                        }
                    }
                }

            } else {
                return this.showPopup('ErrorPopup', {
                    title: this.env._t('Error'),
                    body: this.env._t("Mobile Number is required"),
                    disableCancelButton: true,
                })
            }
        }

        async addCoupon() {
            const selectedOrder = this.env.pos.get_order()
            if (selectedOrder.orderlines.length == 0) {
                return this.showPopup('ErrorPopup', {
                    title: this.env._t('Error'),
                    body: this.env._t('Your cart is blank. Please finish order products and use Promotion/Coupon Code')
                })
            }
            let {confirmed, payload: code} = await this.showPopup('TextInputPopup', {
                title: this.env._t('Promotion/Coupon Code ?'),
            })
            if (confirmed) {
                this.env.pos.getInformationCouponPromotionOfCode(code)
            }
        }

        async setGlobalDiscount() {
            const selectedOrder = this.env.pos.get_order();
            if (selectedOrder.orderlines.length == 0) {
                return this.showPopup('ErrorPopup', {
                    title: this.env._t('Error'),
                    body: this.env._t('Your order cart is blank')
                })
            }
            if (selectedOrder.is_return) {
                return this.showPopup('ErrorPopup', {
                    title: this.env._t('Error'),
                    body: this.env._t('It not possible add Global Dicsount for Order Return')
                })
            }
            selectedOrder.clear_discount_extra()
            console.log('Hello pos LFB',this.env.pos)
            console.log('Hello discounts LFB',this.env.pos.discounts)
            const list = this.env.pos.discounts.map(discount => ({
                id: discount.id,
                name: discount.name,
                item: discount
            }))
            let {confirmed, payload: selectedItems} = await this.showPopup(
                'PopUpSelectionBox',
                {
                    title: this.env._t('Please select one Global Discount need to apply'),
                    items: list,
                    onlySelectOne: true,
                }
            );
            if (confirmed) {
                selectedOrder.add_global_discount(selectedItems.items[0]['item'])
            }
        }

        async setDiscountValue() {
            const selectedOrder = this.env.pos.get_order();
            if (selectedOrder.orderlines.length == 0) {
                return this.showPopup('ErrorPopup', {
                    title: this.env._t('Error'),
                    body: this.env._t('Your order cart is blank')
                })
            }
            let {confirmed, payload: discount} = await this.showPopup('NumberPopup', {
                title: this.env._t('Which value of discount Value would you apply to Order ? (Click Cancel for reset all Discount Value each Line)'),
                startingValue: this.env.pos.config.discount_value_limit
            })
            if (confirmed) {
                selectedOrder.set_discount_value(parseFloat(discount))
            } else {
                selectedOrder.clear_discount_extra()
            }
        }

        async setNotes() {
            const order = this.env.pos.get_order();
            const {confirmed, payload: note} = await this.showPopup('TextAreaPopup', {
                title: this.env._t('Full fill text input for add Notes to Order'),
                startingValue: order.get_note()
            })
            if (confirmed) {
                order.set_note(note)
            }
        }

        async setServicesOrder() {
            const selectedOrder = this.env.pos.get_order();
            if (selectedOrder.orderlines.length == 0) {
                return this.showPopup('ErrorPopup', {
                    title: this.env._t('Error'),
                    body: this.env._t('Your order cart is blank')
                })
            }
            const list = this.env.pos.services_charge.map(service => ({
                id: service.id,
                name: service.name,
                item: service
            }))
            let {confirmed, payload: selectedItems} = await this.showPopup(
                'PopUpSelectionBox',
                {
                    title: this.env._t('Please select one Service need add to Order'),
                    items: list,
                    onlySelectOne: true,
                }
            );
            if (confirmed && selectedItems['items'].length > 0) {
                const service = selectedItems['items'][0]['item']
                var product = this.env.pos.db.get_product_by_id(service['product_id'][0]);
                if (product) {
                    selectedOrder.add_shipping_cost(service, product, false)
                } else {
                    return this.showPopup('ErrorPopup', {
                        title: this.env._t('Warning'),
                        body: service['product_id'][1] + this.env._t(' not available in POS. Please set this product available in POS before use this feature')
                    })
                }
            }
        }

        async signatureOrder() {
            const order = this.env.pos.get_order();
            const {confirmed, payload: values} = await this.showPopup('PopUpSignatureOrder', {
                title: this.env._t('Signature Order'),
            })
            if (confirmed) {
                if (!values.signature) {
                    return this.showPopup('ErrorPopup', {
                        title: this.env._t('Warning'),
                        body: this.env._t('Signature not success, please try again')
                    })
                } else {
                    order.set_signature(values.signature)
                }
            }
        }

        async quicklyPaidOrder() {
            const selectedOrder = this.env.pos.get_order();
            if (selectedOrder.orderlines.length == 0) {
                return this.showPopup('ErrorPopup', {
                    title: this.env._t('Error'),
                    body: this.env._t('Your order cart is blank')
                })
            }
            if (selectedOrder.is_to_invoice() && !selectedOrder.get_client()) {
                this.showPopup('ConfirmPopup', {
                    title: this.env._t('Warning'),
                    body: this.env._t('Order will process to Invoice, please select one Customer for set to current Order'),
                    disableCancelButton: true,
                })
                const {confirmed, payload: newClient} = await this.showTempScreen(
                    'ClientListScreen',
                    {client: null}
                );
                if (confirmed) {
                    selectedOrder.set_client(newClient);
                } else {
                    return this.showPopup('ErrorPopup', {
                        title: this.env._t('Error'),
                        body: this.env._t('Order will processing to Invoice, required set a Customer')
                    })
                }
            }
            const linePriceSmallerThanZero = selectedOrder.orderlines.models.find(l => l.get_price_with_tax() <= 0 && !l.coupon_program_id && !l.promotion)
            if (this.env.pos.config.validate_return && linePriceSmallerThanZero) {
                let validate = await this.env.pos._validate_action(this.env._t('Have one Line has Price smaller than or equal 0. Need Manager Approve'));
                if (!validate) {
                    return false;
                }
            }
            const lineIsCoupon = selectedOrder.orderlines.models.find(l => l.coupon_id || l.coupon_program_id);
            if (lineIsCoupon && this.env.pos.config.validate_coupon) {
                let validate = await this.env.pos._validate_action(this.env._t('Order add coupon, required need Manager Approve'));
                if (!validate) {
                    return false;
                }
            }
            if (this.env.pos.config.validate_payment) {
                let validate = await this.env.pos._validate_action(this.env._t('Need approve Payment'));
                if (!validate) {
                    return false;
                }
            }
            if (selectedOrder.get_total_with_tax() <= 0 || selectedOrder.orderlines.length == 0) {
                return this.showPopup('ErrorPopup', {
                    title: this.env._t('Error'),
                    body: this.env._t('It not possible with empty cart or Amount Total order smaller than or equal 0')
                })
            }
            let lists = this.env.pos.payment_methods.filter((p) => (p.journal && p.pos_method_type && p.pos_method_type == 'default') || (!p.journal && !p.pos_method_type)).map((p) => ({
                id: p.id,
                item: p,
                name: p.name
            }))
            let {confirmed, payload: selectedItems} = await this.showPopup(
                'PopUpSelectionBox',
                {
                    title: this.env._t('Quickly Paid !!! Please Select one Payment Mode'),
                    items: lists,
                    onlySelectOne: true,
                }
            );
            if (confirmed && selectedItems['items'].length != 0) {
                const paymentMethod = selectedItems['items'][0]['item']
                let {confirmed, payload: result} = await this.showPopup(
                    'ConfirmPopup',
                    {
                        title: this.env._t('You need full fill Payment Amount: ') + this.env.pos.format_currency(selectedOrder.get_total_with_tax()) + this.env._t(' . With payment method is: ') + paymentMethod.name,
                        items: lists,
                        onlySelectOne: true,
                    }
                );
                if (confirmed) {
                    let paymentLines = selectedOrder.paymentlines.models
                    paymentLines.forEach(function (p) {
                        selectedOrder.remove_paymentline(p)
                    })
                    selectedOrder.add_paymentline(paymentMethod);
                    var paymentline = selectedOrder.selected_paymentline;
                    paymentline.set_amount(selectedOrder.get_total_with_tax());
                    selectedOrder.trigger('change', selectedOrder);
                    let order_ids = this.env.pos.push_single_order(selectedOrder, {})
                    console.log('[quicklyPaidOrder] pushed succeed order_ids: ' + order_ids)
                    return this.showScreen('ReceiptScreen');
                }

            }
        }

        async partialPaidOrder() {
            const selectedOrder = this.env.pos.get_order();
            if (selectedOrder.orderlines.length == 0) {
                return this.showPopup('ErrorPopup', {
                    title: this.env._t('Error'),
                    body: this.env._t('Your order cart is blank')
                })
            }
            const linePriceSmallerThanZero = selectedOrder.orderlines.models.find(l => l.get_price_with_tax() <= 0 && !l.coupon_program_id && !l.promotion)
            if (this.env.pos.config.validate_return && linePriceSmallerThanZero) {
                let validate = await this.env.pos._validate_action(this.env._t('Have one Line has Price smaller than or equal 0. Need Manager Approve'));
                if (!validate) {
                    return false;
                }
            }
            const lineIsCoupon = selectedOrder.orderlines.models.find(l => l.coupon_id || l.coupon_program_id);
            if (lineIsCoupon && this.env.pos.config.validate_coupon) {
                let validate = await this.env.pos._validate_action(this.env._t('Order add coupon, required need Manager Approve'));
                if (!validate) {
                    return false;
                }
            }
            if (this.env.pos.config.validate_payment) {
                let validate = await this.env.pos._validate_action(this.env._t('Need approve Payment'));
                if (!validate) {
                    return false;
                }
            }
            if (selectedOrder.get_total_with_tax() <= 0 || selectedOrder.orderlines.length == 0) {
                return this.showPopup('ErrorPopup', {
                    title: this.env._t('Error'),
                    body: this.env._t('It not possible with empty cart or Amount Total order smaller than or equal 0')
                })
            }
            if (!selectedOrder.get_client()) {
                this.showPopup('ConfirmPopup', {
                    title: this.env._t('Partial Order required Customer'),
                    body: this.env._t('Please set a Customer'),
                    disableCancelButton: true,
                })
                const {confirmed, payload: newClient} = await this.showTempScreen(
                    'ClientListScreen',
                    {client: null}
                );
                if (confirmed) {
                    selectedOrder.set_client(newClient);
                } else {
                    return this.showPopup('ErrorPopup', {
                        title: this.env._t('Error'),
                        body: this.env._t('Required set Customer for Partial Order')
                    })
                }
            }
            this.env.pos.automaticSetCoupon()
            let lists = this.env.pos.payment_methods.filter((p) => (p.journal && p.pos_method_type && p.pos_method_type == 'default') || (!p.journal && !p.pos_method_type)).map((p) => ({
                id: p.id,
                item: p,
                label: p.name
            }))
            let {confirmed, payload: paymentMethod} = await this.showPopup('SelectionPopup', {
                title: this.env._t('Partial Paid !!! Please Select one Payment Mode and Register one part Amount total of Order'),
                list: lists
            })
            if (confirmed) {
                let {confirmed, payload: number} = await this.showPopup('NumberPopup', {
                    title: this.env._t('Register Amount: Please input one part Amount of Amount Total Order'),
                    startingValue: 0
                })
                if (confirmed) {
                    number = parseFloat(number)
                    if (number <= 0 || number > selectedOrder.get_total_with_tax()) {
                        return this.showPopup('ErrorPopup', {
                            title: this.env._t('Error'),
                            body: this.env._t('Register Amount required bigger than 0 and smaller than total amount of Order')
                        })
                    }
                    let paymentLines = selectedOrder.paymentlines.models
                    paymentLines.forEach(function (p) {
                        selectedOrder.remove_paymentline(p)
                    })
                    selectedOrder.add_paymentline(paymentMethod);
                    let paymentline = selectedOrder.selected_paymentline;
                    paymentline.set_amount(number);
                    selectedOrder.trigger('change', selectedOrder);
                    let order_ids = this.env.pos.push_single_order(selectedOrder, {
                        draft: true
                    })
                    console.log('{ButtonPartialPayment.js} pushed succeed order_ids: ' + order_ids)
                    this.showScreen('ReceiptScreen');
                    this.showPopup('ConfirmPopup', {
                        title: this.env._t('Succeed !!!'),
                        body: this.env._t('Order save to Draft state, When customer full fill payment please register Payment for Order processing to Paid/Invoice state'),
                        disableCancelButton: true,
                    })
                }
            }
        }

        get nGuests() {
            const order = this.env.pos.get_order();
            return order ? order.get_customer_count() : 0;
        }

        async setGuests() {
            const {confirmed, payload: inputNumber} = await this.showPopup('NumberPopup', {
                startingValue: this.nGuests,
                cheap: true,
                title: this.env._t('Guests ?'),
            });

            if (confirmed) {
                this.env.pos.get_order().set_customer_count(parseInt(inputNumber, 10) || 1);
            }
        }

        async transferItemsToAnotherTable() {
            const order = this.env.pos.get_order();
            if (order.get_orderlines().length > 0) {
                this.showScreen('SplitBillScreen');
                this.showPopup('ConfirmPopup', {
                    title: this.env._t('Please select Minimum 1 Item'),
                    body: this.env._t('And click to button "Transfer to another Table"'),
                    disableCancelButton: true,
                })
            }
        }

        async lockTable() {
            const selectedOrder = this.env.pos.get_order()
            const orders = this.env.pos.get('orders').models;
            let {confirmed, payload: selection} = await this.showPopup('SelectionPopup', {
                title: this.env._t('Selection Lock Type'),
                list: [
                    {
                        label: this.env._t('Only lock selected Order'),
                        item: true,
                        id: 1,
                    },
                    {
                        label: this.env._t('Lock all Orders have Items in Cart'),
                        item: false,
                        id: 2,
                    }
                ],
            })
            if (confirmed) {
                if (selection) {
                    return selectedOrder.lock_order()
                } else {
                    for (let i = 0; i < orders.length; i++) {
                        orders[i].lock_order()
                    }
                }
            }
        }

        get orderWillProcessingToInvoice() {
            if (this.env.pos.get_order().is_to_invoice()) {
                return true
            } else {
                return false
            }
        }

        get orderToInvoiceString() {
            if (this.env.pos.get_order().is_to_invoice()) {
                return this.env._t('[On] To Invoice')
            } else {
                return this.env._t('[Off] To Invoice')
            }
        }

        async setOrderToInvoice() {
            const selectedOrder = this.env.pos.get_order();
            selectedOrder.set_to_invoice(!selectedOrder.is_to_invoice());
            if (selectedOrder.is_to_invoice() && !selectedOrder.get_client()) {
                const {confirmed, payload: newClient} = await this.showTempScreen(
                    'ClientListScreen',
                    {client: null}
                );
                if (confirmed) {
                    this.showPopup('ConfirmPopup', {
                        title: this.env._t('Alert, Order to Invoice required set Customer'),
                        disableCancelButton: true
                    })
                    return selectedOrder.set_client(newClient);
                } else {
                    return this.setOrderToInvoice()
                }
            }
            this.render()
        }

        async selectLoyaltyReward() {
            const selectedOrder = this.env.pos.get_order();
            var client = selectedOrder.get_client();
            if (!client) {
                const {confirmed, payload: newClient} = await this.env.pos.chrome.showTempScreen(
                    'ClientListScreen',
                    {client: null}
                );
                if (confirmed) {
                    selectedOrder.set_client(newClient);
                } else {
                    return this.showPopup('ErrorPopup', {
                        title: this.env._t('Error. Customer missed set to Order'),
                        body: this.env._t('Required select customer for checking customer points')
                    })
                }

            }
            const list = this.env.pos.rewards.map(reward => ({
                id: reward.id,
                label: reward.name,
                isSelected: false,
                item: reward
            }))
            let {confirmed, payload: reward} = await this.env.pos.chrome.showPopup('SelectionPopup', {
                title: this.env._t('Please select one Reward need apply to customer'),
                list: list,
            });
            if (confirmed) {
                selectedOrder.set_reward_program(reward)
            }
        }

        get currentPricelistName() {
            const order = this.env.pos.get_order();
            return order && order.pricelist
                ? order.pricelist.display_name
                : this.env._t('Pricelist');
        }

        async showReports() {
            let self = this;
            let list_report = [];
            if (this.env.pos.config.report_product_summary) {
                list_report.push({
                    'id': 1,
                    'name': 'Report Products Summary',
                    'item': 1
                })
            }
            if (this.env.pos.config.report_order_summary) {
                list_report.push({
                    'id': 2,
                    'name': 'Report Orders Summary',
                    'item': 2
                })
            }
            if (this.env.pos.config.report_payment_summary) {
                list_report.push({
                    'id': 3,
                    'name': 'Report Payment Summary',
                    'item': 3
                })
            }
            if (this.env.pos.config.report_sale_summary) {
                list_report.push({
                    'id': 4,
                    'name': 'Z-Report (Your Session Sale Summary)',
                    'item': 4
                })
            }
            list_report.push({
                'id': 5,
                'name': 'Sale Summary Detail of your Session',
                'item': 5
            })
            var to_date = new Date().toISOString().split('T')[0];
            var date = new Date();
            var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
            var from_date = firstDay.toISOString().split('T')[0];
            let {confirmed, payload: selectedReports} = await this.showPopup(
                'PopUpSelectionBox',
                {
                    title: this.env._t('Select the report'),
                    items: list_report,
                    onlySelectOne: true,
                }
            );
            if (confirmed && selectedReports['items'].length > 0) {
                const selectedReport = selectedReports['items'][0]
                if (selectedReport && selectedReport['id']) {
                    const report_id = selectedReport['id']
                    if (report_id == 1) {
                        let defaultProps = {
                            title: this.env._t('Products Summary Report'),
                            current_session_report: true,
                            from_date: from_date,
                            to_date: to_date,
                            report_product_summary_auto_check_product: this.env.pos.config.report_product_summary_auto_check_product,
                            report_product_summary_auto_check_category: this.env.pos.config.report_product_summary_auto_check_category,
                            report_product_summary_auto_check_location: this.env.pos.config.report_product_summary_auto_check_location,
                            report_product_summary_auto_check_payment: this.env.pos.config.report_product_summary_auto_check_payment,
                        }
                        let {confirmed, payload: result} = await this.showPopup('PopUpReportProductsSummary', defaultProps)
                        if (confirmed) {
                            this.buildProductsSummaryReport(result.values);
                        }
                    }
                    if (report_id == 2) {
                        let defaultProps = {
                            title: this.env._t('Orders Summary Report'),
                            current_session_report: true,
                            from_date: from_date,
                            to_date: to_date,
                            report_order_summary_auto_check_order: this.env.pos.config.report_order_summary_auto_check_order,
                            report_order_summary_auto_check_category: this.env.pos.config.report_order_summary_auto_check_category,
                            report_order_summary_auto_check_payment: this.env.pos.config.report_order_summary_auto_check_payment,
                            report_order_summary_default_state: this.env.pos.config.report_order_summary_default_state,
                        }
                        let {confirmed, payload: result} = await this.showPopup('PopUpReportsOrdersSummary', defaultProps)
                        if (confirmed) {
                            this.buildOrdersSummaryReport(result.values);
                        }
                    }
                    if (report_id == 3) {
                        let defaultProps = {
                            title: this.env._t('Payments Summary Report'),
                            current_session_report: true,
                            from_date: from_date,
                            to_date: to_date,
                            summary: 'sales_person',
                        }
                        let {confirmed, payload: result} = await this.showPopup('PopUpReportPaymentsSummary', defaultProps)
                        if (confirmed) {
                            this.buildPaymentsSummaryReport(result.values);
                        }

                    }
                    if (report_id == 4) {
                        let params = {
                            model: 'pos.session',
                            method: 'build_sessions_report',
                            args: [[this.env.pos.pos_session.id]],
                        };
                        let values = await this.rpc(params, {shadow: true}).then(function (values) {
                            return values
                        }, function (err) {
                            return self.env.pos.query_backend_fail(err);
                        })
                        let reportData = values[this.env.pos.pos_session.id];
                        let start_at = field_utils.parse.datetime(reportData.session.start_at);
                        start_at = field_utils.format.datetime(start_at);
                        reportData['start_at'] = start_at;
                        if (reportData['stop_at']) {
                            var stop_at = field_utils.parse.datetime(reportData.session.stop_at);
                            stop_at = field_utils.format.datetime(stop_at);
                            reportData['stop_at'] = stop_at;
                        }
                        let reportHtml = qweb.render('ReportSalesSummarySession', {
                            pos: this.env.pos,
                            report: reportData,
                        });
                        let reportXml = qweb.render('ReportSalesSummarySessionXml', {
                            pos: this.env.pos,
                            report: reportData,
                        });
                        this.showScreen('ReportScreen', {
                            report_html: reportHtml,
                            report_xml: reportXml
                        });
                    }
                    if (report_id == 5) {
                        let result = await this.rpc({
                            model: 'report.point_of_sale.report_saledetails',
                            method: 'get_sale_details',
                            args: [false, false, false, [this.env.pos.pos_session.id]],
                        }, {
                            shadow: true,
                            timeout: 65000
                        }).then(function (result) {
                            return result
                        }, function (err) {
                            return self.env.pos.query_backend_fail(err);
                        });
                        var env = {
                            company: this.env.pos.company,
                            pos: this.env.pos,
                            products: result.products,
                            payments: result.payments,
                            taxes: result.taxes,
                            total_paid: result.total_paid,
                            date: (new Date()).toLocaleString(),
                        };
                        let report_html = qweb.render('ReportSalesDetail', env);
                        let report_xml = qweb.render('ReportSalesDetailXml', env);
                        this.showScreen('ReportScreen', {
                            report_html: report_html,
                            report_xml: report_xml
                        });
                    }
                }
            }
        }

        async buildProductsSummaryReport(values) {
            var self = this;
            let summary = [];
            if (values['report_product_summary_auto_check_product']) {
                summary.push('product_summary')
            }
            if (values['report_product_summary_auto_check_category']) {
                summary.push('category_summary')
            }
            if (values['report_product_summary_auto_check_location']) {
                summary.push('location_summary')
            }
            if (values['report_product_summary_auto_check_payment']) {
                summary.push('payment_summary')
            }
            let val = null;
            if (values.current_session_report) {
                val = {
                    'from_date': null,
                    'to_date': null,
                    'summary': summary,
                    'session_id': this.env.pos.pos_session.id,
                };
            } else {
                if (!values.from_date || !values.to_date) {
                    return this.showPopup('ErrorPopup', {
                        title: this.env._t('Error'),
                        body: this.env._t('From or To Date is missed, required input')
                    })
                }
                val = {
                    'from_date': values.from_date,
                    'to_date': values.to_date,
                    'summary': summary
                };
            }
            let params = {
                model: 'pos.order',
                method: 'product_summary_report',
                args: [val],
            };
            let results = await this.rpc(params).then(function (result) {
                return result
            }, function (err) {
                self.env.pos.query_backend_fail(err);
                return false;
            })
            this.renderProductsSummaryReport(values, results)
        }

        renderProductsSummaryReport(values, results) {
            if (Object.keys(results['category_summary']).length == 0 && Object.keys(results['product_summary']).length == 0 &&
                Object.keys(results['location_summary']).length == 0 && Object.keys(results['payment_summary']).length == 0) {
                return this.showPopup('ErrorPopup', {
                    title: this.env._t('Warning'),
                    body: this.env._t('Data not found for report')
                })
            } else {
                var product_total_qty = 0.0;
                var category_total_qty = 0.0;
                var payment_summary_total = 0.0;
                if (results['product_summary']) {
                    _.each(results['product_summary'], function (value, key) {
                        product_total_qty += value.quantity;
                    });
                }
                if (results['category_summary']) {
                    _.each(results['category_summary'], function (value, key) {
                        category_total_qty += value;
                    });
                }
                if (results['payment_summary']) {
                    _.each(results['payment_summary'], function (value, key) {
                        payment_summary_total += value;
                    });
                }
                var product_summary;
                var category_summary;
                var payment_summary;
                var location_summary;
                if (Object.keys(results['product_summary']).length) {
                    product_summary = true;
                }
                if (Object.keys(results['category_summary']).length) {
                    category_summary = true;
                }
                if (Object.keys(results['payment_summary']).length) {
                    payment_summary = true;
                }
                if (Object.keys(results['location_summary']).length) {
                    location_summary = true;
                }
                var values = {
                    pos: this.env.pos,
                    from_date: values.from_date,
                    to_date: values.to_date,
                    product_total_qty: product_total_qty,
                    category_total_qty: category_total_qty,
                    payment_summary_total: payment_summary_total,
                    product_summary: product_summary,
                    category_summary: category_summary,
                    payment_summary: payment_summary,
                    location_summary: location_summary,
                    summary: results,
                };
                let report_html = qweb.render('ReportProductsSummary', values);
                let report_xml = qweb.render('ReportProductsSummaryXml', values);
                this.showScreen('ReportScreen', {
                    report_html: report_html,
                    report_xml: report_xml
                });
            }
        }

        async buildOrdersSummaryReport(values) {
            var self = this;
            let summary = [];
            if (values['report_order_summary_auto_check_order']) {
                summary.push('order_summary_report')
            }
            if (values['report_order_summary_auto_check_category']) {
                summary.push('category_summary_report')
            }
            if (values['report_order_summary_auto_check_payment']) {
                summary.push('payment_summary_report')
            }
            let val = null;
            if (values.current_session_report) {
                val = {
                    'from_date': null,
                    'to_date': null,
                    'summary': summary,
                    'session_id': this.env.pos.pos_session.id,
                    'state': values['report_order_summary_default_state']
                };
            } else {
                if (!values.from_date || !values.to_date) {
                    return this.showPopup('ErrorPopup', {
                        title: this.env._t('Error'),
                        body: this.env._t('From or To Date is missed, required input')
                    })
                }
                val = {
                    'from_date': values.from_date,
                    'to_date': values.to_date,
                    'state': values['report_order_summary_default_state'],
                    'summary': summary
                };
            }
            let params = {
                model: 'pos.order',
                method: 'order_summary_report',
                args: [val],
            };
            let results = await this.rpc(params).then(function (result) {
                return result
            }, function (err) {
                self.env.pos.query_backend_fail(err);
                return false;
            })
            this.renderOrdersSummaryReport(values, results)
        }

        renderOrdersSummaryReport(values, results) {
            var state = results['state'];
            if (results) {
                if (Object.keys(results['category_report']).length == 0 && Object.keys(results['order_report']).length == 0 &&
                    Object.keys(results['payment_report']).length == 0) {
                    return this.showPopup('ErrorPopup', {
                        title: this.env._t('Warning'),
                        body: this.env._t('Data not found for report')
                    })
                } else {
                    var category_report;
                    var order_report;
                    var payment_report;
                    if (Object.keys(results.order_report).length == 0) {
                        order_report = false;
                    } else {
                        order_report = results['order_report']
                    }
                    if (Object.keys(results.category_report).length == 0) {
                        category_report = false;
                    } else {
                        category_report = results['category_report']
                    }
                    if (Object.keys(results.payment_report).length == 0) {
                        payment_report = false;
                    } else {
                        payment_report = results['payment_report']
                    }
                    var values = {
                        pos: this.env.pos,
                        state: state,
                        from_date: values.from_date,
                        to_date: values.to_date,
                        order_report: order_report,
                        category_report: category_report,
                        payment_report: payment_report,
                    };
                    let report_html = qweb.render('ReportOrdersSummary', values);
                    let report_xml = qweb.render('ReportOrdersSummaryXml', values)
                    this.showScreen('ReportScreen', {
                        report_html: report_html,
                        report_xml: report_xml
                    });
                }
            }


        }

        async buildPaymentsSummaryReport(values) {
            var self = this;
            let summary = values.summary;
            let val = null;
            if (values.current_session_report) {
                val = {
                    'summary': summary,
                    'session_id': this.env.pos.pos_session.id,
                };
            } else {
                if (!values.from_date || !values.to_date) {
                    return this.showPopup('ErrorPopup', {
                        title: this.env._t('Error'),
                        body: this.env._t('From or To Date is missed, required input')
                    })
                }
                val = {
                    'from_date': values.from_date,
                    'to_date': values.to_date,
                    'summary': summary
                };
            }
            let params = {
                model: 'pos.order',
                method: 'payment_summary_report',
                args: [val],
            };
            let results = await this.rpc(params).then(function (result) {
                return result
            }, function (err) {
                self.env.pos.query_backend_fail(err);
                return false;
            })
            this.renderPaymentsSummaryReport(values, results)
        }

        renderPaymentsSummaryReport(values, results) {
            if (Object.keys(results['journal_details']).length == 0 && Object.keys(results['salesmen_details']).length == 0) {
                return this.showPopup('ErrorPopup', {
                    title: this.env._t('Warning'),
                    body: this.env._t('Data not found for report')
                })
            } else {
                var journal_key = Object.keys(results['journal_details']);
                if (journal_key.length > 0) {
                    var journal_details = results['journal_details'];
                } else {
                    var journal_details = false;
                }
                var sales_key = Object.keys(results['salesmen_details']);
                if (sales_key.length > 0) {
                    var salesmen_details = results['salesmen_details'];
                } else {
                    var salesmen_details = false;
                }
                var total = Object.keys(results['summary_data']);
                if (total.length > 0) {
                    var summary_data = results['summary_data'];
                } else {
                    var summary_data = false;
                }
                var values = {
                    from_date: values.from_date,
                    to_date: values.to_date,
                    pos: this.env.pos,
                    journal_details: journal_details,
                    salesmen_details: salesmen_details,
                    summary_data: summary_data
                };
                let report_html = qweb.render('ReportPaymentsSummary', values);
                let report_xml = qweb.render('ReportPaymentsSummaryXml', values)
                this.showScreen('ReportScreen', {
                    report_html: report_html,
                    report_xml: report_xml
                });
            }
        }

    }

    ListFeaturesButtons.template = 'ListFeaturesButtons';

    Registries.Component.add(ListFeaturesButtons);

    return ListFeaturesButtons;
});
