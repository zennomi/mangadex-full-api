'use strict';

const Manga = require('./manga.js');
const Relationship = require('../internal/relationship.js');
const Util = require('../util.js');
const Chapter = require('./chapter.js');
const User = require('./user.js');

/**
 * Represents a custom, user-created list of manga
 * https://api.mangadex.org/docs.html#tag/CustomList
 */
class List {
    /**
     * There is no reason to directly create a custom list object. Use static methods, ie 'get()'.
     * @param {Object|String} context Either an API response or Mangadex id 
     */
    constructor(context) {
        if (typeof context === 'string') {
            this.id = context;
            return;
        } else if (!context) return;

        if (context.data === undefined) context.data = {};

        /**
         * Mangadex id for this object
         * @type {String}
         */
        this.id = context.data.id;


        if (context.data.attributes === undefined) context.data.attributes = {};

        /**
         * Name of this custom list
         * @type {String}
         */
        this.name = context.data.attributes.name;

        /**
         * Version of this custom list
         * @type {String}
         */
        this.version = context.data.attributes.version;

        /**
         * String form of this list's visibility
         * @type {'public'|'private'}
         */
        this.visibility = context.data.attributes.visibility;
        if (this.visibility !== 'public' && this.visibility !== 'private') this.visibility = null;

        if (context.relationships === undefined) context.relationships = [];
        /**
         * Relationships to all of the manga in this custom list
         * @type {Relationship[]}
         */
        this.manga = Relationship.convertType('manga', context.relationships);

        if (context.data.attributes.owner === undefined) context.data.attributes.owner = {};
        /**
         * Relationship to this list's owner
         * @type {Relationship}
         */
        this.owner = new Relationship({ type: 'user', id: context.data.attributes.owner.id });

        if (context.data.attributes.owner.attributes === undefined) context.data.attributes.owner.attributes = {};
        /**
         * Name of this list's owner. Resolve this owner relationship object for other user info
         * @type {String}
         */
        this.ownerName = context.data.attributes.owner.attributes.username;
    }

    /**
     * Is this list public?
     * @type {Boolean}
     */
    get public() {
        if (this.visibility !== 'private' && this.visibility !== 'public') return null;
        return this.visibility === 'public';
    }

    /**
     * Retrieves and returns a list by its id
     * @param {String} id Mangadex id
     * @returns {Promise<List>}
     */
    static async get(id) {
        await Util.AuthUtil.validateTokens();
        return new List(await Util.apiRequest(`/list/${id}`));
    }

    /**
     * Create a new custom list. Must be logged in
     * @param {String} name
     * @param {Manga[]|String[]} manga
     * @param {'public'|'private'} [visibility='private'] 
     * @returns {Promise<List>}
     */
    static async create(name, manga, visibility = 'private') {
        if (!name || !manga || !manga.every(e => typeof e === 'string' || 'id' in e)) throw new Error('Invalid Argument(s)');
        await Util.AuthUtil.validateTokens();
        let res = await Util.apiRequest('/list', 'POST', {
            name: name,
            manga: manga.map(elem => typeof elem === 'string' ? elem : elem.id),
            visibility: visibility === 'public' ? visibility : 'private'
        });
        return new List(res);
    }

    /**
     * Deletes a custom list. Must be logged in
     * @param {String} id 
     * @returns {Promise<void>}
     */
    static delete(id) {
        let l = new List(id);
        return l.delete();
    }

    /**
     * Adds a manga to a custom list. Must be logged in
     * @param {String} listId
     * @param {Manga|String} manga
     * @returns {Promise<void>}
     */
    static async addManga(listId, manga) {
        if (!listId || !manga) throw new Error('Invalid Argument(s)');
        if (typeof manga !== 'string') manga = manga.id;
        await Util.AuthUtil.validateTokens();
        await Util.apiRequest(`/manga/${manga}/list/${listId}`, 'POST');
    }

    /**
     * Removes a manga from a custom list. Must be logged in
     * @param {String} listId
     * @param {Manga|String} manga
     * @returns {Promise<void>}
     */
    static async removeManga(listId, manga) {
        if (!listId || !manga) throw new Error('Invalid Argument(s)');
        if (typeof manga !== 'string') manga = manga.id;
        await Util.AuthUtil.validateTokens();
        await Util.apiRequest(`/manga/${manga}/list/${listId}`, 'DELETE');
    }

    /**
     * Returns all lists created by the logged in user.
     * As of the MD v5 Beta, this returns an empty list.
     * @param {Number} [limit=100] Amount of lists to return (0 to Infinity)
     * @param {Number} [offset=0] How many lists to skip before returning
     * @returns {Promise<List[]>}
     */
    static async getLoggedInUserLists(limit = 100, offset = 10) {
        await Util.AuthUtil.validateTokens();
        return await Util.apiCastedRequest('/user/list', List, { limit: limit, offset: offset });
    }

