# Change Log
All notable changes to this project will be documented in this file.

## [Unreleased]
*nothing new coming up*

## [1.0.1] - 2022-06-28
### Fixed
- Resolved issue where Gatsby build process would continue without waiting for nodes to finish being created

## [1.0.0] - 2022-06-27
### Added
- Basic functionality for creating nodes from documents in RavenDB collections
- Use of etags so that previous query results can be cached for faster builds
- README with examples