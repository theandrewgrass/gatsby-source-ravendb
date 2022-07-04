module.exports = {
  getDocumentId: (document) => document['@metadata']['@id'],
  getNodeId: (collectionNode, document) => `${collectionNode}-${document['@metadata']['@id']}`
};