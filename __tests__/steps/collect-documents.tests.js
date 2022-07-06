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
        includes: [ 'SomeProperty', 'SomeNested.Property', 'SomeCollection[].Property', 'SomeCollection[].Nested.Property' ],
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
      createDocument('id1', { 
        SomeProperty: 'somePropertyId', 
        SomeNested: { Property: 'someNestedPropertyId' },
        SomeCollection: [ { Property: 'someCollectionPropertyId' }, { Nested: { Property: 'someNestedCollectionPropertyId' } } ]
      }),
    ];

    const loadedIncludes = {
      somePropertyId: createDocument('somePropertyId', { someProperty: 'someValue' }),
      someNestedPropertyId: createDocument('someNestedPropertyId', { someProperty: 'nestedValue' }),
      someCollectionPropertyId: createDocument('someCollectionPropertyId', { someProperty: 'collectionValue' }),
      someNestedCollectionPropertyId: createDocument('someNestedCollectionPropertyId', { someProperty: 'nestedCollectionValue' }),
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

    const document = documents[0];

    expect(document.SomeProperty)
      .toEqual(loadedIncludes.somePropertyId);
    expect(documents[0].AnotherInclude)
      .toEqual(loadedIncludes.anotherIncludeId);
    expect(document.SomeNested.Property)
      .toEqual(loadedIncludes.someNestedPropertyId);
    expect(document.SomeCollection[0].Property)
      .toEqual(loadedIncludes.someCollectionPropertyId);
    expect(document.SomeCollection[1].Nested.Property)
      .toEqual(loadedIncludes.someNestedCollectionPropertyId);
  });
});