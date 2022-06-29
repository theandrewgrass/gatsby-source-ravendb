const ravenClient = require('../src/raven-client');

describe('raven-client', () => {
  it('should return a client', () => {
    const serverUrl = 'serverUrl';
    const client = ravenClient(serverUrl);

    expect(client)
      .toBeDefined();
  });

  it('should return a client with the provided baseURL', () => {
    const serverUrl = 'serverUrl';
    const client = ravenClient(serverUrl);

    expect(client.defaults.baseURL)
      .toEqual(serverUrl);
  });

  test('should return a regular client if no certificate and key are provided', () => {
    const serverUrl = 'serverUrl';
    const client = ravenClient(serverUrl);
    
    expect(client.defaults.httpsAgent)
      .toBeUndefined();
  });

  test('should return a secure client if given a certificate and key', () => {
    const serverUrl = 'serverUrl';
    const certificate = 'certificate';
    const key = 'key';
    const client = ravenClient(serverUrl, certificate, key);

    expect(client.defaults.httpsAgent)
      .toBeDefined();
  });

  test('should throw an error if a certificate is provided without a key', () => {
    const serverUrl = 'serverUrl';
    const certificate = 'certificate';

    expect(() => { ravenClient(serverUrl, certificate); })
      .toThrowError();
  });

  test('should throw an error if a key is provided without a certificate', () => {
    const serverUrl = 'serverUrl';
    const key = 'key';

    expect(() => { ravenClient(serverUrl, undefined, key); })
      .toThrowError();
  });
});