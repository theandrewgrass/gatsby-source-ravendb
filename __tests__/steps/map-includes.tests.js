const mapIncludes = require('../../src/steps/map-includes');

const createDocument = require('../helpers/create-document');

describe('map-includes', () => {
  test('should map includes to relevant documents', async() => {
    // Arrange
    const collectionIncludes = [ 'SomeProperty', 'SomeNested.Property', 'SomeCollection[].Property', 'SomeCollection[].Nested.Property' ];

    const documents = [
      createDocument('id1', { 
        SomeProperty: 'somePropertyId', 
        SomeNested: { Property: 'someNestedPropertyId' },
        SomeCollection: [ { Property: 'someCollectionPropertyId' }, { Nested: { Property: 'someNestedCollectionPropertyId' } } ]
      }),
    ];

    const includes = {
      somePropertyId: createDocument('somePropertyId', { someProperty: 'someValue' }),
      someNestedPropertyId: createDocument('someNestedPropertyId', { someProperty: 'nestedValue' }),
      someCollectionPropertyId: createDocument('someCollectionPropertyId', { someProperty: 'collectionValue' }),
      someNestedCollectionPropertyId: createDocument('someNestedCollectionPropertyId', { someProperty: 'nestedCollectionValue' }),
    };

    // Act
    mapIncludes(documents, includes, collectionIncludes);
    
    // Assert
    expect(documents)
      .toHaveLength(1);

    const document = documents[0];

    expect(document.SomeProperty)
      .toEqual(includes.somePropertyId);
    expect(document.SomeNested.Property)
      .toEqual(includes.someNestedPropertyId);
    expect(document.SomeCollection[0].Property)
      .toEqual(includes.someCollectionPropertyId);
    expect(document.SomeCollection[1].Nested.Property)
      .toEqual(includes.someNestedCollectionPropertyId);
  });
});