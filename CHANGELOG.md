# Change Log
All notable changes to this project will be documented in this file.

## [Unreleased]
*(nothing new upcoming)*

---

## [1.1.0](https://www.npmjs.com/package/gatsby-source-ravendb/v/1.1.0) - 2022-07-07
### Added
- [#2](https://github.com/theandrewgrass/gatsby-source-ravendb/issues/2) Use RavenDB 'includes' feature to query for nested documents and include them when creating nodes

---

## [1.0.2](https://www.npmjs.com/package/gatsby-source-ravendb/v/1.0.2) - 2022-06-29
### Fixed
- Resolved issue where would fail to build if trying to fetch documents from cache
- Resolved issue where Gatsby build process would continue without waiting for nodes to finish being created

---

## [1.0.0](https://www.npmjs.com/package/gatsby-source-ravendb/v/1.0.0) - 2022-06-27
### Added
- Basic functionality for creating nodes from documents in RavenDB collections
- Use of etags so that previous query results can be cached for faster builds
- README with examples
