module.exports = ({ databaseName, collectionName, includes, etag }) => {
  let query;

  function inititialize() {
    const url = `/databases/${databaseName}/queries`;
    const payload = {
      Query: buildQueryString(),
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

  function buildQueryString() {
    let queryString = `from ${collectionName}`;

    if (includes) {
      queryString += ` include ${includes.join(', ')}`;
    }

    return queryString;
  }

  inititialize();
  return query;
};