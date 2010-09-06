var print = require("promised-io/process").print,
	envelopes = require("./envelopes"),
	defer = require("promise").defer,
	when = require("promise").when;

var getEnvelope = function(svcName, service, smd, options, args, defaultEnvelope){
	print("getEnvelope Args: " + args);
	var envelope,
		envelopeId= service.envelopeId || smd.envelope || defaultEnvelope;
	
	if (options && options.envelope && options.envelope[envelopeId]){
		envelope = options.envelope[envelopeId];
	}else{
		envelope = envelopes[envelopeId];
	}

	if (!envelope){
		//return promise and errback?
		throw Error("Envelope: " + envelopeId + " not found.");
	}
	return envelope(svcName, service, smd, options, args);
}

exports.JSONP = exports.GET = function(svcName, service, smd, options, args){
	print("GET Args: " + args);
	var envelope = getEnvelope(svcName, service, smd, options, args);
	//var uri = service.target || "http://localhost/~dmachi/st.json";
	var uri = service.target + "?" + envelope.serialize();	
	print("service target: " + uri);
	var def = new defer();
	require("promised-io/http-client").request({url:uri, encoding:"binary"}).then(function(response){
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
