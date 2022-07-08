const https = require('https');
const axios = require('axios');
const ravenQueryRequest = require('./raven-query-request');

/**
 * A wrapper around axios that is configured to create a client to make requests to RavenDB.
 * Can be used with http or https depending on whether a certificate and key are provided.
 */
class RavenClient {
  #client;
  #serverUrl;
  #certificate;
  #key;

  #setClient() {
    this.#client = axios.create({
      baseURL: this.#serverUrl
    });
  }
  
  #setSecureClient() {
    const options = {
      rejectUnauthorized: true,
      cert: this.#certificate,
      key: this.#key,
    };

    const httpsAgent = new https.Agent(options);

    this.#client = axios.create({ 
      baseURL: this.#serverUrl,
      httpsAgent: httpsAgent
    });
  }
  
  #initialize() {
    if (this.#certificate && this.#key) {
      this.#setSecureClient();
    } 
    else if (!this.#certificate && !this.#key) {
      this.#setClient();
    } 
    else {
      throw new Error('Cannot create a secure client without both a certificate and key');
    }
  }
  
  /**
   * 
   * @param {Object} options
   * @param {String} options.serverUrl - URL of the RavenDB server.
   * @param {String} options.certificate - The certificate for secure access to the RavenDB server.
   * @param {String} options.key - The key for secure access to the RavenDB server. 
   */
  constructor({ serverUrl, certificate, key }) {
    this.#serverUrl = serverUrl;
    this.#certificate = certificate;
    this.#key = key;

    this.#initialize();
  }

  /**
   * Sends a request to RavenDB to get all documents returned by the query.
   *
   * @async
   * @param {String} databaseName - The name of the database to query.
   * @param {Object} collection - Object representing options for the collection.
   * @param {String} collection.name - Name of the collection in RavenDB.
   * @param {String[]} collection.includes - Array of the names of other collections whose documents to include in the query.
   * @param {String} etag - The etag representing the state of the database at the time of the query.
   * @return {Promise<Object>} - A promise that resolves to the result of the query.
   * @memberof RavenClient
   */
  async loadDocuments(databaseName, collection, etag) {
    const requestOptions = {
      databaseName: databaseName,
      collectionName: collection.name,
      includes: collection.includes,
      etag: etag,
    };

    const queryRequest = ravenQueryRequest(requestOptions);

    const response = await this.#client.request(queryRequest);

    return response;
  }
}

module.exports = RavenClient;