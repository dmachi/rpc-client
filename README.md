# rpc-client

**rpc-client** is a service proxy for various rpc style requests.  It reads a Service Mapping Description (SMD), and generates an object containing the services method or mixes those methods into a provided object.  Executing these methods returns a Deferred/Promise which will be triggered when the underlying rpc requests are completed.  It uses [promised-io](kriszyp/promised-io) and works atop both nodejs and narhwal.

    var svc = require("rpc-client/service").Service(google_smd);
    svc.webSearch({q: "rpc smd"}).then(function(){ print("done"); });

Transports and Envelopes are configurable as they are in dojox.rpc, though only a few transports and envelopes are currently implemented. 
