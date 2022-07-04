const axios = require('axios');
const https = require('https');
const ravenClient = require('../src/raven-client');

jest.mock('axios');
jest.mock('https');

describe('raven-client', () => {
  beforeEach(() =>  {
    jest.resetModules();
  });

  const basicOptions = {
    serverUrl: 'serverUrl',
  };

  const secureOptions = {
    ...basicOptions,
    certificate: 'certificate',
    key: 'key',
  };

  test('should create a regular axios client if no certificate and key are provided', () => {
    // Act
    new ravenClient(basicOptions);
    
    // Assert
    expect(axios.create)
      .toHaveBeenCalledWith({ 
        baseURL: basicOptions.serverUrl,
        httpsAgent: undefined
      });
  });

  test('should create a secure axios client if certificate and key are provided', () => {
    // Act
    new ravenClient(secureOptions);

    // Assert
    expect(axios.create)
      .toHaveBeenCalledWith({ 
        baseURL: secureOptions.serverUrl,
        httpsAgent: expect.any(https.Agent)
      });
    
    expect(https.Agent)
      .toHaveBeenCalledWith({
        rejectUnauthorized: true,
        cert: secureOptions.certificate,
        key: secureOptions.key,
      });
  });

  test('should throw an error if a certificate is provided without a key', () => {
    // Arrange
    const options = {
      ...secureOptions,
      key: undefined,
    };

    // Act/Assert
    expect(() => { new ravenClient(options); })
      .toThrowError();
  });

  test('should throw an error if a key is provided without a certificate', () => {
    // Arrange
    const options = {
      ...secureOptions,
      certificate: undefined,
    };

    // Act/Assert
    expect(() => { new ravenClient(options); })
      .toThrowError();
  });

  describe('loadDocuments', () => {
    test('loadDocuments should make a request using the regular axios client', async () => {
      // Arrange  
      const databaseName = 'databaseName';
      const collection = { name: 'collectionName' };
      const etag = 'etag';
      
      const mockResponse = { data: 'data' };

      axios.create.mockReturnThis();
      axios.request.mockReturnValue(mockResponse);
      const client = new ravenClient(basicOptions);
  
      // Act
      const response = await client.loadDocuments(databaseName, collection, etag);
  
      // Assert
      expect(response)
        .toEqual(mockResponse);
    });

    test('loadDocuments should get expected response using the secure axios client', async () => {
      // Arrange  
      const databaseName = 'databaseName';
      const collection = { name: 'collectionName' };
      const etag = 'etag';
      
      const mockResponse = { data: 'data' };

      axios.create.mockReturnThis();
      axios.request.mockReturnValue(mockResponse);
      const client = new ravenClient(secureOptions);
  
      // Act
      const response = await client.loadDocuments(databaseName, collection, etag);
  
      // Assert
      expect(response)
        .toEqual(mockResponse);
    });
  });
});