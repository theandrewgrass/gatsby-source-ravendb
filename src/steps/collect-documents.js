const ravenClient = require('../raven-client');
const ravenCache = require('../raven-cache');

const collectDocuments = async (options) => {
  const {
    serverUrl,
    certificate,
    key,
    databaseName,
    collection,
    cache: gatsbyCache,
  } = options;

  const client = new ravenClient(serverUrl, certificate, key);
  const cache = new ravenCache({ cache: gatsbyCache });

  const cachedEtag = await cache.loadEtag(collection.node);
  const response = await client.loadDocuments(databaseName, collection, cachedEtag);

  let { 
    data: {
      Results: documents,
      Includes: includes,
      Etag: etag,
    }
  } = response;
  
  if (cache.hasUpToDateDocuments(collection.node, etag)) {
    documents = await cache.loadDocuments(collection.node);
  }
  else {
    mapIncludesToDocuments(documents, includes, collection.includes);
    await cache.saveEtag(collection.node, etag);
    await cache.saveDocuments(collection.node, documents);
  }
  
  return documents;
};

function mapIncludesToDocuments(documents, includes, collectionIncludes) {
  if (!collectionIncludes) {
    return documents;
  }

  documents.forEach(document => {
    collectionIncludes.forEach(collectionInclude => {
      if (document[collectionInclude]) {
        document[collectionInclude] = includes[document[collectionInclude]];
      }
    });
  });

  return documents;
}

module.exports = collectDocuments;