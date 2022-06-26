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

  try {
    const client = ravenClient(serverUrl, certificate, key);
    
    collections.forEach(async collection => {
      const etagCacheKey = utils.getEtagCacheKey(collection.node);
      const documentsCacheKey = utils.getDocumentsCacheKey(collection.node);

      const cachedEtag = await cache.get(etagCacheKey);
      const queryRequest = ravenQueryRequest(databaseName, collection.name, cachedEtag);

      const response = await client.request(queryRequest);
      const { data: { Results: documents, ResultEtag: etag } } = response;

      if (cachedEtag && cachedEtag === etag) {
        documents = await cache.get(documentsCacheKey);
      } else {
        await cache.set(etagCacheKey, etag);
        await cache.set(documentsCacheKey, documents);
      }

      documents.forEach(document => {
        const documentId = utils.getDocumentId(document);
        const nodeId = utils.getNodeId(collection.node, document);

        createNode({
          ...document,
          _id: documentId,
          id: createNodeId(nodeId),
          parent: null,
          children: [],
          internal: {
            type: collection.node,
            content: JSON.stringify(document),
            contentDigest: createContentDigest(document),
          },
        });
      });
    });
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
