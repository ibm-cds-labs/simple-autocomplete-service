var redis = require('./redis.js')(),
  utils = require('./utils.js'),
  async = require('async'),
  MAX_CHARACTERS = 15,
  MAX_INDEX_LINES = 75,
  stub = "SAS_";


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

var importFile = function(path, name, callback) {
  var stringcount=0,
    keycount=0;
    var key = stub + name;
  var q = async.queue(function(str, done) {
    console.log("str",str)
    var lcstring = utils.filter(str).trim();
    console.log("lcstring",lcstring)
    var multi = redis.multi();
    var top = Math.max(lcstring.length-1, MAX_CHARACTERS);
    for(var i = lcstring.length-1; i>=1; i--) {
      var bit = lcstring.substr(0, lcstring.length - i);
      console.log(bit);
      keycount++;
      multi.zadd(key, 0, bit.trim())
    }
    multi.zadd(key, 0, lcstring+"*"+str);
    multi.exec(done);
    stringcount++;
  },1)
  
  var lineReader = require('readline').createInterface({
    input: require('fs').createReadStream(path)
  });

  lineReader.on('line', function (line) {
    q.push(line);
  });

  q.drain = function() {
    callback(null, {stringcount: stringcount, keycount:keycount});
  }
};

var deleteIndex = function(name, callback) {
  redis.del(stub + name, function(err, data) {
    console.log(err, data);
    callback(err,data);
  })
}

module.exports = {
  query: query,
  list: list,
  importFile: importFile,
  deleteIndex: deleteIndex
}
