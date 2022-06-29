const utils = require('../src/utils');

describe('utils', () => {
  test('getEtagCacheKey should return the correct key', () => {
    const collectionNode = 'collectionNode';
    const key = utils.getEtagCacheKey(collectionNode);
    
    const expectedKey = `${collectionNode}-etag`;

    expect(key)
      .toEqual(expectedKey);
  });

  test('getDocumentsCacheKey should return the correct key', () => {
    const collectionNode = 'collectionNode';
    const key = utils.getDocumentsCacheKey(collectionNode);
    
    const expectedKey = `${collectionNode}-documents`;

    expect(key)
      .toEqual(expectedKey);
  });

  test('getDocumentId should return the given document id', () => {
    const document = {
      '@metadata': {
        '@id': 'id'
      }
    };
    const id = utils.getDocumentId(document);

    expect(id)
      .toEqual('id');
  });

  test('getNodeId should return the correct node id for the given document', () => {
    const collectionNode = 'collectionNode';
    const document = {
      '@metadata': {
        '@id': 'id'
      }
    };
    const id = utils.getNodeId(collectionNode, document);

    const expectedId = `${collectionNode}-${document['@metadata']['@id']}`;

    expect(id)
      .toEqual(expectedId);
  });
});