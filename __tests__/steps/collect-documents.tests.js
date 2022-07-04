const ravenClient = require('../../src/raven-client');
const ravenCache = require('../../src/raven-cache');
const collectDocuments = require('../../src/steps/collect-documents');

jest.mock('../../src/raven-client');
jest.mock('../../src/raven-cache');

describe('collect-documents', () => {
  test('should create raven client with given options', async () => {
    const options = {
      serverUrl: 'serverUrl',
      certificate: 'certificate',
      key: 'key',
      databaseName: 'databaseName',
      collection: {
        node: 'node',
      },
    };
    
    ravenClient.mockImplementation(() => {
      return {
        loadDocuments: jest.fn(() => Promise.resolve({ data: { } })),
      };
    });

    await collectDocuments(options);

    expect(ravenClient)
      .toHaveBeenCalledWith(options.serverUrl, options.certificate, options.key);
  });

  test('should return documents loaded by the raven client', async () => {
    const options = {
      serverUrl: 'serverUrl',
      certificate: 'certificate',
      key: 'key',
      databaseName: 'databaseName',
      collection: {
        node: 'node',
      },
    };

    const ravenClientMock = {
      loadDocuments: jest.fn(() => {
        return Promise.resolve({
          data: {
            Results: [
              { '@metadata': { '@id': '123' } },
              { '@metadata': { '@id': '456' } },
            ],
          }
        });
      })
    };
    ravenClient.mockImplementation(() => ravenClientMock);

    const documents = await collectDocuments(options);

    expect(documents)
      .toEqual([
        { '@metadata': { '@id': '123' } },
        { '@metadata': { '@id': '456' } },
      ]);
  });

  test('should load documents from cache if cached data is up-to-date', async() => {
    const options = {
      serverUrl: 'serverUrl',
      certificate: 'certificate',
      key: 'key',
      databaseName: 'databaseName',
      collection: {
        node: 'node',
      },
      cache: {}
    };

    const ravenCacheMock = {
      loadEtag: jest.fn(() => Promise.resolve('etag')),
      hasUpToDateDocuments: jest.fn(() => true),
      loadDocuments: jest.fn(() => Promise.resolve([
        { '@metadata': { '@id': '123' } },
        { '@metadata': { '@id': '456' } },
      ])),
    };
    ravenCache.mockImplementation(() => ravenCacheMock);

    const ravenClientMock = {
      loadDocuments: jest.fn(() => Promise.resolve({ 
        data: {
          Results: [],
        },
        Etag: 'etag',
      }))
    };
    ravenClient.mockImplementation(() => ravenClientMock);

    const documents = await collectDocuments(options);

    expect(ravenCacheMock.loadEtag)
      .toHaveBeenCalledWith(options.collection.node);

    expect(ravenCacheMock.loadDocuments)
      .toHaveBeenCalledWith(options.collection.node);

    expect(documents)
      .toEqual([
        { '@metadata': { '@id': '123' } },
        { '@metadata': { '@id': '456' } },
      ]);
  });

  test('should save documents to cache if cached data out-of-date', async() => {
    const options = {
      serverUrl: 'serverUrl',
      certificate: 'certificate',
      key: 'key',
      databaseName: 'databaseName',
      collection: {
        node: 'node',
      },
      cache: {}
    };

    const ravenCacheMock = {
      loadEtag: jest.fn(() => Promise.resolve('etag')),
      hasUpToDateDocuments: jest.fn(() => false),
      saveEtag: jest.fn(() => Promise.resolve()),
      saveDocuments: jest.fn(() => Promise.resolve()),
    };
    ravenCache.mockImplementation(() => ravenCacheMock);

    const ravenClientMock = {
      loadDocuments: jest.fn(() => Promise.resolve({ 
        data: {
          Results: [
            { '@metadata': { '@id': '123' } },
            { '@metadata': { '@id': '456' } },
          ],
          Etag: 'etag',
        },
      }))
    };
    ravenClient.mockImplementation(() => ravenClientMock);

    await collectDocuments(options);
    
    expect(ravenCacheMock.saveEtag)
      .toHaveBeenCalledWith(options.collection.node, 'etag');

    expect(ravenCacheMock.saveDocuments)
      .toHaveBeenCalledWith(options.collection.node, [
        { '@metadata': { '@id': '123' } },
        { '@metadata': { '@id': '456' } },
      ]);
  });

  test('should map includes to relevant documents', async() => {
    const options = {
      serverUrl: 'serverUrl',
      certificate: 'certificate',
      key: 'key',
      databaseName: 'databaseName',
      collection: {
        node: 'node',
        includes: [ 'SomeInclude', 'AnotherInclude' ],
      },
      cache: {}
    };

    const ravenCacheMock = {
      loadEtag: jest.fn(() => Promise.resolve()),
      hasUpToDateDocuments: jest.fn(() => false),
      saveEtag: jest.fn(() => Promise.resolve()),
      saveDocuments: jest.fn(() => Promise.resolve()),
    };
    ravenCache.mockImplementation(() => ravenCacheMock);

    const someInclude = {
      'someProperty': 'someValue', 
      '@metadata': { '@id': 'someIncludeId' },
    };
    const anotherInclude = {
      'anotherProperty': 'anotherValue',
      '@metadata': { '@id': 'anotherIncludeId' },
    };
    const ravenClientMock = {
      loadDocuments: jest.fn(() => Promise.resolve({ 
        data: {
          Results: [
            { 
              'SomeInclude': 'someIncludeId',
              'AnotherInclude': 'anotherIncludeId', 
              '@metadata': { '@id': '123' } 
            },
          ],
          Includes: {
            'someIncludeId': someInclude,
            'anotherIncludeId': anotherInclude,
          },
          Etag: 'etag',
        },
      }))
    };
    ravenClient.mockImplementation(() => ravenClientMock);

    const documents = await collectDocuments(options);
    
    expect(documents)
      .toHaveLength(1);

    expect(documents[0].SomeInclude)
      .toEqual(someInclude);
    expect(documents[0].AnotherInclude)
      .toEqual(anotherInclude);
  });
});