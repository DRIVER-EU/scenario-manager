'use strict';

/**
 * Actionstate.js controller
 *
 * @description: A set of functions called "actions" for managing `Actionstate`.
 */

module.exports = {

  /**
   * Retrieve actionstate records.
   *
   * @return {Object|Array}
   */

  find: async (ctx) => {
    return strapi.services.actionstate.fetchAll(ctx.query);
  },

  /**
   * Retrieve a actionstate record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.actionstate.fetch(ctx.params);
  },

  /**
   * Create a/an actionstate record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.actionstate.add(ctx.request.body);
  },

  /**
   * Update a/an actionstate record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.actionstate.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an actionstate record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.actionstate.remove(ctx.params);
  }
};
