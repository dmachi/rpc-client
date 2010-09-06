var print = require("promised-io/process").print,
	JSONExt = require("commonjs-utils/json-ext"),
	getDefaultParams = require("./util").getDefaultParams,
	mix = require("./util").mix;
	objectToQuery = require("./util").objectToQuery;

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

exports["URL"] = function(svcName, service, smd, options, args){
	return {
		serialize: function(){
			var params = mix({},getDefaultParams(svcName,smd), args[0]);
			print("params: " + params);
			return objectToQuery(params);	
		},

		deserialize: function(results){
			return results;
		}
	}
}
