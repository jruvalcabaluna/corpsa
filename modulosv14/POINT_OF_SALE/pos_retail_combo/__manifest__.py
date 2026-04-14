# -*- coding: utf-8 -*
{
    "name": "POS Combo",
    "version": "1.0",
    "category": "Point of Sale",
    "summary":
        """
        Pos Combo
        """,
    "description":
        """
        Pos Combo
        """,
    "sequence": 0,
    "depends": [
        "point_of_sale",
        # "sale_stock",
        # "account",
        # "sale_management",
        # "hr",
        # "bus",
        # "stock_account",
        # "purchase",
        "product",
        # "product_expiry",
        # "pos_restaurant",
        # "pos_discount",
        # "pos_hr",
        # "mail",
        # "mail_bot",
        # "im_livechat",
        # "mrp",
        # "base_geolocalize",
        # "sale_coupon",
        # "product_expiry"
    ],
    "data": [
        "import_libraries.xml",
        "security/ir.model.access.csv",
        "views/Menu.xml",
        "views/ProductTemplate.xml",
        "views/PosComboItem.xml",
    ],
    "qweb": [
        "static/src/xml/Popups/*.xml",
        "static/src/xml/Screens/ProductScreen/Cart/*.xml",
        "static/src/xml/Screens/ProductScreen/ControlButtons/*.xml",
        "static/src/xml/Screens/Receipt/*.xml",
        "static/src/xml/Screens/ProductScreen/*.xml",
    ],
    "installable": True,
    "auto_install": False,
    "application": True,
    "images": ["static/description/icon.png"],
}