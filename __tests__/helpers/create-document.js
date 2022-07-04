const createDocument = (id, properties) => {
  return {
    '@metadata': {
      '@id': id,
    },
    ...properties,
  };
};

module.exports = createDocument;