# gatsby-source-ravendb

A source plugin for pulling data from RavenDB documents into a Gatsby application.

## How to install

Run the following command in the root directory of your Gatsby application:

```npm install gatsby-source-ravendb```

or, if you're using Yarn:

```yarn add gatsby-source-ravendb```

## Example

>The following example will use the `Northwind` sample data from RavenDB (see [here](https://ravendb.net/docs/article-page/5.3/csharp/studio/database/tasks/create-sample-data) for instructions to create).

### Configuring the plugin

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

> See [plugin options](#plugin-options) for more details about each configurable option.

### Querying the data

With the data now available in your application, you can access it via the graphql API.

```graphql
{
  allProduct(limit: 1) {
    nodes {
      Name
      UnitsInStock
      PricePerUnit
    }
  }
  allOrder(limit: 1) {
    nodes {
      Lines {
        Product
        ProductName
      }
      ShipVia
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
          "PricePerUnit": 18
        }
      ]
    },
    "allOrder": {
      "nodes": [
        {
          "Lines": [
            {
              "Product": "products/11-A",
              "ProductName": "Queso Cabrales"
            },
            {
              "Product": "products/42-A",
              "ProductName": "Singaporean Hokkien Fried Mee"
            },
            {
              "Product": "products/72-A",
              "ProductName": "Mozzarella di Giovanni"
            }
          ],
          "ShipVia": "shippers/3-A",
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
  - **node**: the name you'd like to give to the graphql nodes.
- **certificate** (optional): a certificate generated for your RavenDB instance that at least has read permissions granted. This is only required if your RavenDB instance is secured.
- **key** (optional): the key that pairs with the certificate provided in the `certificate` option. Similar to the `certificate`, the key is only required if your RavenDB instance is secured.

## FAQ

Q: **Where can I find the id of my RavenDB document in a Gatsby node?**

A: Because Gatsby nodes also have a property called `id`, you'll find your RavenDB document id in `_id`. The exact same property is also found nested in `_metadata`.

Q: **I get the message, `The gatsby-source-ravendb plugin has generated no Gatsby nodes. Do you need it?`, while building my application. I'm sure I've configured the plugin properly but none of my documents are showing up - what's going on?**

A: Sometimes the order of your plugins matters. In my experience, this plugin doesn't generate nodes if it comes after the `gatsby-source-filesystem` plugin. Try placing the configuration for `gatsby-source-ravendb` higher in the list of plugins and see if that makes a difference. 