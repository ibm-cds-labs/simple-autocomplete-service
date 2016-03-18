module.exports = function () {
  var redis = require('redis'),
  credentials = require('./bmservice.js').getCredentials(/^Redis by Compose/) || { username: "", password: "", public_hostname: "localhost/6379"};
  bits = credentials.public_hostname.split('/'),
  hostname = bits[0],
  port = parseInt(bits[1]),
  client = redis.createClient(port, hostname);
  client.auth(credentials.password);
  console.log("Connecting to Redis server on", credentials.public_hostname);  
  return client;
};