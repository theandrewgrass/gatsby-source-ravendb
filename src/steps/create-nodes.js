const utils = require('../utils');

const createNodes = ({ createNode, createNodeId, createContentDigest, documents, collection }) => {
  if (!documents)
  {
    return;
  }
  
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
};

module.exports = createNodes;