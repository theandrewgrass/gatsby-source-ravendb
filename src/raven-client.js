const https = require('https');
const axios = require('axios');
const ravenQueryRequest = require('./raven-query-request');

module.exports = class RavenClient {
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
  
  constructor({ serverUrl, certificate, key }) {
    this.#serverUrl = serverUrl;
    this.#certificate = certificate;
    this.#key = key;

    this.#initialize();
  }

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