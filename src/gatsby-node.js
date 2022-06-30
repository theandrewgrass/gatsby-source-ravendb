const ravenClient = require('./raven-client');
const ravenQueryRequest = require('./raven-query-request');
const utils = require('./utils');

exports.sourceNodes = async ({
  actions,
  createContentDigest,
  createNodeId,
  reporter,
  cache,
}, pluginOptions) => {
  const { createNode } = actions;

  const { 
    serverUrl, 
    databaseName, 
    certificate,
    key,
    collections,
  } = pluginOptions;

  let activity = reporter.activityTimer(`Creating nodes from RavenDB data`);
  activity.start();

  const loadEtagFromCache = async (collectionNode) => {
    const cacheKey = utils.getEtagCacheKey(collectionNode);
    const cachedEtag = await cache.get(cacheKey);

    return cachedEtag;
  };

  const saveEtagToCache = async (collectionNode, etag) => {
    const cacheKey = utils.getEtagCacheKey(collectionNode);
    await cache.set(cacheKey, etag);
  };

  const saveDocumentsToCache = async (collectionNode, documents) => {
    const cacheKey = utils.getDocumentsCacheKey(collectionNode);
    await cache.set(cacheKey, documents);
  };

  const loadDocuments = async (client, databaseName, collection, etag) => {
    const buildRavenQueryRequest = (databaseName, collection, etag) => {
      const ravenQueryRequestOptions = {
        databaseName: databaseName,
        collectionName: collection.name,
        includes: collection.includes,
        etag: cachedEtag,
      };
      const queryRequest = ravenQueryRequest(ravenQueryRequestOptions);
  
      return queryRequest;
    }
    
    const queryRequest = buildRavenQueryRequest(databaseName, collection, etag);
    
    const response = await client.request(queryRequest);

    return response;
  };

  const canLoadDocumentsFromCache = (cachedEtag, etag) => {
    return cachedEtag && cachedEtag === etag;
  }

  const mapIncludesToDocuments = (documents, includes, collectionIncludes) => {
    if (!collectionIncludes) {
      return documents;
    }

    documents.forEach(document => {
      collectionIncludes.forEach(include => {
        if (document[include]) {
          document[include] = includes[document[include]];
        }
      });
    });

    return documents;
  };

  const collectDocuments = async (client, databaseName, collection) => {
    const cachedEtag = await loadEtagFromCache(collection.node);
    const response = await loadDocuments(client, databaseName, collection, cachedEtag);

    let { 
      data: {
        Results: documents,
        Includes: includes,
        Etag: etag,
      }
    } = response;

    if (canLoadDocumentsFromCache(cachedEtag, etag)) {
      documents = await loadDocumentsFromCache(collection.node);
    }
    else {
      mapIncludesToDocuments(documents, includes, collection.includes);
      await saveEtagToCache(collection.node, etag);
      await saveDocumentsToCache(collection.node, documents);
    }

    return documents;
  };

  const createNodes = (documents, collection) => {
    return Promise.all(documents.map(document => {
      const documentId = utils.getDocumentId(document);
      const nodeId = utils.getNodeId(collection.node, document);
      
      return createNode({
        ...document,
        _id: documentId,
        id: createNodeId(nodeId),
        parent: null,
        children: [],
        internal: {
          type: collection.node,
          content: JSON.stringify(document),
          contentDigest: createContentDigest(document)
        }
      });
    }));
  }

  try {
    const client = ravenClient(serverUrl, certificate, key);
    
    for (const collection of collections) {
      const documents = await collectDocuments(client, databaseName, collection);
      await createNodes(documents, collection);
    }
  } catch (err) {
    reporter.error(`Something went wrong while sourcing data from RavenDB.`, err);

    activity.setStatus(`Failed`);
    activity.end();

    throw err;
  }

  activity.setStatus(`Completed`);
  activity.end();
  
  return;
}
