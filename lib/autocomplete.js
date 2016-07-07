var redis = require('./redis.js')(),
  request = require('request'),
  fs = require('fs'),
  utils = require('./utils.js'),
  async = require('async'),
  MAX_CHARACTERS = 15,
  MAX_INDEX_LINES = 75,
  stub = process.env.STUB || "SAS_";

// query a pre-loaded data set
// key - the name of the index (which indicates the Redis key)
// str - the search string
var query = function(key, str, callback) {
  str = utils.filter(str).trim();
  str = str.substr(0, MAX_CHARACTERS);
  redis.zrank(stub+key, str, function(err, data) {
    if (err || data == null) {
      return callback(true, null);
    }
    redis.zrange(stub+key, data, data + MAX_INDEX_LINES, function(err, data) {
      if (err) {
        return callback(true, null);
      }
      var retval = [];
      for(var i in data) { 
        var match = data[i].match(/(.*)\*(.*)/)
        if (match) {
          if(match[1].indexOf(str) !=0) {
            break;
          }
          retval.push(match[2])
        }
      }
      callback(null, retval);
    })
  });
};

// get a list of the uploaded data sets
var list = function(callback) {
  redis.keys(stub+"*", function(err, data) {
    if (err || data == null) {
      return callback(true, null);
    }
    for(var i in data) {
      data[i] = data[i].substr(stub.length);
    }
    callback(null, data);
  })
};

// import a stream of data
// rs - a read stream object
// name - the name of the index to create
var importStream = function(rs, name, callback) {
  var stringcount=0,
    keycount=0;
    var key = stub + name;
  var q = async.queue(function(str, done) {
    var lcstring = utils.filter(str).trim();
    var multi = redis.multi();
    var top = Math.max(lcstring.length-1, MAX_CHARACTERS);
    for(var i = lcstring.length-1; i>=1; i--) {
      var bit = lcstring.substr(0, lcstring.length - i);
      keycount++;
      multi.zadd(key, 0, bit.trim())
    }
    multi.zadd(key, 0, lcstring+"*"+str);
    multi.exec(done);
    stringcount++;
  },1);
  
  var lineReader = require('readline').createInterface({
    input: rs
  });

  lineReader.on('line', function (line) {
    q.push(line);
  });

  q.drain = function() {
    callback(null, {stringcount: stringcount, keycount:keycount});
  };
};

// import a data set from a remote url
// url - the url to load
// name - the nam of the index to create
var importURL = function(url, name, callback) {
  var rs = request.get(url);
  importStream(rs, name, callback);
};

// import a data set from an file
// path - the path of the file
// name - the name of the index to create
var importFile = function(path, name, callback) {
  var rs = fs.createReadStream(path);
  importStream(rs, name, callback);
}

// delete an index
// name - the name of the index to delete
var deleteIndex = function(name, callback) {
  redis.del(stub + name, function(err, data) {
    callback(err,data);
  })
}

var append = function(name, str, callback) {

  var key = stub + name;
  var lcstring = utils.filter(str).trim();
  var multi = redis.multi();
  for(var i = lcstring.length-1; i>=1; i--) {
    var bit = lcstring.substr(0, lcstring.length - i);
    multi.zadd(key, 0, bit.trim())
  }
  multi.zadd(key, 0, lcstring+"*"+str);
  multi.exec(callback);

}

module.exports = {
  query: query,
  list: list,
  importFile: importFile,
  importURL: importURL,
  deleteIndex: deleteIndex,
  append: append
}
