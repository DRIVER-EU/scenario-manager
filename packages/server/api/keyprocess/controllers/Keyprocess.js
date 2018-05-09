'use strict';

/**
 * Keyprocess.js controller
 *
 * @description: A set of functions called "actions" for managing `Keyprocess`.
 */

module.exports = {

  /**
   * Retrieve keyprocess records.
   *
   * @return {Object|Array}
   */

  find: async (ctx) => {
    return strapi.services.keyprocess.fetchAll(ctx.query);
  },

  /**
   * Retrieve a keyprocess record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.keyprocess.fetch(ctx.params);
  },

  /**
   * Create a/an keyprocess record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.keyprocess.add(ctx.request.body);
  },

  /**
   * Update a/an keyprocess record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.keyprocess.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an keyprocess record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.keyprocess.remove(ctx.params);
  }
};
