var JSONExt = require("commonjs-utils/json-ext"),
	print = require("promised-io/process").print,
        resolveUri= require('narwhal/uri').resolveObject,
	envelopes = require('./envelopes');

exports.getDefaultParams = function(svcName, smd){
	var params = {},
		parmList = [],
		service = smd.services[svcName];

	if (smd.parameters){
		parmList.push(smd.parameters);
	}

	if (service && service.parameters){
		parmList.push(smd.parameters);
	}

	parmList.forEach(function(list){
		list.forEach(function(p){
			if (p['default']){
				params[p.name]=p['default'];
			}
		});
	});

	return params;
}

exports.mix = function(){
	var out = arguments[0]||{};
	for (var x=1;x<arguments.length;x++){
		var arg = arguments[x];
		for (var p in arg){
			out[p]=arg[p];
		}
	}
	return out;
}

exports.objectToQuery = function(obj){
	var queryString="";
	for (var p in obj){
		queryString += ((queryString.length<2)?"?":"&") + p + "=" + obj[p];
	}	
	return queryString;
}

exports.getTarget = function(method, smd){
	var dest=smd.target || "/";
	if(smd.target){
		dest = resolveUri(dest,smd.target).toString();
	}
	if(smd.services[method].target){
		var target= smd.services[method].target;
		dest = resolveUri(dest,target).toString();
	}
	return dest;
};

exports.toOrdered=function(parameters, args){
	if(dojo.isArray(args)){ return args; }
	var data=[];
	for(var i=0;i<parameters.length;i++){
		data.push(args[parameters[i].name]);
	}
	return data;
};

exports.getEnvelope = function(svcName, service, smd, options, args, defaultEnvelope){
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
