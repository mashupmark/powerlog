# PowerLog

A simple offline first web app to track time spent on projects of different customers

## Philosophy

The idea of this application is to support individuals with tracking the time they worked.
It is supposed to be deployed on a self owned on premise server with no access from the public internet.
This is a deliberate decision for keeping the application minimal and simple, e.g. by not supporting multiple users or complex authentication.
If this is needed a reverse proxy in front of the app should take care of auth.

The design of the App is intended to be offline first. All data is stored within an on device database powered by [pouchdb](https://pouchdb.com/).
This local db is synced with a remote [CouchDB](https://couchdb.apache.org/) instance.
If the remote db isn't reachable e.g. because the user is outside of the trusted network the local first paradigm will make sure all information is stored and can be synced back to the db once it's reachable again.

## Features

- Full offline support thanks to pouchdb
- Support for different operating systems thanks to it being a PWA
- Simple logging of working time with the option of assigning a customer & project to the log
- Reporting for individual projects for easy accounting
- Calendar sync via the exposed `/api/ics` endpoint

## Installation

The recommended way of installation is by using docker. E.g. this is an example docker compose config for running both the PowerLog image together with a CouchDB:

```yaml
services:
  powerlog:
    image: ghcr.io/mashupmark/powerlog:latest
    container_name: powerlog
    ports:
      - 3000:3000
    environment:
      - NUXT_COUCH_DB_URL=http://couchDB:5984/
      - NUXT_COUCH_DB_USER=admin
      - NUXT_COUCH_DB_PASSWORD=admin

  couchDB:
    image: couchdb:3.5.1
    container_name: powerlog-db
    ports:
      # - 5984:5984 # Optionally expose the CouchDB interface to the host as well
    volumes:
      - powerlog-data:/opt/couchdb/data
    configs:
      - source: db_config
        target: /opt/couchdb/etc/local.ini

configs:
  # Config for the CouchDB to start up automatically without manual setup
  db_config:
    content: |
      [couchdb]
      single_node = true

      [admins]
      admin = admin

volumes:
  powerlog-data:
```

## Contributing

### Versioning

This repo is versioned using [Changesets](https://changesets.dev), so please add a changeset by running `pnpm changeset add` to your PR before publishing it.
Describe what you did inside it so it will end up in the changelog during release.
