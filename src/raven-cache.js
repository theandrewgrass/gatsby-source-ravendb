/**
 * A wrapper around Gatsby cache with helper methods for saving and loading RavenDB data.
*/
class RavenCache {
  #cache;
  
  /**
   * Creates an instance of RavenCache.
   * @param {Object} options
   * @param {Object} options.cache - Cache instance provided by Gatsby in sourceNodes step.
   */
  constructor({ cache }) {
    this.#cache = cache;
  }

  /**
   * Loads the etag from the cache for the given collection.
   *
   * @async
   * @param {String} collectionNode - The name of the collection node for which to load the etag.
   * @return {String} The etag for the given collection. 
   * @memberof RavenCache
   */
  async loadEtag(collectionNode) {
    const cacheKey = utils.getEtagCacheKey(collectionNode);
    const cachedEtag = await this.#cache.get(cacheKey);

    return cachedEtag;
  }

  /**
   * Saves the etag to the cache for the given collection.
   * 
   * @async
   * @param {String} collectionNode - The name of the collection node for which to save the etag. 
   * @param {String} etag - The etag to save for the given collection.
   * @memberof RavenCache
   */
  async saveEtag(collectionNode, etag) {
    const cacheKey = utils.getEtagCacheKey(collectionNode);
    await this.#cache.set(cacheKey, etag);
  }

  /**
   * Loads the documents from the cache for the given collection.
   * 
   * @async
   * @param {String} collectionNode - The name of the collection node for which to load the documents.
   * @return {Arry<Object>} The documents for the given collection.
   * @memberof RavenCache
   */
  async loadDocuments(collectionNode) {
    const cacheKey = utils.getDocumentsCacheKey(collectionNode);
    const cachedDocuments = await this.#cache.get(cacheKey);

    return cachedDocuments;
  }

  /**
   * Saves the documents to the cache for the given collection.
   * 
   * @async
   * @param {String} collectionNode - The name of the collection node for which to save the documents.
   * @param {Array<Object>} documents - The documents for the given collection.
   * @memberof RavenCache
   */
  async saveDocuments(collectionNode, documents) {
    const cacheKey = utils.getDocumentsCacheKey(collectionNode);
    await this.#cache.set(cacheKey, documents);
  }

  /**
   * Determines if the documents in the cache are up-to-date or if they need to be updated depending on
   * whether the etag has changed since it was last cached.
   * 
   * @param {String} etag - The etag for the given collection.
   * @return {Boolean} Whether the cached documents are up-to-date.
   * @memberof RavenCache
   */
  async hasUpToDateDocuments(etag) {
    const cacheKey = utils.getEtagCacheKey(collectionNode);
    const cachedEtag = await this.#cache.get(cacheKey);

    return cachedEtag && cachedEtag === etag;
  }
}

module.exports = RavenCache;