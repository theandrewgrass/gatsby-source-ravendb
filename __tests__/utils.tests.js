const utils = require('../src/utils');
const createDocument = require('./helpers/create-document');

describe('utils', () => {
  describe('getDocumentId', () => {
    test('should return the given document id', () => {
      // Arrange
      const documentId = 'id1';
      const document = createDocument(documentId);

      // Act
      const id = utils.getDocumentId(document);
  
      // Assert
      expect(id)
        .toEqual(documentId);
    });
  });

  describe('getNodeId', () => {
    test('should return the correct node id for the given document', () => {
      // Arrange
      const collectionNode = 'collectionNode';
      const document = createDocument('id1');

      // Act
      const id = utils.getNodeId(collectionNode, document);
  
      // Assert
      const expectedId = `${collectionNode}-${document['@metadata']['@id']}`;
  
      expect(id)
        .toEqual(expectedId);
    });
  });
});