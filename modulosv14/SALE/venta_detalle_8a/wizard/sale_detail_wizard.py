
import time
from datetime import date, datetime
import pytz
import json
import datetime as dt
import io
from odoo import api, fields, models, _
from odoo.tools import date_utils
from odoo.exceptions import UserError
try:
    from odoo.tools.misc import xlsxwriter
except ImportError:
    import xlsxwriter


class SaleDetailWizard(models.TransientModel):
    _name = 'sale.detail.wizard'
    _description = 'Sale detail wizard'

    start_date = fields.Date('Fecha inicial')
    end_date = fields.Date('Fecha final', default=fields.Date.today)

    def action_get_sales(self):
        data = {
            'ids': self.ids,
            'model': self._name,
            'start_date': self.start_date,
            'end_date': self.end_date,

        }
        return {
            'type': 'ir.actions.report',
            'data': {'model': 'sale.detail.wizard',
                     'options': json.dumps(data, default=date_utils.json_default),
                     'output_format': 'xlsx',
                     'report_name': 'Venta detallada',
                     },
            'report_type': 'xlsx'
        }

    def get_lines(self, data):#, warehouse):
        lines = []
        query = """
        SET lc_time='es_ES.UTF-8';
            SELECT jou.name as "CV",
            par.name as "AGENTE",
            cli.city as "CIUDAD",
            cli.name as "CLIENTE",
            cat.complete_name as "CATEGORIA",
            bra.name as "MARCA",
            tem.name as "PRODUCTO",
            mov.name as "FOLIO",
            uni.name as "SUCURSAL",
            mov.date as "FECHA",
            to_char(mov.date,'TMMonth') as "MES",
            round(case mov.move_type when 'out_invoice' then lin.quantity else 0 end,0) as "VTA",
            round(case mov.move_type when 'out_refund' then lin.quantity else 0 end,0) as "DEV",
            case when cat.complete_name like '%ACUMULADORES%' or cat.complete_name like '%MOTOBATERIAS%' then (case when war.discount < 100 then war.qty else 0 end) else 0 end as "AJU",
            case when cat.complete_name like '%ACUMULADORES%' or cat.complete_name like '%MOTOBATERIAS%' then (case when war.discount = 100 then war.qty else 0 end) else 0 end as "GAR",
            case mov.move_type when 'out_invoice' then lin.quantity else 0 end
            - case mov.move_type when 'out_refund' then lin.quantity else 0 end
            - case when cat.complete_name like '%ACUMULADORES%' or cat.complete_name like '%MOTOBATERIAS%' then (case when war.discount < 100 then war.qty else 0 end) else 0 end
            - case when cat.complete_name like '%ACUMULADORES%' or cat.complete_name like '%MOTOBATERIAS%' then (case when war.discount = 100 then war.qty else 0 end) else 0 end as "NETA",
            round(case mov.move_type when 'out_invoice' then (lin.quantity * lin.price_unit) else 0 end,2) as "VTAT",
            round(case mov.move_type when 'out_refund' then (lin.quantity * lin.price_unit) else 0 end,2) as "DEVT",
            round(case when cat.complete_name like '%ACUMULADORES%' or cat.complete_name like '%MOTOBATERIAS%' then (case when war.discount < 100 then (war.qty * war.price_unit) - war.price_subtotal else 0 end) else 0 end,2) as "AJUT",
            round(case when cat.complete_name like '%ACUMULADORES%' or cat.complete_name like '%MOTOBATERIAS%' then (case when war.discount = 100 then (war.qty * war.price_unit) - war.price_subtotal else 0 end) else 0 end,2) as "GART",
            round((lin.quantity * lin.price_unit) - lin.price_subtotal,2) as "DESCT",
            lin.discount as "%",
            round(case when move_type = 'out_invoice' then lin.price_subtotal else - lin.price_subtotal end,2) as "NETAT"
            from account_move as mov
            inner join account_journal as jou on mov.journal_id = jou.id
            left outer join res_users as use on mov.invoice_user_id = use.id
            left outer join res_partner as par on use.partner_id = par.id
            left outer join res_partner as cli  on mov.partner_id = cli.id
            inner join account_move_line as lin on mov.id = lin.move_id
            inner join product_product as pro on lin.product_id = pro.id
            inner join product_template as tem on pro.product_tmpl_id = tem.id
            left outer join product_category as cat on tem.categ_id = cat.id
            left outer join product_brand as bra on tem.product_brand_id = bra.id
            left outer join operating_unit as uni on mov.operating_unit_id = uni.id
            left outer join (select poso.account_move,
                                round(poli.qty,0) as qty,
                                poli.price_unit,
                                poli.discount,
                                poli.price_subtotal
                                --cat.complete_name
                            from pos_order as poso
                                inner join pos_order_line as poli on poso.id = poli.order_id
                                inner join product_product as pro on poli.product_id = pro.id
                                inner join product_template as tem on pro.product_tmpl_id = tem.id
                                inner join product_category as cat on tem.categ_id = cat.id
                            where poli.discount > 0 
                                and poli.name not like '%REEMBOLSO'
                                and (cat.complete_name like '%ACUMULADORES%' or cat.complete_name like '%MOTOBATERIAS%')) as war on mov.id = war.account_move
            where mov.move_type in('out_invoice', 'out_refund') 
            and mov.state = 'posted'
            and lin.exclude_from_invoice_tab = 'false'
            order by mov.id, lin.id"""
            #AND mov.date BETWEEN %s AND %s
            
        #'2021-09-01' and '2021-10-31'
        #params = '%ACUMULADORES%','%MOTOBATERIAS%','%ACUMULADORES%','%MOTOBATERIAS%','%ACUMULADORES%','%MOTOBATERIAS%','%ACUMULADORES%','%MOTOBATERIAS%','%ACUMULADORES%','%MOTOBATERIAS%','%ACUMULADORES%','%MOTOBATERIAS%','%ACUMULADORES%','%MOTOBATERIAS%',self.start_date,self.end_date

        params = data.get('start_date'), data.get('end_date')
        #params.append(data.get('start_date'))
        #params.append(data.get('end_date'))
        print(params)
        #params = tuple(params)
        #print(params)
        
        self._cr.execute(query)#, params)
        query_obj = self._cr.dictfetchall()
        
        for obj in query_obj:
            vals = {
                'cv':  obj['CV'],
                'agente': obj['AGENTE'],
                'ciudad': obj['CIUDAD'],
                'cliente': obj['CLIENTE'],
                'categoria': obj['CATEGORIA'],
                'marca': obj['MARCA'],
                'producto': obj['PRODUCTO'],
                'folio': obj['FOLIO'],
                'sucursal': obj['SUCURSAL'],
                'fecha': obj['FECHA'],
                'mes': obj['MES'],
                'vta': obj['VTA'],
                'dev': obj['DEV'],
                'aju': obj['AJU'],
                'gar': obj['GAR'],
                'neta': obj['NETA'],
                'vtat': obj['VTAT'],
                'devt': obj['DEVT'],
                'ajut': obj['AJUT'],
                'gart': obj['GART'],
                'desct': obj['DESCT'],
                'netat': obj['NETAT'],
            }
            lines.append(vals)
        return lines

    def get_xlsx_report(self, data, response):
        output = io.BytesIO()
        workbook = xlsxwriter.Workbook(output, {'in_memory': True})
        lines = self.browse(data['ids'])
        comp = self.env.user.company_id.name
        sheet = workbook.add_worksheet('Stock Info')
        format0 = workbook.add_format({'font_size': 20, 'align': 'center', 'bold': True})
        format1 = workbook.add_format({'font_size': 14, 'align': 'vcenter', 'bold': True})
        format11 = workbook.add_format({'font_size': 12, 'align': 'center', 'bold': True})
        format21 = workbook.add_format({'font_size': 10, 'align': 'center', 'bold': True, 'color': 'blue'})
        format22 = workbook.add_format({'font_size': 10, 'align': 'center', 'bold': True})
        format3 = workbook.add_format({'bottom': True, 'top': True, 'font_size': 12})
        format4 = workbook.add_format({'font_size': 12, 'align': 'left', 'bold': True})
        font_size_8 = workbook.add_format({'font_size': 8, 'align': 'center'})
        font_size_8_l = workbook.add_format({'font_size': 8, 'align': 'left'})
        font_size_8_r = workbook.add_format({'font_size': 8, 'align': 'right'})
        red_mark = workbook.add_format({'font_size': 8, 'bg_color': 'red'})
        justify = workbook.add_format({'font_size': 12})
        format3.set_align('center')
        justify.set_align('justify')
        format1.set_align('center')
        red_mark.set_align('center')
        print(data)
        sheet.merge_range(1, 7, 2, 11, 'VENTAS DETALLADAS', format0)
        sheet.merge_range(3, 7, 3, 9, 'Fecha inicio', format22)
        sheet.merge_range(3, 10, 3, 11, data.get('start_date'), format22)
        sheet.merge_range(4, 7, 4, 9, 'Fecha fin', format22)
        sheet.merge_range(4, 10, 4, 11, data.get('end_date'), format22)
        w_house = ', '
        cat = ', '
        c = []

        user = self.env['res.users'].browse(self.env.uid)
        tz = pytz.timezone(user.tz if user.tz else 'UTC')
        times = pytz.utc.localize(datetime.now()).astimezone(tz)
        
        w_col_no = 6
        w_col_no1 = 7
        sheet.merge_range(6, 0, 6, 1, 'C.V.', format21)
        sheet.merge_range(6, 2, 6, 3, 'Agente', format21)
        sheet.merge_range(6, 4, 6, 5, 'Ciudad', format21)
        sheet.merge_range(6, 6, 6, 11, 'Cliente', format21)
        sheet.merge_range(6, 12, 6, 15, 'Categoría', format21)
        sheet.merge_range(6, 16, 6, 17, 'Marca', format21)
        sheet.merge_range(6, 18, 6, 20, 'Producto', format21)
        sheet.merge_range(6, 21, 6, 22, 'Folío', format21)
        sheet.write(6, 23, 'Sucursal', format21)
        sheet.write(6, 24, 'Fecha', format21)
        sheet.write(6, 25, 'Mes', format21)
        sheet.write(6, 26, 'Vta', format21)
        sheet.write(6, 27, 'Dev', format21)
        sheet.write(6, 28, 'Gar', format21)
        sheet.write(6, 29, 'Neta', format21)
        sheet.write(6, 30, '$ Vta', format21)
        sheet.write(6, 31, '$ Dev', format21)
        sheet.write(6, 32, '$ Aju', format21)
        sheet.write(6, 33, '$ Gar', format21)
        sheet.write(6, 34, '$ Desc', format21)
        sheet.write(6, 35, '%', format21)
        sheet.write(6, 36, '$ Neta', format21)

        get_line = self.get_lines(data)
        
        prod_row = 7
        prod_col = 0
        for each in get_line:
            if datetime.strptime(str(each['fecha']), '%Y-%m-%d') >= datetime.strptime(data.get('start_date'), '%Y-%m-%d') and datetime.strptime(str(each['fecha']), '%Y-%m-%d') <= datetime.strptime(data.get('end_date'), '%Y-%m-%d'):
                sheet.merge_range(prod_row, prod_col, prod_row, prod_col+1, each['cv'], font_size_8_l)
                sheet.merge_range(prod_row, prod_col+2, prod_row, prod_col+3, each['agente'], font_size_8_l)
                sheet.merge_range(prod_row, prod_col+4, prod_row, prod_col+5, each['ciudad'], font_size_8_l)
                sheet.merge_range(prod_row, prod_col+6, prod_row, prod_col+11, each['cliente'], font_size_8_l)
                sheet.merge_range(prod_row, prod_col+12, prod_row, prod_col+15, each['categoria'], font_size_8_l)
                sheet.merge_range(prod_row, prod_col+16, prod_row, prod_col+17, each['marca'], font_size_8_l)
                sheet.merge_range(prod_row, prod_col+18, prod_row, prod_col+20, each['producto'], font_size_8_l)
                sheet.merge_range(prod_row, prod_col+21, prod_row, prod_col+22, each['folio'], font_size_8_l)
                sheet.write(prod_row, prod_col+23, each['sucursal'], font_size_8_l)
                sheet.write(prod_row, prod_col+24, each['fecha'], font_size_8_l)
                sheet.write(prod_row, prod_col+25, each['mes'], font_size_8_l)
                sheet.write(prod_row, prod_col+26, each['vta'], font_size_8)
                sheet.write(prod_row, prod_col+27, each['dev'], font_size_8)
                sheet.write(prod_row, prod_col+28, each['aju'], font_size_8)
                sheet.write(prod_row, prod_col+29, each['gar'], font_size_8)
                sheet.write(prod_row, prod_col+30, each['neta'], font_size_8)
                sheet.write(prod_row, prod_col+31, each['vtat'], font_size_8)
                sheet.write(prod_row, prod_col+32, each['devt'], font_size_8)
                sheet.write(prod_row, prod_col+33, each['ajut'], font_size_8)
                sheet.write(prod_row, prod_col+34, each['gart'], font_size_8)
                sheet.write(prod_row, prod_col+35, each['desct'], font_size_8)
                sheet.write(prod_row, prod_col+36, each['netat'], font_size_8)
                prod_row += 1
        
        workbook.close()
        output.seek(0)
        response.stream.write(output.read())
        output.close()
