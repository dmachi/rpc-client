var transports = require("./transports"),
	google = require("./google").smd;


var Service = exports.Service = function(smd, options){
	// Optional Service base, attachService can be applied to any object.
	mixin(this, smd, options);

}

var mixin = exports.mixin = function(obj, smd, options){
	// obj - the object we are going to mix into
	// smd - the smd or an object containing references to where to get it
	// options - various options passed down throughout this process
	//	overwrite - if true already existing props will be overwritten, otherwise they will throw an error.
	for(var svcName in smd.services){
		if (obj[svcName] && options && !options.overwrite){
			throw Error("Service instance already contains a property '" + svcName + "'");
		}
		obj[svcName] = generateService(svcName, smd.services[svcName], smd, options);
	}	

	return obj;
}

function generateService(svcName, service, smd, options ){
	return function(){
		//for(var i=0;i<arguments.length;i++){
		//	console.log("     ->", arguments[i]);
		//}
		var executor =  (options && options.executor) ? options.executor.call(this, svcName, service, smd, options, arguments) : Executor.call(this, svcName, service, smd, options, arguments);
		return executor;
	}
}

	
var Executor = exports.Executor = function(svcName, service, smd, options, rawArgs){
	//console.log("call executor: ", svcName, rawArgs);
	var transport,args=[],
		transportId = service.transport || smd.transport || "GET";

	for (var i in rawArgs){
		args.push(rawArgs[i]);
	}

	//console.log('transportId: ', transportId, options);

	if (options && options.transport && options.transport[transportId]){
		transport = options.transport[transportId];
	}else{
		transport = transports[transportId];
	}

	if (!transport){
		//return promise and errback?
		throw Error("Transport: " + transportId + " not found.");
	}
	//console.log("call transport");
	return transport(svcName, service, smd, options, args);
}

exports.qt = function(){
	var x = new Service(google);
	console.log("Service Methods: ");
	for (var i in x){
		console.log("  --> " + i);
	}
	require("promise").when(x.webSearch({q: "dojo",rsz:"large"}),function(results){ 
		console.log("Success: " + results);
		//for (var i in results){
		//	console.log("    ->" + i + "  : " + results[i]);
		//}
	}, function(err){
		console.log("Error: " + err.statue);
	});
	return x;
}


