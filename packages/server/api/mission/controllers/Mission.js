'use strict';

/**
 * Mission.js controller
 *
 * @description: A set of functions called "actions" for managing `Mission`.
 */

module.exports = {

  /**
   * Retrieve mission records.
   *
   * @return {Object|Array}
   */

  find: async (ctx) => {
    return strapi.services.mission.fetchAll(ctx.query);
  },

  /**
   * Retrieve a mission record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.mission.fetch(ctx.params);
  },

  /**
   * Create a/an mission record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.mission.add(ctx.request.body);
  },

  /**
   * Update a/an mission record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.mission.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an mission record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.mission.remove(ctx.params);
  }
};
