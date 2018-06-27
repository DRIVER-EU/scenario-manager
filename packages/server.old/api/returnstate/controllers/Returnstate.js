'use strict';

/**
 * Returnstate.js controller
 *
 * @description: A set of functions called "actions" for managing `Returnstate`.
 */

module.exports = {

  /**
   * Retrieve returnstate records.
   *
   * @return {Object|Array}
   */

  find: async (ctx) => {
    return strapi.services.returnstate.fetchAll(ctx.query);
  },

  /**
   * Retrieve a returnstate record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.returnstate.fetch(ctx.params);
  },

  /**
   * Create a/an returnstate record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.returnstate.add(ctx.request.body);
  },

  /**
   * Update a/an returnstate record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.returnstate.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an returnstate record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.returnstate.remove(ctx.params);
  }
};
