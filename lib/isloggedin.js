module.exports = function() {
    
  return function(req, res, next) {
    // on;y allow access to restricted pages if we are not in lockdown mode
    if (typeof process.env.LOCKDOWN == "string" && process.env.LOCKDOWN == "true") {
      res.status(403).send({"ok": false, err: "Lockdown mode"});
    } else {
      next();
    }
  };
    
};