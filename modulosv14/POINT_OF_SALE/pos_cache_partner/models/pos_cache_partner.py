# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.
import base64
import json
from ast import literal_eval

from odoo import models, fields, api
from odoo.tools import date_utils


class pos_cache_partner(models.Model):
    _name = 'pos.cache.partner'
    _description = 'Point of Sale Cache Partner'

    cache = fields.Binary(attachment=True)
    partner_domain = fields.Text(required=True)
    partner_fields = fields.Text(required=True)

    config_id = fields.Many2one('pos.config', ondelete='cascade', required=True)
    compute_user_id = fields.Many2one('res.users', 'Cache compute user', required=True)

    @api.model
    def refresh_all_caches(self):
        self.env['pos.cache.partner'].search([]).refresh_cache()

    def refresh_cache(self):
        for cache in self:
            Partner = self.env['res.partner'].with_user(cache.compute_user_id.id)
            partners = Partner.search(cache.get_partner_domain())
            partner_ctx = partners.with_context()
            res = partner_ctx.read(cache.get_partner_fields())
            cache.write({
                'cache': base64.encodebytes(json.dumps(res, default=date_utils.json_default).encode('utf-8')),
            })

    @api.model
    def get_partner_domain(self):
        return literal_eval(self.partner_domain)

    @api.model
    def get_partner_fields(self):
        return literal_eval(self.partner_fields)

    def cache2json(self):
        return json.loads(base64.decodebytes(self.cache).decode('utf-8'))


class pos_config(models.Model):
    _inherit = 'pos.config'

    @api.depends('cache_partner_ids')
    def _get_oldest_cache_partner_time(self):
        for cache in self:
            pos_cache_partner = self.env['pos.cache.partner']
            oldest_cache_partner = pos_cache_partner.search([('config_id', '=', cache.id)], order='write_date', limit=1)
            cache.oldest_cache_partner_time = oldest_cache_partner.write_date

    cache_partner_ids = fields.One2many('pos.cache.partner', 'config_id')
    oldest_cache_partner_time = fields.Datetime(compute='_get_oldest_cache_partner_time', string='Oldest cache partner time', readonly=True)
    limit_partners_per_request = fields.Integer(compute='_compute_limit_partners_per_request')

    def _compute_limit_partners_per_request(self):
        limit = self.env['ir.config_parameter'].sudo().get_param('pos_cache_partner.limit_partners_per_request', 0)
        self.update({'limit_partners_per_request': int(limit)})

    def get_partners_from_cache(self, fields, domain):
        fields_str = str(fields)
        domain_str = str(domain)
        pos_cache_partner = self.env['pos.cache.partner']
        cache_partner_for_user = pos_cache_partner.search([
            ('id', 'in', self.cache_partner_ids.ids),
            ('compute_user_id', '=', self.env.uid),
            ('partner_domain', '=', domain_str),
            ('partner_fields', '=', fields_str),
        ])

        if not cache_partner_for_user:
            cache_partner_for_user = pos_cache_partner.create({
                'config_id': self.id,
                'partner_domain': domain_str,
                'partner_fields': fields_str,
                'compute_user_id': self.env.uid
            })
            cache_partner_for_user.refresh_cache()

        return cache_partner_for_user.cache2json()

    def delete_partner_cache(self):
        # throw away the old caches partners
        self.cache_partner_ids.unlink()