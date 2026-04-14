# -*- coding: utf-8 -*-

{
    'name': 'Point of Sale Farmacias Lupita',
    'version': '1.0',
    'category': 'Sales/Point of Sale',
    'sequence': 6,
    'summary': 'Custom for Farmacias Lupita ',
    'description': """

This module is Custom for Farmacias Lupita.

""",
    'depends': [
        "base",
        "pos_hr",
        "point_of_sale",
        "web",
        # "pos_discount",
        # "product",
        # "purchase"
    ],
    'data': [
        "import_libraries.xml",
        # "security/ir.model.access.csv",
        "views/PosConfig.xml",
        "views/ResUsers.xml",
        "views/ResPartner.xml",
        "views/Menu.xml",
        # "views/ProductTemplate.xml",
        # "views/PosOrder.xml",
        # "views/PosPaymentMethod.xml",
        # "views/PosPayment.xml",
        # "views/AccountPayment.xml",
        # "views/PosGlobalDiscount.xml",
        # "views/PurchaseOrder.xml",
    ],
    'qweb': [
        "static/src/xml/Screens/DoctorButtonWidget.xml",
        # "static/src/xml/Popups/EditListInput.xml",
        "static/src/xml/Screens/DoctorListScreen.xml",
        "static/src/xml/Screens/DoctorDetailsEdit.xml",
        "static/src/xml/Screens/DoctorLine.xml",
        "static/src/xml/Screens/OrderLine.xml"
        # "static/src/xml/Popups/*.xml",
        # "static/src/xml/Screens/ProductScreen/ControlButtons/*.xml",
        # "static/src/xml/Screens/ProductScreen/Cart/*.xml",
        # "static/src/xml/Screens/ProductScreen/*.xml",
        # "static/src/xml/Screens/Receipt/*.xml",
        # "static/src/xml/Screens/PosOrder/*.xml",
        # "static/src/xml/Screens/Payment/*.xml",
        # "static/src/xml/Screens/Reports/*.xml",
    ],
    'installable': True,
}
