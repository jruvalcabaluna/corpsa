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
# You should have received a copy of the License along with this program.
# If not, see <https://store.webkul.com/license.html/>
#################################################################################
{
  "name"                 :  "Website Product Size Chart",
  "summary"              :  "You can now add a size chart about your products on Odoo website. The customers can compare the size chart and buy the products accordingly.",
  "category"             :  "Website",
  "version"              :  "1.0.0",
  "sequence"             :  1,
  "author"               :  "Webkul Software Pvt. Ltd.",
  "license"              :  "Other proprietary",
  "maintainer"           :  "Prakash Kumar",
  "website"              :  "https://store.webkul.com/Odoo-Website-Product-Size-Chart.html",
  "description"          :  """Odoo Website Product Size Chart
Add size chart to products
Size chart on website
Product size graph on website
Size chart for Odoo website
Odoo Product size guide""",
  "live_test_url"        :  "http://odoodemo.webkul.com/?module=website_product_size_chart",
  "depends"              :  ['website_sale'],
  "data"                 :  [
                             'views/template.xml',
                             'views/website_product_size_chart.xml',
                             'data/data.xml',
                             'security/ir.model.access.csv',
                            ],
  "images"               :  ['static/description/Banner.png'],
  "application"          :  True,
  "installable"          :  True,
  "price"                :  49,
  "currency"             :  "EUR",
  # "pre_init_hook"        :  "pre_init_check",
}