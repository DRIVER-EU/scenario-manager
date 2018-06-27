'use strict';

/**
 * Inject.js controller
 *
 * @description: A set of functions called "actions" for managing `Inject`.
 */

module.exports = {

  /**
   * Retrieve inject records.
   *
   * @return {Object|Array}
   */

  find: async (ctx) => {
    return strapi.services.inject.fetchAll(ctx.query);
  },

  /**
   * Retrieve a inject record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.inject.fetch(ctx.params);
  },

  /**
   * Create a/an inject record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.inject.add(ctx.request.body);
  },

  /**
   * Update a/an inject record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.inject.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an inject record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.inject.remove(ctx.params);
  }
};
