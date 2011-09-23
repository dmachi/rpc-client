var envelopes = require("./envelopes"),
	defer = require("promise").defer,
	when = require("promise").when,
	getTarget = require("./util").getTarget,
	getEnvelope = require("./util").getEnvelope,
	xhr = require("promised-io/http-client").request,
	xml2js = require('xml2js/xml2js');

exports.smd = {
	"SMDVersion": "2.0",
	"description": "Authorize.net AIM API",
	"transport": "AuthorizeNetCIM",
	"envelope": "URL",
	"additionalParameters": true,
	"target": "https://api.authorize.net/xml/v1/request.api",
	"parameters": [
		//custom authentication 
		{ 
			"name": "merchantAuthentication", 
			"description": "Authentication Block",
			"type": "object",
			"properties": {
				"name":{"type": "string", "description": "Login Id", "optional": false},
				"transactionKey":{"type": "string", "description": "Merchant Transaction Key","optional": false}
			},
			"optional": false 
		},
		{
			"name": "refId",
			"description": "Merchant assigned referecne ID for the request",
			"optional": true
		}	
	],

	"services": {
		"createCustomerProfile": {
			"parameters": [
				{
					"name": "profile",
					"description": "Customer Profile",
					"type": "object",
					"properties": {	
						"email":{"optional": false},
						"description":{"optional": true},
						"merchantCustomerId":{"optional": true}
					}
				}
			]
		},

		"createCustomerPaymentProfile":{
			"parameters": [
				{"name":"customerProfileId", optional: false},
				{
					"name":"paymentProfile", 
					"optional": false,
					"properties":{
						"customerType":{optional: true},
						"billTo": {
							"type": "object", 
							"optional": false,
							"properties": {
								"firstname":{"optional": true},
								"lastName":{"optional": true},
								"company":{"optional": true},
								"address":{"optional": true},
								"city":{"optional": true},
								"state":{"optional": true},
								"zip":{"optional": true},
								"country":{"optional": true},
								"phoneNumber":{"optional": true},
								"faxNumber":{"optional": true}
							}
						},
						"payment": {
							"type": "object", 
							"optional": false,
							"properties": {
								"creditCard":{
									"type": "object",
									"optional": true,
									"properties": {
										"cardNumber":{"optional": false},
										"expirationDate":{"optional": false}	
									}
								},
								"bankAccount":{
									"type": "object",
									"optional": true,
									"properties": {
										"accountType":{"optional": true},
										"routingNumber":{"optional": false},
										"accountNumber":{"optional": false},

										"nameOnAccount":{"optional": false},

										"echeckType":{"optional": true},
		
										"bankName":{"optional": true}
									}
								}
							}	
						}
					}	
				},
				{"name":"validationMode", "optional": false, "default": "liveMode"}
			]
		},
		"createCustomerShippingAddress":{
			"parameters": [
				{"name":"customerProfileId", optional: false},
				{
					"name":"address", 
					"type": "object",
					"optional": false,
					"properties": {
						"firstname":{"optional": true},
						"lastName":{"optional": true},
						"company":{"optional": true},
						"address":{"optional": true},
						"city":{"optional": true},
						"state":{"optional": true},
						"zip":{"optional": true},
						"country":{"optional": true},
						"phoneNumber":{"optional": true},
						"faxNumber":{"optional": true}
					}
				}
			]
		},
		"createCustomerProfileTransaction":{
			"parameters":[
				{
					"name":"transaction", 
					"type": "object",
					"optional": false
				},
				{"name":"extraOptions", optional: true}
			]
		},
		"deleteCustomerProfile":{
			"parameters": [
				{"name":"customerProfileId", optional: false}
			]
		},
		"deleteCustomerPaymentProfile":{
			"parameters": [
				{"name":"customerPaymentProfileId", optional: false},
				{"name":"customerProfileId", optional: false}
			]
		},
		"deleteCustomerShippingAddress":{
			"parameters": [
				{"name":"customerAddressId", optional: false},
				{"name":"customerProfileId", optional: false}
			]
		},
		"getCustomerProfileIds":{},
		"getCustomerProfile":{
			"parameters": [
				{"name":"customerProfileId", optional: false}
			]
		},
		"getCustomerPaymentProfile":{
			"parameters": [
				{"name":"customerPaymentProfileId", optional: false},
				{"name":"customerProfileId", optional: false}
			]
		},
		"getCustomerShippingAddress":{
			"parameters": [
				{"name":"customerAddressId", optional: false},
				{"name":"customerProfileId", optional: false}
			]
	
		},
		"updateCustomerProfile":{
			"parameters": [
				{"name":"customerProfileId", optional: false},
				{
					"name": "profile",
					"description": "Customer Profile",
					"type": "object",
					"properties": {	
						"email":{"optional": false},
						"description":{"optional": true},
						"merchantCustomerId":{"optional": true}
					}
				}


		]
		},
		"updateCustomerPaymentProfile":{
			"parameters": [
				{"name":"customerProfileId", optional: false},
				{"name":"customerPaymentProfileId", optional: false},
				{"name":"validationMode", optional: false, "default": "liveMode"},
				{
					"name":"paymentProfile", 
					"optional": false,
					"properties":{
						"customerType":{optional: true},
						"billTo": {
							"type": "object", 
							"optional": false,
							"properties": {
								"firstname":{"optional": true},
								"lastName":{"optional": true},
								"company":{"optional": true},
								"address":{"optional": true},
								"city":{"optional": true},
								"state":{"optional": true},
								"zip":{"optional": true},
								"country":{"optional": true},
								"phoneNumber":{"optional": true},
								"faxNumber":{"optional": true}
							}
						},
						"payment": {
							"type": "object", 
							"optional": false,
							"properties": {
								"creditCard":{
									"type": "object",
									"optional": true,
									"properties": {
										"cardNumber":{"optional": false},
										"expirationDate":{"optional": false}	
									}
								},
								"bankAccount":{
									"type": "object",
									"optional": true,
									"properties": {
										"accountType":{"optional": true},
										"routingNumber":{"optional": false},
										"accountNumber":{"optional": false},

										"nameOnAccount":{"optional": false},

										"echeckType":{"optional": true},
		
										"bankName":{"optional": true}
									}
								}
							}	
						}
					}	
				}

			]
	
		}
	}
}


