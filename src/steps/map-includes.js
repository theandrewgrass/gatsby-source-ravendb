/**
 * Maps any included documents to a collection's top-level documents. Uses the provided collectionIncludes to find the
 * appropriate place to insert the included documents.
 * 
 * @param {Array<Object>} documents - documents to which any relevant includes will be mapped
 * @param {Array<Object>} includes - included documents from the query to RavenDB that should be mapped to documents
 * @param {Array<String>} collectionIncludes - strings denoting which includes to map to document the documents 
 * @returns {Array<Object>} - documents with relevant includes mapped to them
 */
const mapIncludes = (documents, includes, collectionIncludes) => {
  documents.forEach(document => {
    collectionIncludes.forEach(collectionInclude => {
      const includeParts = collectionInclude.split(/(\[])?(\.)/).filter(item => item);

      const mapIncludesFromParts = (includeParts, documentPart) => {
        if (includeParts.length === 1) { // on the final include part
          if (documentPart && documentPart[includeParts[0]] && includes[documentPart[includeParts[0]]]) { // document part is defined and has a matching include and an include exists for the id in the document
            const includeId = documentPart[includeParts[0]];
            documentPart[includeParts[0]] = includes[includeId];
          }
          return;
        }

        switch(includeParts[0]) {
          case ('[]'):
            for (let i = 0; i < documentPart.length; i++) {
              mapIncludesFromParts(includeParts.slice(1), documentPart[i]);
            }
            break;
          case ('.'):
            mapIncludesFromParts(includeParts.slice(1), documentPart);
            break;
          default:
            mapIncludesFromParts(includeParts.slice(1), documentPart[includeParts[0]]);
            break;
        }
      };

      mapIncludesFromParts(includeParts, document);
    });
  });

  return documents;
}

module.exports = mapIncludes;