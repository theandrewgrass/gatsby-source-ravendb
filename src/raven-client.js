const https = require('https');
const axios = require('axios');

module.exports = (serverUrl, certificate, key) => {
  let client;

  function setSecureClient() {
    const options = {
      rejectUnauthorized: true,
      cert: certificate,
      key: key,
    };

    const httpsAgent = new https.Agent(options);

    client = axios.create({ 
      baseURL: serverUrl,
      httpsAgent: httpsAgent
    });
  }

  function setClient() {
    client = axios.create({
      baseURL: serverUrl
    });
  }

  function inititialize() {
    if (certificate)
    {
      setSecureClient();
    }
    else {
      setClient();
    }
  }

  inititialize();
  return client;
};