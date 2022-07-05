const ravenQueryRequest = require('../src/raven-query-request');

describe('raven-query-request', () => {
  const basicOptions = {
    databaseName: 'databaseName',
    collectionName: 'collectionName',
  };

  it('should return a query', () => {
    // Act
    const query = ravenQueryRequest(basicOptions);

    // Assert
    expect(query)
      .toBeDefined();
  });

  it('should return a query that has the http method set as post', () => {
    // Act
    const query = ravenQueryRequest(basicOptions);

    // Assert
    const expectedHttpMethod = 'post';
    
    expect(query.method)
      .toEqual(expectedHttpMethod);
  });

  it('should return a query with the the correct url', () => {
    // Act
    const query = ravenQueryRequest(basicOptions);

    // Assert
    const expectedQueryUrl = `/databases/${basicOptions.databaseName}/queries`;
    
    expect(query.url)
      .toEqual(expectedQueryUrl);
  });

  it('should return a query with the correct data', () => {
    // Act
    const query = ravenQueryRequest(basicOptions);

    // Assert
    const expectedPayload = {
      Query: `from ${basicOptions.collectionName}`,
    };
    
    expect(query.data)
      .toEqual(expectedPayload);
  });

  it('should add the If-None-Match header with the provided etag', () => {
    // Arrange
    const options = {
      ...basicOptions,
      etag: 'etag',
    };

    // Act
    const query = ravenQueryRequest(options);

    
    // Assert
    const expectedHeaders = {
      'If-None-Match': options.etag,
    };
    
    expect(query.headers)
      .toEqual(expectedHeaders);
  });

  it('should have a query string containing includes if includes option provided', () => {
    // Arrange
    const options = {
      ...basicOptions,
      includes: ['include1', 'include2'],
    };

    // Act
    const query = ravenQueryRequest(options);

    // Assert
    const expectedQueryString = `from ${options.collectionName} include ${options.includes[0]}, ${options.includes[1]}`;

    expect(query.data.Query)
      .toEqual(expectedQueryString);
  });
});

