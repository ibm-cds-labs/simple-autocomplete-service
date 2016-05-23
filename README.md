# Simple Autocomplete Service

A Node.js app that uses an attached Redis database to provide an autocomplete API for data uploaded as text files. Multiple separate autocomplete indexes are supported.

![demo gif](https://raw.githubusercontent.com/ibm-cds-labs/simple-autocomplete-service/master/public/img/autocomplete.gif)

The autocomplete API is CORS-enabled, so that it can be accessed from any web page and conforms to the [jQuery autocomplete](http://api.jqueryui.com/autocomplete/) standard.

## Running the app on Bluemix

The fastest way to deploy this application to Bluemix is to click the **Deploy to Bluemix** button below.


[![Deploy to Bluemix](https://deployment-tracker.mybluemix.net/stats/be01814a6566e37954fce065bd643264/button.svg)](https://bluemix.net/deploy?repository=https://github.com/ibm-cds-labs/simple-autocomplete-service)

**Don't have a Bluemix account?** If you haven't already, you'll be prompted to sign up for a Bluemix account when you click the button.  Sign up, verify your email address, then return here and click the the **Deploy to Bluemix** button again. Your new credentials let you deploy to the platform and also to code online with Bluemix and Git. If you have questions about working in Bluemix, find answers in the [Bluemix Docs](https://www.ng.bluemix.net/docs/).

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

### POST /api/:name

Parameters, one of:

* file - the text file containing a list of items to be added to the auto-complete index
* or, url - the url of the file containing a list of items to be added to the auto-complete index

N.B the form type needs to be `enctype="multipart/form-data"`

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

