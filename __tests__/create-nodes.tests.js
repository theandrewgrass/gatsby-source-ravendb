const createNodes = require('../src/steps/create-nodes');

describe('create-nodes', () => {  
  test('should run createNode for every document with expected parameters', async() => {
    // Arrange
    const collection = {
      name: 'users',
      node: 'User',
    };
    
    const documents = [
      { '@metadata': { '@id': '123' } },
      { '@metadata': { '@id': '456' } },
    ];
    
    const createNode = jest.fn();
    const createNodeId = jest.fn(() => 'nodeId');
    const createContentDigest = jest.fn(() => 'contentDigest');
    
    const options = {
      createNode,
      createNodeId,
      createContentDigest,
      collection,
      documents,
    };
    
    // Act
    await createNodes(options);
    
    // Assert
    expect(createNode).toHaveBeenCalledTimes(2);
    
    documents.forEach(document => {
      const expectedCreateNodeParams = {
        ...document,
        id: 'nodeId',
        _id: document['@metadata']['@id'],
        parent: null,
        children: [],
        internal: {
          type: collection.node,
          content: JSON.stringify(document),
          contentDigest: 'contentDigest',
        },
      };

      expect(createNode).toHaveBeenCalledWith(expectedCreateNodeParams);
    });
  });
});