    /**
     * Returns all public lists created by a user.
     * As of the MD v5 Beta, this returns an empty list.
     * @param {String|User} user
     * @param {Number} [limit=100] Amount of lists to return (0 to Infinity)
     * @param {Number} [offset=0] How many lists to skip before returning
     * @returns {Promise<List[]>}
     */
    static async getUserLists(user, limit = 100, offset = 10) {
        if (typeof user !== 'string') user = user.id;
        return await Util.apiCastedRequest(`/user/${user}/list`, List, { limit: limit, offset: offset });
    }

    /**
     * @private
     * @typedef {Object} FeedParameterObject
     * @property {Number} FeedParameterObject.limit Not limited by API limits (more than 500). Use Infinity for maximum results (use at your own risk)
     * @property {Number} FeedParameterObject.offset
     * @property {String[]} FeedParameterObject.translatedLanguage
     * @property {String} FeedParameterObject.createdAtSince DateTime string with following format: YYYY-MM-DDTHH:MM:SS
     * @property {String} FeedParameterObject.updatedAtSince DateTime string with following format: YYYY-MM-DDTHH:MM:SS
     * @property {String} FeedParameterObject.publishAtSince DateTime string with following format: YYYY-MM-DDTHH:MM:SS
     * @property {Object} FeedParameterObject.order
     */

    /**
     * Returns a list of the most recent chapters from the manga in a list
     * @param {String} id Mangadex id of the list
     * @param {FeedParameterObject} parameterObject Information on which chapters to be returned
     * @returns {Promise<Chapter[]>}
     */
    static getFeed(id, parameterObject) {
        let l = new List(id);
        return l.getFeed(parameterObject);
    }

    /**
     * Returns a list of the most recent chapters from the manga in a list
     * https://api.mangadex.org/docs.html#operation/get-list-id-feed
     * @param {FeedParameterObject} [parameterObject] Information on which chapters to be returned
     * @returns {Promise<Chapter[]>}
     */
    async getFeed(parameterObject = {}) {
        await Util.AuthUtil.validateTokens();
        return await Util.apiCastedRequest(`/list/${this.id}/feed`, Chapter, parameterObject, 500, 100);
    }

    /**
     * Delete a custom list. Must be logged in
     * @returns {Promise<void>}
     */
    async delete() {
        await Util.AuthUtil.validateTokens();
        await Util.apiRequest(`/list/${this.id}`, 'DELETE');
    }

    /**
     * Renames a custom list. Must be logged in
     * @param {String} newName
     * @returns {Promise<List>}
     */
    async rename(newName) {
        if (!newName || typeof newName !== 'string') throw new Error('Invalid Argument(s)');
        await Util.AuthUtil.validateTokens();
        await Util.apiRequest(`/list/${this.id}`, 'PUT', { name: newName, version: this.version });
        this.name = newName;
        return this;
    }

    /**
     * Changes the visibility a custom list. Must be logged in
     * @param {'public'|'private'} [newVis] Leave blank to toggle
     * @returns {Promise<List>}
     */
    async changeVisibility(newVis) {
        if (!newVis && this.public) newVis = 'private';
        else if (!newVis && this.public !== null) newVis = 'public';
        else if (newVis !== 'private' && newVis !== 'public') throw new Error('Invalid Argument(s)');
        await Util.AuthUtil.validateTokens();
        await Util.apiRequest(`/list/${this.id}`, 'PUT', { visibility: newVis, version: this.version });
        this.visibility = newVis;
        return this;
    }

    /**
     * Changes the manga in a custom list. Must be logged in
     * @param {Manga[]|String[]} newList
     * @returns {Promise<List>}
     */
    async updateMangaList(newList) {
        if (!(newList instanceof Array)) throw new Error('Invalid Argument(s)');
        let idList = newList.map(elem => typeof elem === 'string' ? elem : elem.id);
        await Util.AuthUtil.validateTokens();
        let res = await Util.apiRequest(`/list/${this.id}`, 'PUT', { manga: idList, version: this.version });
        this.manga = Relationship.convertType('manga', res.relationships);
        return this;
    }

    /**
     * Adds a manga to this list
     * @param {Manga|String} manga
     * @returns {Promise<List>}
     */
    async addManga(manga) {
        if (typeof manga !== 'string') manga = manga.id;
        let idList = this.manga.map(elem => elem.id);
        // Uses updateMangaList to maintain server-side order
        if (!idList.includes(manga)) await this.updateMangaList(idList.concat(manga));
        return this;
    }

    /**
     * Removes a manga from this list
     * @param {Manga|String} manga
     * @returns {Promise<List>}
     */
    async removeManga(manga) {
        if (typeof manga !== 'string') manga = manga.id;
        await List.removeManga(this.id, manga);
        this.manga = this.manga.filter(elem => elem.id !== manga);
        return this;
    }
}

exports = module.exports = List;