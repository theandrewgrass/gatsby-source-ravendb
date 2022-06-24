# gatsby-source-ravendb

Source plugin for pulling data from RavenDB documents into Gatsby.

## How to use

```javascript
// In your gatsby-config.js

module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-ravendb`,
      options: { 
        serverUrl: process.env.RAVEN_SERVER_URL, 
        databaseName: process.env.RAVEN_DATABASE_NAME,
        collections: [ 
          { name: "Products", node: "Product" },
          { name: "Reviews", node: "Review" },
        ],
        certificate: fs.readFileSync('./raven.crt'),
        key: fs.readFileSync('./raven.key'),
      },
    },
  ]
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

warn The gatsby-source-ravendb plugin has generated no Gatsby nodes. Do you need it?
Q: **I get the message, `The gatsby-source-ravendb plugin has generated no Gatsby nodes. Do you need it?`, while building my application. I'm sure I've configured the plugin properly but none of my documents are showing up - what's going on?**

A: Sometimes the order of your plugins matters. In my experience, this plugin doesn't generate nodes if it comes after the `gatsby-source-filesystem` plugin. Try placing the configuration for `gatsby-source-ravendb` higher in the list of plugins and see if that makes a difference. 