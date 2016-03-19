# Simple Autocomplete Service

A Node.js app that uses an attached Redis database to provide an autocomplete API for data uploaded as text files. Multiple separate autocomplete indexes are supported.

![demo gif](https://raw.githubusercontent.com/glynnbird/simple-autocomplete-service/master/public/img/demo.gif)

The autocomplete API is CORS-enabled, so that it can be accessed from any web page and conforms to the [jQuery autocomplete](http://api.jqueryui.com/autocomplete/) standard.

## API

### GET /api

Returns a JSON array of autocomplete indexes that are available

e.g.

```js
[]
```

or 

```
["animals","trees","actors"]
```

### GET /api/:name?term=

Parameters

* term - the search term to autocomplete

Returns a JSON array of possible autocompletions

e.g.

```
["Pedro","Pejman Montazeri","Pepe Reina","Pepe","Per Mertesacker","Peter Odemwingie"]
```

### POST /api/:name (multi-part file upload)

Parameters

* file - the text file containing a list of items to be added to the auto-complete index


### DELETE /api/:name

Delete the named autocomplete index.

## Lockdown mode

If you have uploaded your content into the Simple Autocomplete Service but now want only the `GET /api/:name` endpoint to continue working, then you can enable "Lockdown mode".

Simply set an environment variable called `LOCKDOWN` to `true` before running the Simple Autocomplete Service:

```sh
export LOCKDOWN=true
node app.js
```

or set a custom environment variable in Bluemix.

This prevents your data being modified until lockdown mode is switched off again, by removing the environment variable.

