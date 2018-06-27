'use strict';

/**
 * Audience.js controller
 *
 * @description: A set of functions called "actions" for managing `Audience`.
 */

module.exports = {

  /**
   * Retrieve audience records.
   *
   * @return {Object|Array}
   */

  find: async (ctx) => {
    return strapi.services.audience.fetchAll(ctx.query);
  },

  /**
   * Retrieve a audience record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.audience.fetch(ctx.params);
  },

  /**
   * Create a/an audience record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.audience.add(ctx.request.body);
  },

  /**
   * Update a/an audience record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.audience.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an audience record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.audience.remove(ctx.params);
  }
};
