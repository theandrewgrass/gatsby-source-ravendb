const ravenQueryRequest = require('../src/raven-query-request');

describe('raven-query-request', () => {
  it('should return a query', () => {
    const queryOptions = {
      databaseName: 'databaseName',
      collectionName: 'collectionName',
    };
    const query = ravenQueryRequest(queryOptions);

    expect(query)
      .toBeDefined();
  });

  it('should return a query that has the http method set as post', () => {
    const queryOptions = {
      databaseName: 'databaseName',
      collectionName: 'collectionName',
    };
    const query = ravenQueryRequest(queryOptions);

    const expectedHttpMethod = 'post';

    expect(query.method)
      .toEqual(expectedHttpMethod);
  });

  it('should return a query with the the correct url', () => {
    const queryOptions = {
      databaseName: 'databaseName',
      collectionName: 'collectionName',
    };
    const query = ravenQueryRequest(queryOptions);

    const expectedQueryUrl = `/databases/${queryOptions.databaseName}/queries`;

    expect(query.url)
      .toEqual(expectedQueryUrl);
  });

  it('should return a query with the correct data', () => {
    const queryOptions = {
      databaseName: 'databaseName',
      collectionName: 'collectionName',
    };
    const query = ravenQueryRequest(queryOptions);

    const expectedPayload = {
      Query: `from ${queryOptions.collectionName}`,
    };

    expect(query.data)
      .toEqual(expectedPayload);
  });

  it('should add the If-None-Match header with the provided etag', () => {
    const queryOptions = {
      databaseName: 'databaseName',
      collectionName: 'collectionName',
      etag: 'etag',
    };
    const query = ravenQueryRequest(queryOptions);

    const expectedHeaders = {
      'If-None-Match': queryOptions.etag,
    };

    expect(query.headers)
      .toEqual(expectedHeaders);
  });

  it('should have a query string containing includes if includes option provided', () => {
    const queryOptions = {
      databaseName: 'databaseName',
      collectionName: 'collectionName',
      includes: ['include1', 'include2'],
    };
    const query = ravenQueryRequest(queryOptions);

    const expectedQueryString = `from ${queryOptions.collectionName} include ${queryOptions.includes[0]}, ${queryOptions.includes[1]}`;

    expect(query.data.Query)
      .toEqual(expectedQueryString);
  });
});

