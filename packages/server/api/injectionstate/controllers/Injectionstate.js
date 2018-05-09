'use strict';

/**
 * Injectionstate.js controller
 *
 * @description: A set of functions called "actions" for managing `Injectionstate`.
 */

module.exports = {

  /**
   * Retrieve injectionstate records.
   *
   * @return {Object|Array}
   */

  find: async (ctx) => {
    return strapi.services.injectionstate.fetchAll(ctx.query);
  },

  /**
   * Retrieve a injectionstate record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.injectionstate.fetch(ctx.params);
  },

  /**
   * Create a/an injectionstate record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.injectionstate.add(ctx.request.body);
  },

  /**
   * Update a/an injectionstate record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.injectionstate.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an injectionstate record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.injectionstate.remove(ctx.params);
  }
};
