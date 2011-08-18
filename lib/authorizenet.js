var envelopes = require("./envelopes"),
	defer = require("promise").defer,
	when = require("promise").when,
	getTarget = require("./util").getTarget,
	getEnvelope = require("./util").getEnvelope,
	xhr = require("promised-io/http-client").request;


exports.smd = {
	"SMDVersion": "2.0",
	"description": "Authorize.net AIM API",
	"transport": "POST",
	"envelope": "URL",
	"additionalParameters": true,
	"target": "https://test.authorize.net/gateway/transact.dll",
	"parameters": [
		//The merchant's unique api login id
		{ "name": "x_login", optional: false, "default":"" },

		//The merchant's unique Transaction key
		{ "name": "x_tran_key", optional: false, "default":"" },
	
		//The Type of Credit Card Transaction			
		{ "name": "x_type", optional: false, "default":"AUTH_CAPTURE" },

		//The amount of the transaction
		{ "name": "x_amount", optional: false, "default":0.00 },

		//The customer's credit card number
		{ "name": "x_card_num", optional: false, "default":"" },

		//The customers credit card expiration date	
		{ "name": "x_exp_date", optional: false, "default":"" },

		//The customers credit card expiration date	
		{ "name": "x_relay_response", optional: false, "default":"FALSE"},

		//The customers credit card expiration date	
		{ "name": "x_delim_data", optional: false, "default":"TRUE"},

		//The response delimiter
		{ "name": "x_delim_char", optional: false, "default":"|"},

		//The field encapsulation character
		{ "name": "x_encap_char", optional: true, "default":""},

		//The customers credit card expiration date	
		{ "name": "x_version", optional: false, "default":3.1},

		//The payment gateway-assigned ID that links the current request to the original authorizatin
		//request
		{ "name": "x_split_tender_id", optional: true}

	],

	"services": {

		"authCapture": {
			"transport": "AuthorizeNetAIM",
			"parameters": [
				//The Type of Credit Card Transaction			
				{ "name": "x_type", optional: false, "default":"AUTH_CAPTURE" }
			]
		},

		"authOnly": {
			"transport": "AuthorizeNetAIM",
			"parameters": [
				//The Type of Credit Card Transaction			
				{ "name": "x_type", optional: false, "default":"AUTH_ONLY" }
			]
		},

		"captureOnly": {
			"transport": "AuthorizeNetAIM",
			"parameters": [
				//The Type of Credit Card Transaction			
				{ "name": "x_type", optional: false, "default":"CAPTURE_ONLY" },
			
				//The authorization code of an original transaction not 
				//authorized on the payment gateway	
				{ "name": "x_auth_code", optional: false}
			]
		},

		"credit": {
			"transport": "AuthorizeNetAIM",
			"parameters": [
				//The Type of Credit Card Transaction			
				{ "name": "x_type", optional: false, "default":"CREDIT" },

				//The payment gateway assigned transaction ID of an original trans 
				{ "name": "x_trans_id", optional: true}
			]
		},

		"priorAuthCapture": {
			"transport": "AuthorizeNetAIM",
			"parameters": [
				//The Type of Credit Card Transaction			
				{ "name": "x_type", optional: false, "default":"PRIOR_AUTH_CAPTURE" },

				//The payment gateway assigned transaction ID of an original trans 
				{ "name": "x_trans_id", optional: true}
			]
		},

		"void": {
			"transport": "AuthorizeNetAIM",
			"parameters": [
				//The Type of Credit Card Transaction			
				{ "name": "x_type", optional: false, "default":"VOID" },

				//The payment gateway assigned transaction ID of an original trans 
				{ "name": "x_trans_id", optional: true}
			]
		}
	}
}

var AuthorizeNetAIMResponse = exports.AuthorizeNetAIMResponse=function(res){
	var response=res.split("|");
	this.responseCode=response[0];
	this.responseSubcode=response[1];
	this.responseReasonCode=response[2];
	this.responseReasonText=response[3];
	this.authorizationCode=response[4];
	this.avsResponse=response[5];
	this.transactionId=response[6];
	this.invoiceNumber=response[7];
	this.description=response[8];
	this.amount=response[9];
	this.method=response[10];
	this.transactionType=response[11];
	this.customerId=response[12];
	this.firstName=response[13];
	this.lastName=response[14];
	this.company=response[15];
	this.address=response[16];
	this.city=response[17];
	this.state=response[18];
	this.zipcode = response[19];
	this.country=response[20];
	this.phone=response[21];
	this.fax=response[22];
	this.emailAddress=response[23];
	this.shipTo= {
		firstName:response[24],
		lastName:response[25],
		company:response[26],
		address: response[27],
		city: response[28],
		state: response[29],
		zipcode: response[30],
		country: response[31]
	}
	this.tax = response[32];
	this.duty=response[33];
	this.freight=response[34]
	this.taxExempt=response[35];
	this.PONumber=response[36];
	this.md5 = response[37];
	this.cardCodeResponse = response[38];
	this.cardholderAuthenticationVerificationResponse=response[39];
	this.accountNumber = response[50];
	this.cardType=response[51];
	this.splitTenderId=response[52];
	this.requestedAmount=response[53];
	this.balanceOnCard=response[54];
}

var responseCodes = {
	"1": "approved",
	"2": "declined",
	"3": "error",
	"4": "held"
}

exports.transports={
	"AuthorizeNetAIM": function(svcName, service, smd, options, args){
		var envelope = getEnvelope(svcName, service, smd, options, args);
		var uri = getTarget(svcName,smd)// + "?" + envelope.serialize();	
		var body = envelope.serialize();
		var def = new defer();
		//console.log("uri: ", uri);
		xhr({method: "POST", encoding: "utf8", headers:{'Content-Type': "multipart/form-data","Content-Length":body.length}, body: [body], url:uri}).then(function(response){
			//console.log("response: ", response);
			//console.log("response.status: ", response.status, response.body);
			/*
			if (response.body && response.body.source){
				response.body.source.some(function(d){
					console.log("d: ", d);
				});
			}*/
			if(response.status == 302){
				return getUri(response.headers.location);
			}
			if(response.status < 300){
				var body = "";
				//console.log('response: ', response);
				when(response.body.forEach(function(part){
					if(!body){
						body = part;
					}else{
						body += part;
					}
				}), function(){
					var resp = new AuthorizeNetAIMResponse(body);
					if (resp.responseCode==1){
						def.resolve(resp);
						return;
					}else{
						def.reject(resp, true);
					}
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
