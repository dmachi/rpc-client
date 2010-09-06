var print = require("promised-io/process").print,
	envelopes = require("./envelopes"),
	defer = require("promise").defer,
	when = require("promise").when,
	getTarget = require("./util").getTarget,
	getEnvelope = require("./util").getEnvelope,
	xhr = require("promised-io/http-client").request;

exports.JSONP = exports.GET = function(svcName, service, smd, options, args){
	var envelope = getEnvelope(svcName, service, smd, options, args);
	var uri = getTarget(svcName,smd) + "?" + envelope.serialize();	
	var def = new defer();
	xhr({url:uri, encoding:"binary"}).then(function(response){
		if(response.status == 302){
			return getUri(response.headers.location);
		}
		if(response.status < 300){
			var body = "";
			return when(response.body.forEach(function(part){
				if(!body){
					body = part;
				}else{
					body += part;
				}
			}), function(){
				def.resolve(envelope.deserialize(body));
			});
		}
		if(response.status == 404){
			def.reject(response, true);
		}
	}, function(error){
		def.reject(error, true);
	});

	return def;
}
