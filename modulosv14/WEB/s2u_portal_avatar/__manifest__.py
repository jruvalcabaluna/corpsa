{
    'name': 'Portal Avatar',
    'version': '14.0.1.0',
    'images': ['static/description/app_logo.jpg'],
    'license': 'OPL-1',
    'category':  'Website',
    'summary': 'This module allows portal user to add/change/delete his avatar (profile picture).',
    'description':
        """This module allows portal user to add/change/delete his avatar (profile picture).
        """,
    'depends': ['base', 'portal'],
    'data': [
        'views/ir_qweb_widget_templates.xml',
        'views/portal_templates.xml',
    ],
    'qweb': [
    ],
    'installable': True,
    'auto_install': False,
}
