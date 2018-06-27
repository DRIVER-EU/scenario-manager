'use strict';

/**
 * Mediaitem.js controller
 *
 * @description: A set of functions called "actions" for managing `Mediaitem`.
 */

module.exports = {

  /**
   * Retrieve mediaitem records.
   *
   * @return {Object|Array}
   */

  find: async (ctx) => {
    return strapi.services.mediaitem.fetchAll(ctx.query);
  },

  /**
   * Retrieve a mediaitem record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.mediaitem.fetch(ctx.params);
  },

  /**
   * Create a/an mediaitem record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.mediaitem.add(ctx.request.body);
  },

  /**
   * Update a/an mediaitem record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.mediaitem.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an mediaitem record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.mediaitem.remove(ctx.params);
  }
};
