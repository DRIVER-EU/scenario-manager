'use strict';

/**
 * Objective.js controller
 *
 * @description: A set of functions called "actions" for managing `Objective`.
 */

module.exports = {

  /**
   * Retrieve objective records.
   *
   * @return {Object|Array}
   */

  find: async (ctx) => {
    return strapi.services.objective.fetchAll(ctx.query);
  },

  /**
   * Retrieve a objective record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.objective.fetch(ctx.params);
  },

  /**
   * Create a/an objective record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.objective.add(ctx.request.body);
  },

  /**
   * Update a/an objective record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.objective.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an objective record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.objective.remove(ctx.params);
  }
};
