//simple orchestration
module.exports = function() {

	if (typeof process.env.ETCD_URL !== "string" || !process.env.ETCD_URL) {
		var events = require('events');
		return {
			register: function() {
				console.log("SOS: No Etcd URL provided")
			},
			service: function() {
				console.log("SOS: No Etcd URL provided")
				return new events.EventEmitter();
			},
			env: function() {
				console.log("SOS: No Etcd URL provided")
				return new events.EventEmitter();
			}
		}
	}

	return new require('simple-orchestration-js')({ 
    url: process.env.ETCD_URL,
    cert: "cert.ca"
  })

}