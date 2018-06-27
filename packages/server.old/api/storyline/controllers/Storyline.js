'use strict';

/**
 * Storyline.js controller
 *
 * @description: A set of functions called "actions" for managing `Storyline`.
 */

module.exports = {

  /**
   * Retrieve storyline records.
   *
   * @return {Object|Array}
   */

  find: async (ctx) => {
    return strapi.services.storyline.fetchAll(ctx.query);
  },

  /**
   * Retrieve a storyline record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.storyline.fetch(ctx.params);
  },

  /**
   * Create a/an storyline record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.storyline.add(ctx.request.body);
  },

  /**
   * Update a/an storyline record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.storyline.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an storyline record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.storyline.remove(ctx.params);
  }
};
