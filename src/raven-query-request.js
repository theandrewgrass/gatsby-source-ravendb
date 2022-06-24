module.exports = (databaseName, collectionName, etag) => {
  let query;

  function inititialize() {
    const url = `/databases/${databaseName}/queries`;
    const payload = {
      Query: `from ${collectionName}`,
    };
    const headers = {
      ...(etag && { 'If-None-Match': etag })
    };

    query = {
      method: 'post',
      url: url,
      data: payload,
      headers: headers,
    };
  }

  inititialize();
  return query;
};