//use simpler request generation routine like this:

var generateRequestBody = exports.generateRequest = function(data){
	var body;

	if (data.requestType){
		body = ["<?xml version='1.0' encoding='utf-8'?><"+data.requestType+"Request xmlns='AnetApi/xml/v1/schema/AnetApiSchema.xsd'>"];
	}else{
		body = [];
	}

	for(var prop in data){
		if(prop=="requestType"){continue;}
	
		body.push("<" + prop.toString() + ">");
		if (typeof data[prop]=="object"){
			body.push(generateRequestBody(data[prop]));
		}else{
			body.push(data[prop].toString());	
		}
		body.push("</" + prop.toString() + ">");
		
	}

	if (data.requestType){
		body.push("</" + data.requestType + "Request>");
	}
	return body.join("");
}

exports.transports = {
	"AuthorizeNetCIM": function(svcName, service, smd, options, args){
		var uri = getTarget(svcName,smd)
		data = {
			requestType: svcName,
			merchantAuthentication: {
				name: options.parameters.x_login,
				transactionKey: options.parameters.x_tran_key
			}
		}
		for (var i in args[0]){
			data[i]=args[0][i];
		}

		var body = generateRequestBody(data);

		var headers = {"Content-Type": "text/xml","Content-Length":body.length};
		//var headers = {"Content-Type": "text/xml","Transfer-Encoding":"chunked"};
		
		var def = new defer();
		var count=0;
		xhr({method: "POST", encoding: "utf8", headers:headers, body: [body], url:uri}).then(function(response){
			//console.log("response: ", response);
			console.log(count++, "response.status: ", response.status, response.body);
			if(response.status == 302){
				return getUri(response.headers.location);
			}
			if(response.status < 300){
				var data=[]	;
			//	if (!response.body){
			//		console.log("response", response);
			//	}
				when(response.body.forEach(function(part){
					data.push(part); 
				}), function(){
					var parser = new xml2js.Parser()
					data = data.join('');
					//console.log('raw results: ', data);
					parser.addListener('end', function(result) {
						if (result["MESSAGES"]["RESULTCODE"]=="Error"){
							def.reject(result["MESSAGES"]["MESSAGE"]["TEXT"]);
						}else{
							var res={};
							for (var i in result){
								if (i!="@"){res[i]=result[i]}
							}
							//console.log("res: ", res);
							def.resolve(res);
						}
						//console.log('result', result);
					});
					
					//parser.parseString(data);	
					//console.log("data: >>" + data + "<<");
					parser.parseString(data);	
				});
			}
			if(response.status == 404){
				def.reject(response, true);
			}
		},function(error){
			def.reject(error,true);
		});
		return def.promise;

	}	
}

