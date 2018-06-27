'use strict';

/**
 * Mediadata.js controller
 *
 * @description: A set of functions called "actions" for managing `Mediadata`.
 */

module.exports = {

  /**
   * Retrieve mediadata records.
   *
   * @return {Object|Array}
   */

  find: async (ctx) => {
    return strapi.services.mediadata.fetchAll(ctx.query);
  },

  /**
   * Retrieve a mediadata record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.mediadata.fetch(ctx.params);
  },

  /**
   * Create a/an mediadata record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.mediadata.add(ctx.request.body);
  },

  /**
   * Update a/an mediadata record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.mediadata.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an mediadata record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.mediadata.remove(ctx.params);
  }
};
