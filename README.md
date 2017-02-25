# digenti-api

DIGENTI REST API.


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

## Setting up the PostGRE / PostGIS Database

- https://redmine.geoway.de/projects/digenti/wiki/Notes

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

## License

You may use this code under the terms of the MIT License. See http://en.wikipedia.org/wiki/MIT_License for more information.

If you make enhancements or changes we would love to hear from you.

Copyright (C) 2017 Jordi Tost, Fabian Ehmel, and contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
