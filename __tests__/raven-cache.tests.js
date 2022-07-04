const ravenCache = require('../src/raven-cache');

describe('raven-cache', () => {
  test('should load etag from cache', async () => {
    const gatsbyCache = {
      get: jest.fn(() => Promise.resolve('etag')),
    };
    const cache = new ravenCache({ cache: gatsbyCache });

    const etag = await cache.loadEtag();

    expect(etag)
      .toEqual('etag');
  });

  test('should save etag to cache', async () => {
    const gatsbyCache = {
      set: jest.fn(() => Promise.resolve()),
    };

    const cache = new ravenCache({ cache: gatsbyCache });

    await cache.saveEtag('node', 'etag');

    expect(gatsbyCache.set)
      .toHaveBeenCalledWith('node-etag', 'etag');
  });

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

  test('should save documents to cache using documents cache key', async () => {
    const documents = [
      { '@metadata': { '@id': '123' } },
      { '@metadata': { '@id': '456' } },
    ];
    const collectionNode = 'node';
    const gatsbyCache = {
      set: jest.fn(() => Promise.resolve()),
    };
    const cache = new ravenCache({ cache: gatsbyCache });

    await cache.saveDocuments(collectionNode, documents);

    expect(gatsbyCache.set)
      .toHaveBeenCalledWith(`${collectionNode}-documents`, documents);
  });

  test('should return true if given etag matches cached etag', async () => {
    const gatsbyCache = {
      get: jest.fn(() => Promise.resolve('etag')),
    };
    const cache = new ravenCache({ cache: gatsbyCache });

    const isUpToDate = await cache.hasUpToDateDocuments('node', 'etag');

    expect(isUpToDate)
      .toBeTruthy();
  });

  test('should return false if given etag does not match cached etag', async () => {
    const gatsbyCache = {
      get: jest.fn(() => Promise.resolve(undefined)),
    };
    const cache = new ravenCache({ cache: gatsbyCache });

    const isUpToDate = await cache.hasUpToDateDocuments('node', 'etag');

    expect(isUpToDate)
      .toBeFalsy();
  });

  test('getEtagCacheKey should return the correct key', () => {
    const collectionNode = 'collectionNode';
    const cache = new ravenCache({});
    const key = cache.getEtagCacheKey(collectionNode);
    
    const expectedKey = `${collectionNode}-etag`;

    expect(key)
      .toEqual(expectedKey);
  });

  test('getDocumentsCacheKey should return the correct key', () => {
    const collectionNode = 'collectionNode';
    const cache = new ravenCache({});
    const key = cache.getDocumentsCacheKey(collectionNode);
    
    const expectedKey = `${collectionNode}-documents`;

    expect(key)
      .toEqual(expectedKey);
  });
});