const ravenCache = require('../src/raven-cache');
const createDocument = require('./helpers/create-document');

describe('raven-cache', () => {
  describe('loadEtag', () => {
    test('should load etag from Gatsby cache', async () => {
      const gatsbyCache = {
        get: jest.fn(() => Promise.resolve('etag')),
      };
      const cache = new ravenCache({ cache: gatsbyCache });
  
      const etag = await cache.loadEtag();
  
      expect(etag)
        .toEqual('etag');
    });
  });

  describe('saveEtag', () => {
    test('should save etag to cache', async () => {
      const gatsbyCache = {
        set: jest.fn(() => Promise.resolve()),
      };
  
      const cache = new ravenCache({ cache: gatsbyCache });
  
      await cache.saveEtag('node', 'etag');
  
      expect(gatsbyCache.set)
        .toHaveBeenCalledWith('node-etag', 'etag');
    });
  });

  describe('loadDocuments', () => {
    test('should load documents from cache using documents cache key', async () => {
      const cachedDocuments = [
        { '@metadata': { '@id': '123' } },
        { '@metadata': { '@id': '456' } },
      ];
      const collectionNode = 'node';
      const gatsbyCache = {
        get: jest.fn(() => Promise.resolve(cachedDocuments)),
      };
      const cache = new ravenCache({ cache: gatsbyCache });
  
      const documents = await cache.loadDocuments(collectionNode);
  
      expect(gatsbyCache.get)
        .toHaveBeenCalledWith(`${collectionNode}-documents`);
      expect(documents)
        .toEqual(cachedDocuments);
    });
  });

  describe('saveDocuments', () => {
    test('should save documents to cache using documents cache key', async () => {
      // Arrange
      const collectionNode = 'node';
      const documents = [
        createDocument('id1'),
        createDocument('id2'),
      ];
  
      const gatsbyCache = {
        set: jest.fn(() => Promise.resolve()),
      };
  
      const cache = new ravenCache({ cache: gatsbyCache });
      
      // Act
      await cache.saveDocuments(collectionNode, documents);
  
      // Assert
      expect(gatsbyCache.set)
        .toHaveBeenCalledWith(`${collectionNode}-documents`, documents);
    });
  });

  describe('hasUpToDateDocuments', () => {
    test('should be truthy if given etag matches cached etag', async () => {
      // Arrange
      const gatsbyCache = {
        get: jest.fn(() => Promise.resolve('etag')),
      };
      const cache = new ravenCache({ cache: gatsbyCache });

      const isUpToDate = await cache.hasUpToDateDocuments('node', 'etag');

      expect(isUpToDate)
        .toBeTruthy();
    });

    test('should be falsy if given etag does not match cached etag', async () => {
      const gatsbyCache = {
        get: jest.fn(() => Promise.resolve(undefined)),
      };
      const cache = new ravenCache({ cache: gatsbyCache });
  
      const isUpToDate = await cache.hasUpToDateDocuments('node', 'etag');
  
      expect(isUpToDate)
        .toBeFalsy();
    });
  });

  describe('getEtagCacheKey', () => {
    test('should return the correct etag cache key', () => {
      const collectionNode = 'collectionNode';
      const cache = new ravenCache({});
      const key = cache.getEtagCacheKey(collectionNode);
      
      const expectedKey = `${collectionNode}-etag`;
  
      expect(key)
        .toEqual(expectedKey);
    });
  });

  describe('getDocumentsCacheKey', () => {
    test('should return the correct documents cache key', () => {
      const collectionNode = 'collectionNode';
      const cache = new ravenCache({});
      const key = cache.getDocumentsCacheKey(collectionNode);
      
      const expectedKey = `${collectionNode}-documents`;
  
      expect(key)
        .toEqual(expectedKey);
    });
  });
});