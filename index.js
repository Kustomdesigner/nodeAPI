/*
*    Primary file for the API
*/

// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./lib/config');
const fs = require('fs');
const handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');

// Instantiate the http server
const httpServer = http.createServer(function(req, res) {
    unifiedServer(req, res);
});

// Start the server and have it listen on port 3000
httpServer.listen(config.httpPort, function() {
    console.log("The server is listening on port " +config.httpPort);
});

// Instantiate the https server
const httpsServerOptions = {
    'key' : fs.readFileSync('./https/key.pem'),
    'cert' : fs.readFileSync('./https/cert.pem')
}
const httpsServer = https.createServer(httpsServerOptions, function(req, res) {
    unifiedServer(req, res);
});

// Start the server and have it listen on port 3001
httpsServer.listen(config.httpsPort, function() {
    console.log("The server is listening on port " +config.httpsPort);
});

// All the server logic for both the http and https server
var unifiedServer = function(req, res) {
    // Get the url and parse it
    var parsedUrl = url.parse(req.url, true);

    // Get the path
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get the query string object
    var queryStringObject = parsedUrl.query; 

    // Get the http method
    var method = req.method.toLowerCase();

    // Get the headers as an object
    var headers = req.headers;

    // Get the payload if any
    var decoder = new StringDecoder('utf-8');
    var buffer = '';
    req.on('data', function(data) {
        buffer += decoder.write(data);
    });
    req.on('end', function() {
        buffer += decoder.end();

        // Choose the request this handler should go to, if not found then use the not found handler
        var chosenHandler = typeof(router[trimmedPath]) !== undefined ? router[trimmedPath] : handlers.notFound;
        
        // Construct the data object to send to the handler 
        var data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject' : queryStringObject,
            'method' : method,
            'headers' : headers, 
            'payload' : helpers.parseJsonToObject(buffer)
        };

        // Route the request to the handler specified in the router
        chosenHandler(data, function(statusCode, payload) {
            // Use the status code called back by the handler or default to 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            // Use the payload called back by the handler or default to an empty object
            payload = typeof(payload) == 'object' ? payload : {};

            // Convert the payload to a string
            var payloadString = JSON.stringify(payload);

            // Return the response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
        
            // Log the request path
            console.log('Returning this response: ', statusCode, payloadString);
        })
    })
};


// Define a request router
const router = {
    'ping' : handlers.ping,
    'users' : handlers.users,
    'tokens' : handlers.tokens
}

