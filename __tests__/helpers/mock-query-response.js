const mockQueryResponse = (documents, includes, etag) => {
  return {
    data: {
      Results: documents,
      Includes: includes,
      ResultEtag: etag,
    }
  };
};

module.exports = mockQueryResponse;