const ravenClient = require('../raven-client');
const ravenCache = require('../raven-cache');

const collectDocuments = async (options) => {
  const {
    serverUrl,
    certificate,
    key,
    databaseName,
    collection,
    cache: gatsbyCache,
  } = options;

  const client = new ravenClient({ serverUrl, certificate, key });
  const cache = new ravenCache({ cache: gatsbyCache });

  const cachedEtag = await cache.loadEtag(collection.node);
  const response = await client.loadDocuments(databaseName, collection, cachedEtag);

  let { 
    data: {
      Results: documents,
      Includes: includes,
      ResultEtag: etag,
    }
  } = response;
  
  if (await cache.hasUpToDateDocuments(collection.node, etag)) {
    documents = await cache.loadDocuments(collection.node);
  }
  else {
    mapIncludesToDocuments(documents, includes, collection.includes);
    await cache.saveEtag(collection.node, etag);
    await cache.saveDocuments(collection.node, documents);
  }
  
  return documents;
};

function mapIncludesToDocuments(documents, includes, collectionIncludes) {
  if (!collectionIncludes) {
    return documents;
  }

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

module.exports = collectDocuments;