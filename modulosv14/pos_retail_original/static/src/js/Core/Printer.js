odoo.define('pos_retail.Printer', function (require) {
    const  Printer = require('point_of_sale.Printer');
    const  core = require('web.core');
    const  _t = core._t;

    Printer.Printer.include({
        _onIoTActionResult: function (data) {
            try {
                this._super(data)
            } catch (e) {
                return this.pos.chrome.showPopup('ErrorPopup', {
                    title: _t('Error'),
                    body: _t('Your POS connection lose to Kitchen Printer, please your pos profile or your internet connection')
                })
            }
        },
        print_receipt: async function (receipt) { // TODO: if proxy_id is added, it meaning posbox installed else it meaning iotbox
            // kimanh: normal original pos if can not connect printer, can not send order
            // we need force it for use kitchen screen
            if (receipt) {
                console.log('[print_receipt]: ' + receipt)
            } else {
                return this._super(receipt)
            }
            let response = this.printResultGenerator.Successful()
            if (!this.pos.config.iface_printer_id && this.pos.config.proxy_ip && this.pos.config.iface_print_via_proxy && receipt) {
                if (this.pos.config.duplicate_receipt && this.pos.config.duplicate_number > 1) {
                    for (let i = 0; i < this.pos.config.duplicate_number; i++) {
                        this.print_direct_receipt(receipt);
                    }
                } else {
                    this.print_direct_receipt(receipt);
                }
                console.log('[print_receipt] print_direct_receipt')
                return response
            }
            if (this.pos.config.duplicate_receipt && this.pos.config.duplicate_number > 1) {
                for (let i = 0; i < this.pos.config.duplicate_number; i++) {
                    if (receipt) {
                        this.receipt_queue.push(receipt);
                    }
                    let image, sendPrintResult;
                    while (this.receipt_queue.length > 0) {
                        try {
                            receipt = this.receipt_queue.shift();
                            image = await this.htmlToImg(receipt);
                            sendPrintResult = await this.send_printing_job(image);
                        } catch (error) {
                            // Error in communicating to the IoT box.
                            this.receipt_queue.length = 0;
                            response = this.printResultGenerator.IoTActionError();
                            console.warn(response)
                        }
                        // rpc call is okay but printing failed because
                        // IoT box can't find a printer.
                        if (!sendPrintResult || (sendPrintResult && !sendPrintResult.result)) {
                            this.receipt_queue.length = 0;
                            response = this.printResultGenerator.IoTResultError();
                            console.warn(response)
                        }
                    }
                }
                console.log('[print_receipt] duplicate_receipt')
                return response
            } else {
                let coreResponse = await this._super(receipt)
                if (coreResponse && !coreResponse['successful'] && coreResponse['message']) {
                    this.pos.chrome.showPopup('ErrorPopup', coreResponse['message'])
                }
                return response;
            }
        },
        async print_direct_receipt(receipt) {
            this.pos.set('printer.status', {'state': 'connecting', 'pending': 'Print via POSBOX'});
            await this.connection.rpc('/hw_proxy/print_xml_receipt', {
                receipt: receipt,
            });
            this.pos.set('printer.status', {'state': 'connected', 'pending': 'Printed'});
        },
        open_cashbox: function () {
            if (this.pos.config.proxy_ip) {
                return this.connection.rpc('/hw_proxy/open_cashbox', {}).then(function (result) {
                    console.log('POS Box 17 open cashbox');
                })
            } else {
                this._super();
            }
        },
        // TODO: fixed loading times send img to printer, and running background
        send_printing_job: function (img) {
            if (this.pos.config.proxy_ip) {
                return false
            } else {
                return this.connection.rpc('/hw_proxy/default_printer_action', {
                    data: {
                        action: 'print_receipt',
                        receipt: img,
                    }
                }, {shadow: true, timeout: 1500});
            }
        },
    });

})
