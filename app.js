/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express'),
  cors = require('cors'),
  multer = require('multer'),
  compression = require('compression'),
  isloggedin = require('./lib/isloggedin.js'),
  autocomplete = require('./lib/autocomplete.js');

// multi-part uploads 
var multipart = multer({ dest: process.env.TMPDIR, limits: { files: 1, fileSize: 100000000 }});
 
// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// posted body parser
//var bodyParser = require('body-parser')({extended:true})

// compress all requests
app.use(compression());

app.get("/", isloggedin(), function(req,res) {
  res.sendFile('./public/index.html');
});

// upload  CSV
app.post('/api/:name',  isloggedin(), multipart, function(req, res) {
  var obj = {
    files: req.files,
    body: req.body,
  };
  console.log(obj);
  autocomplete.importFile(obj.files.file.path, req.params.name, function(err, data) {
    res.send({ok:true, summary: data});
  });
});

app.get("/api", function(req,res) {
  autocomplete.list(function(err,data) {
    res.send(data);
  });
});

app.get("/api/:name", cors(), function(req,res) {
  autocomplete.query(req.params.name, req.query.term, function(err, data) {
    if( err) {
      res.send([]);
    } else {
      res.send(data);
    }
  }); 
});

app.del("/api/:name", function(req, res) {
  autocomplete.deleteIndex(req.params.name, function(err, data) {
    res.send({"ok": true});
  });
});

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {

	// print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
