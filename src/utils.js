module.exports = {
  getEtagCacheKey: (collectionNode) => `${collectionNode}-etag`,
  getDocumentsCacheKey: (collectionNode) => `${collectionNode}-documents`,
  getDocumentId: (document) => document['@metadata']['@id'],
  getNodeId: (collectionNode, document) => `${collectionNode}-${document['@metadata']['@id']}`
};