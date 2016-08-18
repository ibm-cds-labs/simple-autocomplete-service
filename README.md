# Simple Autocomplete Service

A Node.js app that uses an attached [Redis](http://redis.io/) database to provide an autocomplete API for data uploaded as text files. Multiple separate autocomplete indexes are supported.

![demo gif](https://raw.githubusercontent.com/ibm-cds-labs/simple-autocomplete-service/master/public/img/autocomplete.gif)

The autocomplete API is CORS-enabled, so that it can be accessed from any web page and conforms to the [jQuery autocomplete](http://api.jqueryui.com/autocomplete/) standard.

## Running the app on Bluemix

The fastest way to deploy this application to Bluemix is to click the **Deploy to Bluemix** button below.


[![Deploy to Bluemix](https://deployment-tracker.mybluemix.net/stats/be01814a6566e37954fce065bd643264/button.svg)](https://bluemix.net/deploy?repository=https://github.com/ibm-cds-labs/simple-autocomplete-service)

**Don't have a Bluemix account?** If you haven't already, you'll be prompted to sign up for a Bluemix account when you click the button.  Sign up, verify your email address, then return here and click the the **Deploy to Bluemix** button again. Your new credentials let you deploy to the platform and also to code online with Bluemix and Git. If you have questions about working in Bluemix, find answers in the [Bluemix Docs](https://www.ng.bluemix.net/docs/).

## Running the app locally
Clone this repository then run `npm install` to add the Node.js libraries required to run the app.

You will also need to have access to a [Redis](http://redis.io/) server (either running locally, or elsewhere).

You will then need to set some environemt variables to tell the Simple Autocomplete Service how to connect to your Redis server:

* `export SAS_REDIS_HOST='localhost/6379'` - This is required, but does not have to be localhost
* `export SAS_REDIS_USERNAME='redis_username'` - This is not required, depends on your Redis server
* `export SAS_REDIS_PASSWORD='redis_password'` - This is not required, depends on your Redis server

Then run:

```sh
node app.js
```

## Service Registry

The Service Registry allows the Simple Autocomplete Service to be utilised by the [Simple Search Service](https://github.com/ibm-cds-labs/simple-search-service) to implement autocompletes from within the Search Service UI. This is achieved by using the [Simple Service Registry](https://github.com/mattcollins84/simple-service-registry) module.

### Enabling the Service Registry

Enabling the Service Registry requires setting an environment variable, `ETCD_URL`. This should be the URL of your Etcd instance including any basic HTTP authentication information

```
export ETCD_URL='http://username:password@etcd.exmple.com'
```

If the Service Registry is enabled, the Simple Autocomplete Service will become discoverable by the Simple Search Service.

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

If you wish to edit your data, but do not want to disable lockdown mode, you can set two more environment variables:

* `SAS_LOCKDOWN_USERNAME`
* `SAS_LOCKDOWN_PASSWORD`

When these are set, you will be able to access the UI and the API by providing a matching username and password. If you are accessing the UI via your browser, you will be prompted to enter the username and password, if you are accessing the API, you can provide these details as part of your request:

```bash
curl -X GET http://<yourdomain>/api --user <username>:<password>
```