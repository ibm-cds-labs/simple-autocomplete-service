var getCredentials = function(service) {
  
  /****
    VCAP_SERVICES
    This is Bluemix
  ****/
  if (typeof process.env.VCAP_SERVICES === 'string') {
    console.log("Using Bluemix config for Cloudant")
    var services = process.env.VCAP_SERVICES;
    if (typeof services != 'undefined') {
      services = JSON.parse(services);
    }
  }

  // Not Bluemix, so create empty services object
  else {
    var services = {};
  }

  // SAS_REDIS_HOST
  // This is local configuration
  // append to existing services
  if (typeof process.env.SAS_REDIS_HOST === 'string') {
    console.log("Using local config for Redis")
    services["user-provided"] = [
      {
        name: "Redis by Compose",
        credentials: {
          public_hostname: process.env.SAS_REDIS_HOST,
          username: process.env.SAS_REDIS_USERNAME || "",
          password: process.env.SAS_REDIS_PASSWORD || ""
        }
          
      }
    ]

  }

  // Find required service
  for(var i in services["user-provided"]) {
    if (services["user-provided"][i].name.match(service)) {
      return services["user-provided"][i].credentials;
    }
  }
  return null;
};

module.exports = {
  getCredentials: getCredentials
}