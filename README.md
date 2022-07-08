# gatsby-source-ravendb

A source plugin for pulling data from RavenDB documents into a Gatsby application.

## How to install

Run the following command in the root directory of your Gatsby application:

```npm install gatsby-source-ravendb```

or, if you're using Yarn:

```yarn add gatsby-source-ravendb```

## Example

>The following example will use the `Northwind` sample data from RavenDB (see [here](https://ravendb.net/docs/article-page/5.3/csharp/studio/database/tasks/create-sample-data) for instructions to create).

### Basic Configuration

The snippet below demonstrates how to query data from a local instance of RavenDB.

```javascript
// gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-ravendb`,
      options: { 
        serverUrl: `http://127.0.0.1:8080`, 
        databaseName: `Example`,
        collections: [ 
          { name: `Products`, node: `Product` },
          { name: `Orders`, node: `Order` },
        ]
      }
    },
  ]
}
```

This will result in two queries to a database called `Example` - one for each collection listed in the `collections` option.

### Secure Access

If you wanted to use a certificate provided by RavenDB to securely query the database, simply add the `certificate` and `key` options with the relevant values.

```javascript
// gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-ravendb`,
      options: { 
        serverUrl: process.env.RAVEN_SERVER_URL, 
        databaseName: `Example`,
        collections: [ 
          { name: `Products`, node: `Product` },
          { name: `Orders`, node: `Order` },
        ],
        certificate: fs.readFileSync(`./raven.crt`),
        key: fs.readFileSync(`./raven.key`),
      },
    },
  ]
}
```

### Include Nested Documents

Related documents may be nested within a given document, referred to by the related document's id. The id alone is likely not that useful to your application, but the data within the document with this id could be.

Configuration can be added so that the relevant documents will be included in the query response from RavenDB and mapped to the property in the main document.

```javascript
// gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-ravendb`,
      options: { 
        serverUrl: process.env.RAVEN_SERVER_URL, 
        databaseName: `Example`,
        collections: [ 
          { 
            name: `Products`, 
            node: `Product`,
            includes: [
              `Supplier`,
              `Category`,
            ],
          },
          { 
            name: `Orders`, 
            node: `Order`,
            includes: [
              `ShipVia`,
              `Lines[].Product`,
            ],
          },
        ]
      },
    },
  ]
}
```

The `includes` options themselves are [string-based paths](https://ravendb.net/docs/article-page/5.3/Csharp/client-api/how-to/handle-document-relationships#path-conventions) which informs RavenDB how to traverse the document.

> For more information about each configurable option for this plugin, see the [plugin options](#plugin-options) section.

### Querying the data

With the data now available in your application, you can access it via the GraphQL API.

> The GraphQL query below is possible using the [includes example configuration](#include-nested-documents).

```graphql
{
  allProduct(limit: 1) {
    nodes {
      Name
      UnitsInStock
      PricePerUnit
      Category {
        Name
      }
      Supplier {
        Name
      }
    }
  }
  allOrder(limit: 1) {
    nodes {
      Lines {
        Product {
          Name
          PricePerUnit
        }
      }
      ShipVia {
        Name
      }
      RequireAt
    }
  }
}
```

The above should produce a response similar to the following:

```json
{
  "data": {
    "allProduct": {
      "nodes": [
        {
          "Name": "Chai",
          "UnitsInStock": 1,
          "PricePerUnit": 18,
          "Category": {
            "Name": "Beverages"
          },
          "Supplier": {
            "Name": "Exotic Liquids"
          }
        }
      ]
    },
    "allOrder": {
      "nodes": [
        {
          "Lines": [
            {
              "Product": {
                "Name": "Queso Cabrales",
                "PricePerUnit": 21
              }
            },
            {
              "Product": {
                "Name": "Singaporean Hokkien Fried Mee",
                "PricePerUnit": 14
              }
            },
            {
              "Product": {
                "Name": "Mozzarella di Giovanni",
                "PricePerUnit": 34.8
              }
            }
          ],
          "ShipVia": {
            "Name": "Federal Shipping"
          },
          "RequireAt": "1996-08-01T00:00:00.0000000"
        }
      ]
    }
  },
  "extensions": {}
}
```

## Plugin options
- **serverUrl**: the base URL of your RavenDB instance (i.e. `http://127.0.0.1:8080`).
- **databaseName**: the name of the database that contains the collections of interest.
- **collections**: an array of RavenDB collections.
  - **name**: the name of the collection in RavenDB.
  - **node**: the name you'd like to give to the GraphQL nodes.
  - **includes** (optional): an array of strings denoting the [string-based paths](https://ravendb.net/docs/article-page/5.3/Csharp/client-api/how-to/handle-document-relationships#path-conventions) to related document properties.
- **certificate** (optional): a certificate generated for your RavenDB instance that at least has read permissions granted. This is only required if your RavenDB instance is secured.
- **key** (optional): the key that pairs with the certificate provided in the `certificate` option. Similar to the `certificate`, the key is only required if your RavenDB instance is secured.

## FAQ

Q: **Where can I find the id of my RavenDB document in a Gatsby node?**

A: Because Gatsby nodes also have a property called `id`, you'll find your RavenDB document id in `_id`. The exact same property is also found nested in `_metadata`.

Q: **I get the message, `The gatsby-source-ravendb plugin has generated no Gatsby nodes. Do you need it?`.**

A: You've likely made a mistake configuring the plugin. Please make that the options you've included match up with a database in RavenDB.