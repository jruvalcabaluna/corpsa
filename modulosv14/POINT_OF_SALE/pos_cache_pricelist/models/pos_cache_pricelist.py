# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.
import base64
import json
from ast import literal_eval

from odoo import models, fields, api
from odoo.tools import date_utils

class pos_cache_pricelist(models.Model):
    _name = 'pos.cache.pricelist'
    _description = 'Point of Sale Cache Pricelist'

    cache = fields.Binary(attachment=True)
    pricelist_domain = fields.Text(required=True)
    pricelist_fields = fields.Text(required=True)
    config_id = fields.Many2one('pos.config', ondelete='cascade', required=True)
    compute_user_id = fields.Many2one('res.users', 'Cache Pricelist compute user', required=True)

    @api.model
    def refresh_all_caches(self):
        self.env['pos.cache.pricelist'].search([]).refresh_cache()

    def refresh_cache(self):
        for cache in self:
            Pricelist = self.env['product.pricelist'].with_user(cache.compute_user_id.id)
            pricelists = Pricelist.search(cache.get_pricelist_domain())
            pricelist_ctx = pricelists.with_context()
            res = pricelist_ctx.read(cache.get_pricelist_fields())
            cache.write({
                'cache': base64.encodebytes(json.dumps(res, default=date_utils.json_default).encode('utf-8')),
            })

    @api.model
    def get_pricelist_domain(self):
        return literal_eval(self.pricelist_domain)

    @api.model
    def get_pricelist_fields(self):
        return literal_eval(self.pricelist_fields)

    def cache2json(self):
        return json.loads(base64.decodebytes(self.cache).decode('utf-8'))

class pos_cache_pricelist_item(models.Model):
    _name = 'pos.cache.pricelist.item'
    _description = 'Point of Sale Cache Pricelist Item'

    cache = fields.Binary(attachment=True)
    pricelist_item_domain = fields.Text(required=True)
    pricelist_item_fields = fields.Text(required=True)
    config_id = fields.Many2one('pos.config', ondelete='cascade', required=True)
    compute_user_id = fields.Many2one('res.users', 'Cache Pricelist compute user', required=True)

    @api.model
    def refresh_all_caches(self):
        self.env['pos.cache.pricelist.item'].search([]).refresh_cache()

    def refresh_cache(self):
        for cache in self:
            PricelistItem = self.env['product.pricelist.item'].with_user(cache.compute_user_id.id)
            pricelistitems = PricelistItem.search(cache.get_pricelist_item_domain())
            pricelistitem_ctx = pricelistitems.with_context()
            res = pricelistitem_ctx.read(cache.get_pricelist_item_fields())
            cache.write({
                'cache': base64.encodebytes(json.dumps(res, default=date_utils.json_default).encode('utf-8')),
            })

    @api.model
    def get_pricelist_item_domain(self):
        return literal_eval(self.pricelist_item_domain)

    @api.model
    def get_pricelist_item_fields(self):
        return literal_eval(self.pricelist_item_fields)

    def cache2json(self):
        return json.loads(base64.decodebytes(self.cache).decode('utf-8'))

class pos_config(models.Model):
    _inherit = 'pos.config'

# pos_cache_pricelist
    @api.depends('cache_pricelist_ids')
    def _get_oldest_cache_pricelist_time(self):
        for cache in self:
            pos_cache_pricelist = self.env['pos.cache.pricelist']
            oldest_cache_pricelist = pos_cache_pricelist.search([('config_id', '=', cache.id)], order='write_date', limit=1)
            cache.oldest_cache_pricelist_time = oldest_cache_pricelist.write_date

    cache_pricelist_ids = fields.One2many('pos.cache.pricelist', 'config_id')
    oldest_cache_pricelist_time = fields.Datetime(compute='_get_oldest_cache_pricelist_time', string='Oldest cache pricelist time', readonly=True)
    limit_pricelists_per_request = fields.Integer(compute='_compute_limit_pricelists_per_request')

    def _compute_limit_pricelists_per_request(self):
        limit = self.env['ir.config_parameter'].sudo().get_param('pos_cache_pricelist.limit_pricelists_per_request', 0)
        self.update({'limit_pricelists_per_request': int(limit)})

    def get_pricelists_from_cache(self, fields, domain):
        fields_str = str(fields)
        domain_str = str(domain)
        pos_cache_pricelist = self.env['pos.cache.pricelist']
        cache_pricelist_for_user = pos_cache_pricelist.search([
            ('id', 'in', self.cache_pricelist_ids.ids),
            ('compute_user_id', '=', self.env.uid),
            ('pricelist_domain', '=', domain_str),
            ('pricelist_fields', '=', fields_str),
        ])
        if not cache_pricelist_for_user:
            cache_pricelist_for_user = pos_cache_pricelist.create({
                'config_id': self.id,
                'pricelist_domain': domain_str,
                'pricelist_fields': fields_str,
                'compute_user_id': self.env.uid
            })
            cache_pricelist_for_user.refresh_cache()
        return cache_pricelist_for_user.cache2json()

    def delete_cache_pricelist(self):
        # throw away the old caches pricelists
        self.cache_pricelist_ids.unlink()

# pos_cache_pricelist_item
    @api.depends('cache_pricelist_item_ids')
    def _get_oldest_cache_pricelist_item_time(self):
        for cache in self:
            pos_cache_pricelist_item = self.env['pos.cache.pricelist.item']
            oldest_cache_pricelist_item = pos_cache_pricelist_item.search([('config_id', '=', cache.id)], order='write_date', limit=1)
            cache.oldest_cache_pricelist_item_time = oldest_cache_pricelist_item.write_date

    cache_pricelist_item_ids = fields.One2many('pos.cache.pricelist.item', 'config_id')
    oldest_cache_pricelist_item_time = fields.Datetime(compute='_get_oldest_cache_pricelist_item_time', string='Oldest cache pricelist item time', readonly=True)
    limit_pricelist_items_per_request = fields.Integer(compute='_compute_limit_pricelist_items_per_request')

    def _compute_limit_pricelist_items_per_request(self):
        limit = self.env['ir.config_parameter'].sudo().get_param('pos_cache_pricelist.limit_pricelist_items_per_request', 0)
        self.update({'limit_pricelist_items_per_request': int(limit)})

    def get_pricelist_items_from_cache(self, fields, domain):
        fields_str = str(fields)
        domain_str = str(domain)
        pos_cache_pricelist_item = self.env['pos.cache.pricelist.item']
        cache_pricelist_item_for_user = pos_cache_pricelist_item.search([
            ('id', 'in', self.cache_pricelist_item_ids.ids),
            ('compute_user_id', '=', self.env.uid),
            ('pricelist_item_domain', '=', domain_str),
            ('pricelist_item_fields', '=', fields_str),
        ])
        print('cache_pricelist_item_for_user',cache_pricelist_item_for_user)
        if not cache_pricelist_item_for_user:
            print('enter to IF NOT cache_pricelist_item_for_user', cache_pricelist_item_for_user)
            cache_pricelist_item_for_user = pos_cache_pricelist_item.create({
                'config_id': self.id,
                'pricelist_item_domain': domain_str,
                'pricelist_item_fields': fields_str,
                'compute_user_id': self.env.uid
            })
            cache_pricelist_item_for_user.refresh_cache()
        return cache_pricelist_item_for_user.cache2json()

    def delete_cache_pricelist_item(self):
        # throw away the old caches pricelist items
        self.cache_pricelist_item_ids.unlink()