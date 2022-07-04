const collectDocuments = require('./steps/collect-documents');
const createNodes = require('./steps/create-nodes');

exports.sourceNodes = async (gatsbyUtils, pluginOptions) => {
  const {
    actions: { createNode },
    createContentDigest,
    createNodeId,
    reporter,
    cache,
  } = gatsbyUtils;

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
    for (const collection of collections) {
      let documents;

      // STEP 1: Collect documents
      try {
        const options = {
          serverUrl,
          certificate,
          key,
          databaseName,
          collection,
          cache
        };
  
        documents = await collectDocuments(options);
      }
      catch (error) {
        reporter.error(`Something went wrong while collecting documents for the collection, ${collection.name}.`, error);
        throw error;
      }

      // STEP 2: Create nodes
      try {
        const options = {
          createNode,
          createNodeId,
          createContentDigest,
          collection,
          documents
        };
  
        await createNodes(options);
      }
      catch (error) {
        reporter.error(`Something went wrong while creating nodes for the collection, ${collection.name}.`, error);
        throw error;
      }
    }
  } catch (error) {
    activity.setStatus(`Failed`);
    activity.end();

    throw error;
  }

  activity.setStatus(`Completed`);
  activity.end();
  
  return;
}
