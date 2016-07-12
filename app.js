var express = require('express'),
  cors = require('cors'),
  multer = require('multer'),
  compression = require('compression'),
  isloggedin = require('./lib/isloggedin.js'),
  autocomplete = require('./lib/autocomplete.js');

//simple orchestration
const sos = new require('simple-orchestration-js')({ 
  url: process.env.ETCD_URL,
  cert: "cert.ca"
});

sos.register("cds", "s-a-s", { url: "http://localhost:6003"}, { ttl: 10 });

// Use Passport to provide basic HTTP auth when locked down
var passport = require('passport');
passport.use(isloggedin.passportStrategy());

// multi-part uploads 
var multipart = multer({ dest: process.env.TMPDIR, limits: { files: 1, fileSize: 100000000 }});
 
// posted body parser
var bodyParser = require('body-parser')({extended:true})

// cfenv provides access to your Cloud Foundry environment
var cfenv = require('cfenv');

// create a new express server
var app = express();

// compress all requests
app.use(compression());

// get the public UI
app.get("/", isloggedin.auth, function(req,res) {
  res.sendFile(__dirname + '/public/index.html');
});

app.get("/index.html", isloggedin.auth, function(req,res) {
  res.sendFile(__dirname + '/public/index.html');
});

app.get("/autocomplete.html", isloggedin.auth, function(req,res) {
  res.sendFile(__dirname + '/public/autocomplete.html');
});

app.get("/doc.html", isloggedin.auth, function(req,res) {
  res.sendFile(__dirname + '/public/doc.html');
});

// import a new data set either with a file upload or a url parameter
// :name - the name of the data set to upload
// file - the uploaded file
// url - the url of the file to fetch
app.post('/api/:name', isloggedin.auth, multipart, function(req, res) {
  if (req.files && typeof req.files.file == 'object') {
    console.log("Import from file", req.files.file.path,"into index",req.body.name)
    autocomplete.importFile(req.files.file.path, req.params.name, function(err, data) {
      res.send({ok:true, summary: data});
    });
  } else if (req.body && req.body.name && req.body.url) {
    console.log("Import from URL", req.body.url,"into index",req.body.name)
    autocomplete.importURL(req.body.url, req.body.name, function(err, data) {
      res.send({ok:true}); 
    }); 
  } else {
    res.status(404).send({ok: false});
  }
});

// add a new value to an existing data set
app.put('/api/:name', isloggedin.auth, bodyParser, function(req, res) {
  
  autocomplete.append(req.params.name, req.body.term, function(err, data) {
    if (err) {
      return res.send(err);
    }
    res.send({ ok: true })
  })

});

// get a list of data sets
app.get("/api", isloggedin.auth, function(req,res) {
  autocomplete.list(function(err,data) {
    if (err) {
      return res.send([]);
    }
    res.send(data);
  });
});

// query the data set ":name".
// :name - the name of the data set to query
// term - the search term 
app.get("/api/:name", cors(), function(req,res) {
  autocomplete.query(req.params.name, req.query.term, function(err, data) {
    if (err) {
      return res.send([]);
    } 
    res.send(data);
  }); 
});

// delete a data set
// :name - the name of the data set to deletes
app.delete("/api/:name", isloggedin.auth, function(req, res) {
  autocomplete.deleteIndex(req.params.name, function(err, data) {
    res.send({"ok": true});
  });
});

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {

	// print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});

require("cf-deployment-tracker-client").track();