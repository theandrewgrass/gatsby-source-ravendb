const axios = require('axios');
const https = require('https');
const ravenClient = require('../src/raven-client');

jest.mock('axios');
jest.mock('https');

describe('raven-client', () => {
  beforeEach(() =>  {
    jest.resetModules();
  });

  test('should create a regular axios client if no certificate and key are provided', () => {
    // Arrange
    const options = {
      serverUrl: 'serverUrl',
    };

    // Act
    new ravenClient(options);
    
    // Assert
    expect(axios.create)
      .toHaveBeenCalledWith({ 
        baseURL: options.serverUrl,
        httpsAgent: undefined
      });
  });

  test('should create a secure axios client if certificate and key are provided', () => {
    // Arrange
    const options = {
      serverUrl: 'serverUrl',
      certificate: 'certificate',
      key: 'key',
    };

    // Act
    new ravenClient(options);

    // Assert
    expect(axios.create)
      .toHaveBeenCalledWith({ 
        baseURL: options.serverUrl,
        httpsAgent: expect.any(https.Agent)
      });
    
    expect(https.Agent)
      .toHaveBeenCalledWith({
        rejectUnauthorized: true,
        cert: options.certificate,
        key: options.key,
      });
  });

  test('should throw an error if a certificate is provided without a key', () => {
    // Arrange
    const options = {
      serverUrl: 'serverUrl',
      certificate: 'certificate',
    };

    // Act/Assert
    expect(() => { new ravenClient(options); })
      .toThrowError();
  });

  test('should throw an error if a key is provided without a certificate', () => {
    // Arrange
    const options = {
      serverUrl: 'serverUrl',
      key: 'key',
    };

    // Act/Assert
    expect(() => { new ravenClient(options); })
      .toThrowError();
  });

  test('loadDocuments should make a request using the regular axios client', async () => {
    // Arrange
    const clientOptions = {
      serverUrl: 'serverUrl',
    };

    const databaseName = 'databaseName';
    const collection = { name: 'collectionName', includes: ['include1', 'include2'] };
    const etag = 'etag';
    
    axios.create.mockReturnThis();
    axios.request.mockReturnValue({ data: 'data' });
    const client = new ravenClient(clientOptions);

    // Act
    const response = await client.loadDocuments(databaseName, collection, etag);

    // Assert
    expect(response)
      .toEqual({ data: 'data' });
  });

  test('loadDocuments should get expected response using the secure axios client', async () => {
    // Arrange
    const clientOptions = {
      serverUrl: 'serverUrl',
      certificate: 'certificate',
      key: 'key',
    };

    const databaseName = 'databaseName';
    const collection = { name: 'collectionName', includes: ['include1', 'include2'] };
    const etag = 'etag';
    
    axios.create.mockReturnThis();
    axios.request.mockReturnValue({ data: 'data' });
    const client = new ravenClient(clientOptions);

    // Act
    const response = await client.loadDocuments(databaseName, collection, etag);

    // Assert
    expect(response)
      .toEqual({ data: 'data' });
  });
});