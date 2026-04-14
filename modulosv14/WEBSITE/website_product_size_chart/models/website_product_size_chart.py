# -*- coding: utf-8 -*-
#################################################################################
# Author      : Webkul Software Pvt. Ltd. (<https://webkul.com/>)
# Copyright(c): 2015-Present Webkul Software Pvt. Ltd.
# All Rights Reserved.
#
#
#
# This program is copyright property of the author mentioned above.
# You can`t redistribute it and/or modify it.
#
#
# License URL : <https://store.webkul.com/license.html/>
#################################################################################
from odoo import models, fields, api, _
from odoo.exceptions import  ValidationError
import logging
_logger = logging.getLogger(__name__)

class WebsiteSizeChart(models.Model):
	_name='website.size.chart'

	@api.onchange('row','col')
	def update_chart_template(self):
		data="""<table class="table">"""
		for r in range(self.row):
			if r in [0,1]:data+='<thead>\n' if r==0 else'<tbody>\n'
			data+="<tr>"
			for c in range(self.col):
				if r==0:data+='<th>header{num}</th>'.format(num=c)
				else:data+='<td>row{num}</td>'.format(num=c)
			data+="</tr>\n"
			if r in [0,self.row-1]:data+='</thead>\n' if r==0 else'</tbody>\n'
		data+='</table>'
		self.chart_info =data

	@api.constrains('product_tmpl_ids')
	def _check_product(self):
		size_list=self.search([('product_tmpl_ids',"in",self.product_tmpl_ids.ids)])
		for _list in size_list:
			if self.id!=_list.id:raise ValidationError('Only One Chart Can Be Used For One Product')

	name =fields.Char(
		string='Template Title',
		required=True
	)
	image = fields.Binary(
		string='Chart Image'
	)
	row = fields.Integer(
		string='Row',
		required=True,
		default=6
	)
	col = fields.Integer(
		string='Column',
		required=True,
		default=2
	)
	chart_info = fields.Html(
		string='Template Content',
		required=True,
		translate=True
	)
	measure_info = fields.Html(
		string='How To Measure',
		translate=True
	)
	product_tmpl_ids =fields.Many2many(
		comodel_name ='product.template',
		string= 'Product',
		relation ="wk_websitesizechart_wk_producttemplate_relation",
		column1 = "wk_websitesizechart", column2 ="wk_producttemplate_relation"
	)
	link_text = fields.Char(
		string='Link Text',
		default='Size Guide',
		required=True,
		translate=True
	)
	display_as = fields.Selection(
		selection=[('link','Link'),('btn','Button')],
		string='Display AS',
		default='link'
	)

	@api.constrains('row','col')
	def _check_by_row_col(self):
		if self.filtered(lambda rec: rec.row <=0 or rec.col<=0):
			raise ValidationError("Row and Column should be positive integer !")

class ProductTemplate(models.Model):
	_inherit='product.template'

	def _get_size_chart(self):
		chart=self.env['website.size.chart'].search([('product_tmpl_ids','in',[self.id])],limit=1)
		if chart:self.size_chart=chart.id

	def _set_size_chart(self):
		Prev_chart =self.env['website.size.chart'].search([('product_tmpl_ids','in',[self.id])],limit=1)
		Prev_chart.write({'product_tmpl_ids':[(3,self.id)]})
		new_chart =self.env['website.size.chart'].browse(self.size_chart.id)
		new_chart.write({'product_tmpl_ids':[(4,self.id)]})

	size_chart = fields.Many2one(
		comodel_name='website.size.chart',
		compute='_get_size_chart',
		inverse='_set_size_chart'
	)
