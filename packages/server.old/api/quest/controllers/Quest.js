'use strict';

/**
 * Quest.js controller
 *
 * @description: A set of functions called "actions" for managing `Quest`.
 */

module.exports = {

  /**
   * Retrieve quest records.
   *
   * @return {Object|Array}
   */

  find: async (ctx) => {
    return strapi.services.quest.fetchAll(ctx.query);
  },

  /**
   * Retrieve a quest record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.quest.fetch(ctx.params);
  },

  /**
   * Create a/an quest record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.quest.add(ctx.request.body);
  },

  /**
   * Update a/an quest record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.quest.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an quest record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.quest.remove(ctx.params);
  }
};
