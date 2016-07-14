# digenti-api

DIGENTI REST API.

More info soon.

## Installation

Run the following command from inside the app directory:

```
npm install
```

This will install all dependencies.

## Config

You will need to enter some configuration parameters within a `config.js` file, placed in the main folder.

- Rename `config.sample.js` to `config.js` or create a copy by this name.


## Usage

```
npm start
```

And check the server in:

or

```
node server.js
```

Test in the browser:

```
http://localhost:61002
```

If everything is ok, you should see:

```
{"status":"success","message":"Live long and prosper!"}
```

## Setting up your queries

- `api/here.js`: HERE API functions and exports.
- `api/postgres.js`: Postgres DIGENTI database functions and exports.
- `api/index.js`: connect the functions to the permalinks.

## HERE REST APIs

- [Routing API Reference](https://developer.here.com/rest-apis/documentation/routing/topics/api-reference.html)
- [Calculate isoline](https://developer.here.com/rest-apis/documentation/routing/topics/resource-calculate-isoline.html)
- [Calculate route](https://developer.here.com/rest-apis/documentation/routing/topics/resource-calculate-route.html)

## Dependencies

- [turf.js](https://github.com/Turfjs/turf)
- [concaveman](https://github.com/mapbox/concaveman)
- [Express](http://expressjs.com/)
