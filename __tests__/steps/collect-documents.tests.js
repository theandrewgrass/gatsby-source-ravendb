const ravenClient = require('../../src/raven-client');
const ravenCache = require('../../src/raven-cache');
const collectDocuments = require('../../src/steps/collect-documents');

const createDocument = require('../helpers/create-document');
const mockQueryResponse = require('../helpers/mock-query-response');

jest.mock('../../src/raven-client');
jest.mock('../../src/raven-cache');

describe('collect-documents', () => {
  const basicOptions = {
    serverUrl: 'serverUrl',
    certificate: 'certificate',
    key: 'key',
    databaseName: 'databaseName',
    collection: {
      node: 'node'
    }
  };

  test('should create raven client using expected options', async () => {
    // Arrange
    ravenClient.mockImplementation(() => {
      return {
        loadDocuments: jest.fn(() => Promise.resolve(mockQueryResponse([], {}, 'etag'))),
      };
    });

    // Act
    await collectDocuments(basicOptions);

    // Assert
    const expectedClientOptions = {
      serverUrl: basicOptions.serverUrl,
      certificate: basicOptions.certificate,
      key: basicOptions.key,
    };

    expect(ravenClient)
      .toHaveBeenCalledWith(expectedClientOptions);
  });

  test('should return documents loaded by the raven client', async () => {
    // Arrange
    const existingDocuments = [
      createDocument('id1'),
      createDocument('id2'),
    ];

    const ravenClientMock = {
      loadDocuments: jest.fn(() => Promise.resolve(mockQueryResponse(existingDocuments, {}, 'etag')))
    };
    ravenClient.mockImplementation(() => ravenClientMock);

    // Act
    const loadedDocuments = await collectDocuments(basicOptions);

    // Assert
    expect(loadedDocuments)
      .toEqual(existingDocuments);
  });

  test('should load documents from cache if cached data is up-to-date', async() => {
    // Arrange
    const options = {
      ...basicOptions,
      cache: {}
    };

    const etag = 'etag';
    const cachedDocuments = [
      createDocument('id1'),
      createDocument('id2'),
    ];

    const ravenCacheMock = {
      loadEtag: jest.fn(() => Promise.resolve(etag)),
      hasUpToDateDocuments: jest.fn(() => true),
      loadDocuments: jest.fn(() => Promise.resolve(cachedDocuments)),
    };
    ravenCache.mockImplementation(() => ravenCacheMock);

    const ravenClientMock = {
      loadDocuments: jest.fn(() => Promise.resolve(mockQueryResponse([], {}, etag))),
    };
    ravenClient.mockImplementation(() => ravenClientMock);

    // Act
    const loadedDocuments = await collectDocuments(options);

    // Assert
    expect(ravenCacheMock.loadEtag)
      .toHaveBeenCalledWith(options.collection.node);

    expect(ravenCacheMock.loadDocuments)
      .toHaveBeenCalledWith(options.collection.node);

    expect(loadedDocuments)
      .toEqual(cachedDocuments);
  });

  test('should update etag and save documents to cache if cached data out-of-date', async() => {
    // Arrange
    const options = {
      ...basicOptions,
      cache: {}
    };

    const etag = 'etag';
    const loadedDocuments = [
      createDocument('id1'),
      createDocument('id2'),
    ];

    const ravenCacheMock = {
      loadEtag: jest.fn(() => Promise.resolve(etag)),
      hasUpToDateDocuments: jest.fn(() => false),
      saveEtag: jest.fn(() => Promise.resolve()),
      saveDocuments: jest.fn(() => Promise.resolve()),
    };
    ravenCache.mockImplementation(() => ravenCacheMock);

    const ravenClientMock = {
      loadDocuments: jest.fn(() => Promise.resolve(mockQueryResponse(loadedDocuments, {}, etag)))
    };
    ravenClient.mockImplementation(() => ravenClientMock);

    // Act
    await collectDocuments(options);
    
    // Assert
    expect(ravenCacheMock.saveEtag)
      .toHaveBeenCalledWith(options.collection.node, etag);

    expect(ravenCacheMock.saveDocuments)
      .toHaveBeenCalledWith(options.collection.node, loadedDocuments);
  });

  test('should map includes to relevant documents', async() => {
    // Arrange
    const options = {
      ...basicOptions,
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

    const loadedDocuments = [
      createDocument('id1', { SomeInclude: 'someIncludeId', AnotherInclude: 'anotherIncludeId' }),
    ];

    const loadedIncludes = {
      someIncludeId: createDocument('someIncludeId', { someProperty: 'someValue' }),
      anotherIncludeId: createDocument('anotherIncludeId', { anotherProperty: 'anotherValue' }),
    };
    
    const ravenClientMock = {
      loadDocuments: jest.fn(() => Promise.resolve(mockQueryResponse(loadedDocuments, loadedIncludes, 'etag')))
    };
    ravenClient.mockImplementation(() => ravenClientMock);

    // Act
    const documents = await collectDocuments(options);
    
    // Assert
    expect(documents)
      .toHaveLength(1);

    expect(documents[0].SomeInclude)
      .toEqual(loadedIncludes.someIncludeId);
    expect(documents[0].AnotherInclude)
      .toEqual(loadedIncludes.anotherIncludeId);
  });
});