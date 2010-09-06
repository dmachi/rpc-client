var print = require("promised-io/process").print,
	transports = require("./transports");
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
	print("do Mixin");
	for(var svcName in smd.services){
		print("svcName: " + svcName);
		if (obj[svcName] && options && !options.overwrite){
			throw Error("Service instance already contains a property '" + svcName + "'");
		}
		obj[svcName] = generateService(svcName, smd.services[svcName], smd, options);
	}	

	return obj;
}

function generateService(svcName, service, smd, options ){
	print("Generating Service: " + svcName);
	return function(){
		print("Service Method Called: " + svcName);
		print("Arguments: ");
		for(var i=0;i<arguments.length;i++){
			print("     ->" + arguments[i]);
		}
		var executor =  (options && options.executor) ? options.executor.call(this, svcName, service, smd, options, arguments) : Executor.call(this, svcName, service, smd, options, arguments);

		return (options && options.executor) ? options.executor.call(this, svcName, service, smd, options, arguments) : Executor.call(this, svcName, service, smd, options, arguments);
	}
}

	
var Executor = exports.Executor = function(svcName, service, smd, options, rawArgs){
	print('Execute: ' + svcName);
	var transport,args=[],
		transportId = service.transport || smd.transport || "GET";

	for (var i in rawArgs){
		print("Arg: " + i + " : " + rawArgs[i]);
		args.push(rawArgs[i]);
	}

	print("Lookup transport: " + transportId);	
	if (options && options.transport && options.transport[transportId]){
		transport = options.transport[transportId];
	}else{
		transport = transports[transportId];
	}

	if (!transport){
		//return promise and errback?
		throw Error("Transport: " + transportId + " not found.");
	}

	return transport(svcName, service, smd, options, args);
}

exports.qt = function(){
	var x = new Service(google);
	print("Service Methods: ");
	for (var i in x){
		print("  --> " + i);
	}
	require("promise").when(x.webSearch({q: "dojo",rsz:"large"}),function(results){ 
		print("Success: " + results);
		//for (var i in results){
		//	print("    ->" + i + "  : " + results[i]);
		//}
	}, function(err){
		print("Error: " + err.statue);
	});
	return x;
}


