'use strict';

/**
 * Participanttype.js controller
 *
 * @description: A set of functions called "actions" for managing `Participanttype`.
 */

module.exports = {

  /**
   * Retrieve participanttype records.
   *
   * @return {Object|Array}
   */

  find: async (ctx) => {
    return strapi.services.participanttype.fetchAll(ctx.query);
  },

  /**
   * Retrieve a participanttype record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.participanttype.fetch(ctx.params);
  },

  /**
   * Create a/an participanttype record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.participanttype.add(ctx.request.body);
  },

  /**
   * Update a/an participanttype record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.participanttype.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an participanttype record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.participanttype.remove(ctx.params);
  }
};
