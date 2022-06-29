const ravenQueryRequest = require('../src/raven-query-request');

describe('raven-query-request', () => {
  it('should return a query', () => {
    const databaseName = 'databaseName';
    const collectionName = 'collectionName';
    const query = ravenQueryRequest(databaseName, collectionName);

    expect(query)
      .toBeDefined();
  });

  it('should return a query that has the http method set as post', () => {
    const databaseName = 'databaseName';
    const collectionName = 'collectionName';
    const query = ravenQueryRequest(databaseName, collectionName);

    const expectedHttpMethod = 'post';

    expect(query.method)
      .toEqual(expectedHttpMethod);
  });

  it('should return a query with the the correct url', () => {
    const databaseName = 'databaseName';
    const collectionName = 'collectionName';
    const query = ravenQueryRequest(databaseName, collectionName);

    const expectedQueryUrl = `/databases/${databaseName}/queries`;

    expect(query.url)
      .toEqual(expectedQueryUrl);
  });

  it('should return a query with the correct data', () => {
    const databaseName = 'databaseName';
    const collectionName = 'collectionName';
    const query = ravenQueryRequest(databaseName, collectionName);

    const expectedPayload = {
      Query: `from ${collectionName}`,
    };

    expect(query.data)
      .toEqual(expectedPayload);
  });

  it('should add the If-None-Match header with the provided etag', () => {
    const databaseName = 'databaseName';
    const collectionName = 'collectionName';
    const etag = 'etag';
    const query = ravenQueryRequest(databaseName, collectionName, etag);

    const expectedHeaders = {
      'If-None-Match': etag,
    };

    expect(query.headers)
      .toEqual(expectedHeaders);
  });
});

