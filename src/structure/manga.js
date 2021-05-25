'use strict';

const Util = require('../util.js');
const Links = require('../internal/links.js');
const LocalizedString = require('../internal/localizedstring.js');
const Relationship = require('../internal/relationship.js');
const Tag = require('../internal/tag.js');
const Chapter = require('./chapter.js');
const Cover = require('./cover.js');

/**
 * Represents a Mangadex manga object
 * https://api.mangadex.org/docs.html#tag/Manga
 */
class Manga {
    /**
     * There is no reason to directly create a manga object. Use static methods, ie 'get()'.
     * @param {Object|String} context Either an API response or Mangadex id 
     */
    constructor(context) {
        if (typeof(context) === 'string') {
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
         * Main title with different localization options
         * @type {LocalizedString}
         */
        this.localizedTitle = new LocalizedString(context.data.attributes.title);
        
        /**
         * Alt titles with different localization options
         * @type {LocalizedString[]}
         */
        this.localizedAltTitles = (context.data.attributes.altTitles || []).map(i => new LocalizedString(i));
        
        /**
         * Description with different localization options
         * @type {LocalizedString}
         */
        this.localizedDescription = new LocalizedString(context.data.attributes.description);

        /**
         * Is this Manga locked?
         * @type {Boolean}
         */
        this.isLocked = context.data.attributes.isLocked;

        /**
         * Link object representing links to other websites about this manga
         * https://api.mangadex.org/docs.html#section/Static-data/Manga-links-data
         * @type {Links}
         */
        this.links = new Links(context.data.attributes.links);

        /**
         * 2-letter code for the original language of this manga
         * @type {String}
         */
        this.originalLanguage = context.data.attributes.originalLanguage;

        /**
         * Number this manga's last volume
         * @type {Number}
         */
        this.lastVolume = context.data.attributes.lastVolume !== null && !isNaN(context.data.attributes.lastVolume) ? parseFloat(context.data.attributes.lastVolume) : null;

        /**
         * Name of this manga's last chapter
         * @type {String}
         */
        this.lastChapter = context.data.attributes.lastChapter;

        /**
         * Publication demographic of this manga
         * https://api.mangadex.org/docs.html#section/Static-data/Manga-publication-demographic
         * @type {'shounen'|'shoujo'|'josei'|'seinen'}
         */
        this.publicationDemographic = context.data.attributes.publicationDemographic;
        
        /**
         * Publication/Scanlation status of this manga
         * @type {'ongoing'|'completed'|'hiatus'|'abandoned'}
         */
        this.status = context.data.attributes.status;

        /**
         * Year of this manga's publication
         * @type {Number}
         */
        this.year = context.data.attributes.year !== null && !isNaN(context.data.attributes.year) ? parseFloat(context.data.attributes.year) : null;

        /**
         * The content rating of this manga
         * @type {'safe'|'suggestive'|'erotica'|'pornographic'}
         */
        this.contentRating = context.data.attributes.contentRating;

        /**
         * The date of this manga's page creation
         * @type {Date}
         */
        this.createdAt = context.data.attributes.createdAt ? new Date(context.data.attributes.createdAt) : null;

        /**
         * The date the manga was last updated
         * @type {Date}
         */
        this.updatedAt = context.data.attributes.updatedAt ? new Date(context.data.attributes.updatedAt) : null;

        /**
         * Relationships to authors attributed to this manga
         * @type {Relationship[]}
         */
        this.authors = Relationship.convertType('author', context.relationships);

        /**
         * Relationships to artists attributed to this manga
         * @type {Relationship[]}
         */
        this.artists = Relationship.convertType('artist', context.relationships);

        /**
         * Relationships to this manga's chapters
         * @type {Relationship[]}
         */
        this.chapters = Relationship.convertType('chapter', context.relationships);

        /**
         * Relationships to this manga's main cover. Use 'getCovers' to retrive other covers
         * @type {Relationship}
         */
        this.mainCover = Relationship.convertType('cover_art', context.relationships).pop();
        if (!this.mainCover) this.mainCover = null;

        /**
         * Array of tags for this manga
         * @type {Tag[]}
         */
        this.tags = (context.data.attributes.tags || []).map(elem => new Tag(elem));
    }

    /**
     * Main title string based on global locale
     * @type {String}
     */
    get title() {
        if (this.localizedTitle !== undefined) return this.localizedTitle.localString;
        return undefined;
    }

    /**
     * Alt titles array based on global locale
     * @type {String[]}
     */
     get altTitles() {
        if (this.localizedAltTitles !== undefined) return this.localizedAltTitles.map(e => e.localString);
        return undefined;
    }

    /**
     * Description string based on global locale
     * @type {String}
     */
     get description() {
        if (this.localizedDescription !== undefined) return this.localizedDescription.localString;
        return undefined;
    }

    /**
     * Peforms a search and returns an array of manga.
     * https://api.mangadex.org/docs.html#operation/get-search-manga
     * @typedef {Object} MangaParameterObject
     * @property {String} MangaParameterObject.title
     * @property {Number} MangaParameterObject.year
     * @property {'AND'|'OR'} MangaParameterObject.includedTagsMode
     * @property {'AND'|'OR'} MangaParameterObject.excludedTagsMode
     * @property {String} MangaParameterObject.createdAtSince DateTime string with following format: YYYY-MM-DDTHH:MM:SS
     * @property {String} MangaParameterObject.updatedAtSince DateTime string with following format: YYYY-MM-DDTHH:MM:SS
     * @property {Object} MangaParameterObject.order
     * @property {String[]|Author[]} MangaParameterObject.authors Array of author ids
     * @property {String[]|Author[]} MangaParameterObject.artists Array of artist ids
     * @property {String[]|Tag[]} MangaParameterObject.includedTags
     * @property {String[]|Tag[]} MangaParameterObject.excludedTags
     * @property {Array<'ongoing'|'completed'|'hiatus'|'abandoned'>} MangaParameterObject.status
     * @property {String[]} MangaParameterObject.originalLanguage
     * @property {Array<'shounen'|'shoujo'|'josei'|'seinen'|'none'>} MangaParameterObject.publicationDemographic
     * @property {String[]} MangaParameterObject.ids Max of 100 per request
     * @property {Array<'safe'|'suggestive'|'erotica'|'pornographic'>} MangaParameterObject.contentRating
     * @property {Number} MangaParameterObject.limit
     * @property {Number} MangaParameterObject.offset
     * @param {MangaParameterObject|String} [searchParameters] An object of offical search parameters, or a string representing the title
     * @param {Number} [limit=10] The maximum amount (100) of results to return. (Default: 10)
     * @param {Number} [offset=0] The amount of results to skip before recording them. (Default: 0)
     * @returns {Promise<Manga[]>}
     */
    static search(searchParameters = {}, limit = 10, offset = 0) {
        return new Promise(async(resolve, reject) => {
            if (typeof(searchParameters) === 'string') searchParameters = { title: searchParameters };
            let cleanParameters = { limit: limit, offset: offset };
            for (let i in searchParameters) {
                if (searchParameters[i] instanceof Array) cleanParameters[i] = searchParameters[i].map(elem => {
                    if (typeof(elem) === 'string') return elem;
                    if ('id' in elem) return elem.id;
                    return elem.toString();
                });
                else if (typeof(searchParameters[i]) !== 'string') cleanParameters[i] = searchParameters[i].toString();
                else cleanParameters[i] = searchParameters[i];
            }

            try {
                let res = await Util.apiParameterRequest('/manga', cleanParameters);
                if (Util.getResponseStatus(res) !== 'ok') 
                    reject(new Error(`Manga search returned error:\n${Util.getResponseMessage(res)}`));
                if (!(res instanceof Array)) reject(new Error(`Manga search returned non-search result:\n${res}`)); 
                resolve(res.map(manga => new Manga(manga)));
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Retrieves and returns a manga by its id
     * @param {String} id Mangadex id
     * @returns {Promise<Manga>}
     */
    static get(id) {
        let m = new Manga(id);
        return m.fill();
    }

    /**
     * @typedef {Object} FeedParameterObject
     * @property {Number} FeedParameterObject.limit;
     * @property {Number} FeedParameterObject.offset;
     * @property {String[]} FeedParameterObject.translatedLanguage
     * @property {String} FeedParameterObject.createdAtSince DateTime string with following format: YYYY-MM-DDTHH:MM:SS
     * @property {String} FeedParameterObject.updatedAtSince DateTime string with following format: YYYY-MM-DDTHH:MM:SS
     * @property {String} FeedParameterObject.publishAtSince DateTime string with following format: YYYY-MM-DDTHH:MM:SS
     * @property {Object} FeedParameterObject.order
     * @param {String} id
     * @param {FeedParameterObject} [params]
     * @param {Number} [limit]
     * @param {Number} [offset]
     * @returns {Promise<Chapter[]>}
     */
    static getFeed(id, params = {}, limit = 100, offset = 0) {
        let m = new Manga(id);
        return m.getFeed(params, limit, offset);
    }

    /**
     * Returns one random manga
     * @returns {Promise<Manga>}
     */
    static async getRandom() {
        return new Promise(async (resolve, reject) => {
            try {
                let res = await Util.apiRequest('/manga/random');
                if (Util.getResponseStatus(res) === 'ok') resolve(new Manga(res));
                else reject(new Error(`Failed to get random manga: ${Util.getResponseMessage(res)}`));
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Returns all manga followed by the logged in user
     * @returns {Promise<Manga[]>}
     */
    static async getFollowedManga() {
        return new Promise(async (resolve, reject) => {
            try {
                await Util.AuthUtil.validateTokens();
                let res = await Util.apiRequest('/user/follows/manga');
                if (Util.getResponseStatus(res) !== 'ok') reject(new Error(`Failed to get followed manga:\n${Util.getResponseMessage(res)}`)); 
                if (!(res.results instanceof Array)) reject(new Error(`Followed manga returned non-list result:\n${res}`));
                resolve(res.results.map(elem => new Manga(elem)));
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Returns all covers for a manga
     * @param {String} id Manga id
     * @returns {Promise<Cover[]>}
     */
    static getCovers(id) {
        return Cover.getMangaCovers(id);
    }

    /**
     * Returns all covers for this manga
     * @returns {Promise<Cover[]>}
     */
    getCovers() {
        return Manga.getCovers(this.id);
    }

    /**
     * Retrieves all data for this manga from the API using its id.
     * Sets the data in place and returns a new manga object as well.
     * Use if there is an incomplete in this object
     * @returns {Promise<Manga>}
     */
    fill() {
        return new Promise(async (resolve, reject) => {
            if (!this.id) reject(new Error('Attempted to fill manga with no id.'));
            try {
                let res = await Util.apiRequest(`/manga/${this.id}`);
                if (Util.getResponseStatus(res) !== 'ok') reject(new Error(`Failed to fill manga:\n${Util.getResponseMessage(res)}`));
                resolve(new Manga(res));
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Returns a feed of the most recent chapters of this manga
     * @param {FeedParameterObject} [params]
     * @param {Number} [limit]
     * @param {Number} [offset]
     * @returns {Promise<Chapter>}
     */
    getFeed(params = {}, limit = 100, offset = 0) {
        return new Promise(async (resolve, reject) => {
            if (!('limit' in params)) params.limit = limit;
            if (!('offset' in params)) params.offset = offset;
            try {
                let res = await Util.apiParameterRequest(`/manga/${this.id}/feed`, params);
                if (Util.getResponseStatus(res) !== 'ok') reject(new Error(`Failed to get manga feed:\n${Util.getResponseMessage(res)}`)); 
                if (!(res instanceof Array)) reject(new Error(`Manga feed returned non-list result:\n${res}`));
                resolve(res.map(elem => new Chapter(elem)));
            } catch (err) {
                reject(err);
            }
        });
    }
}

exports = module.exports = Manga;