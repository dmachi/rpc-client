var print = require("promised-io/process").print;
var JSONExt = require("commonjs-utils/json-ext");

exports["JSON"] = function(svcName, service, smd, options, args){
	return {
		serialize: function(){	
			return JSONExt.stringify(args) 
		},

		deserialize: function(results){
			return JSONExt.parse(results);
		}
	}
}

var mix = function(){
	var out = arguments[0]||{};
	for (var x=1;x<arguments.length;x++){
		var arg = arguments[x];
		for (var p in arg){
			print("p: " + p + " v: " +arg[p]);
			out[p]=arg[p];
		}
	}
	return out;
}

exports["URL"] = function(svcName, service, smd, options, args){
	return {
		serialize: function(){
			var queryString = "",
				params = {};

			if (service.parameters){
				service.parameters.forEach(function(p){
					print("p: " + JSONExt.stringify(p));
					if (p['default']){
						params[p.name]=p['default'];
					}
				});
			}	

			if (smd.parameters){
				smd.parameters.forEach(function(p){
					print("p: " + JSONExt.stringify(p));
					if (p['default']){
						params[p.name]=p['default'];
					}
				});
			}	
			var params = mix(params,args[0]);
			for (var p in params){
				print("p: " + p);
				queryString += ((queryString.length<2)?"":"&") + p + "=" + params[p];
			}		
			print("queryString: " + queryString);
			return queryString;
		},

		deserialize: function(results){
			return results;
		}
	}

