var JSONExt = require("commonjs-utils/json-ext"),
	getDefaultParams = require("./util").getDefaultParams,
	mix = require("./util").mix,
	objectToQuery = require("promised-io/queryString").toQueryString;

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
			var params = mix({},getDefaultParams(svcName,smd,options), args[0]);
			return objectToQuery(params);	
		},

		deserialize: function(results){
			return results;
		}
	}
}
