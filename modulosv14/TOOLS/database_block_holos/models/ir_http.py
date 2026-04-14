
from odoo import SUPERUSER_ID, models


class IrHttp(models.AbstractModel):

    _inherit = "ir.http"

    def session_info(self):
        res = super(IrHttp, self).session_info()

        # res["database_block_message"] = '<h4>Esta base de datos sera bloqueada el 19 Octubre 2022 12:00:00 hrs</h4>' \
        #                                 '<h5>Su cuenta tiene un saldo pendiente.</h5>' \
        #                                 '<h6>Este servicio sera reactivado automáticamente al realizar su pago!</h6>' \
        #                                 'Si tiene alguna duda contacte a su partner/distribuidor.' \

        # res["database_block_message"] = '<h2>Esta base de datos ha sido bloqueada</h2> \n' \
        #                                 'Contacte a su partner/distribuidor.'

        # res["database_block_is_warning"] = True
        # res["database_block_is_warning"] = False

        return res
