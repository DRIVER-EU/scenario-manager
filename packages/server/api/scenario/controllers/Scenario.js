'use strict';

/**
 * Scenario.js controller
 *
 * @description: A set of functions called "actions" for managing `Scenario`.
 */

module.exports = {

  /**
   * Retrieve scenario records.
   *
   * @return {Object|Array}
   */

  find: async (ctx) => {
    return strapi.services.scenario.fetchAll(ctx.query);
  },

  /**
   * Retrieve a scenario record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.scenario.fetch(ctx.params);
  },

  /**
   * Create a/an scenario record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.scenario.add(ctx.request.body);
  },

  /**
   * Update a/an scenario record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.scenario.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an scenario record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.scenario.remove(ctx.params);
  }
};
