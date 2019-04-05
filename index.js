/*
*    Primary file for the API
*/

// Dependencies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

// The server should respond to all requests with a string
const server = http.createServer(function(req, res) {

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
    const decoder = new StringDecoder('utf-8');
    var buffer = '';
    req.on('data', function(data) {
        buffer += decoder.write(data);
    });
    req.on('end', function() {
        buffer += decoder.end();

        // Choose the request this handler should go to, if not found then use the not found handler
        const chosenHandler = typeof(router[trimmedPath]) !== undefined ? router[trimmedPath] : handlers.notFound;
        
        // Construct the data object to send to the handler 
        var data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject' : queryStringObject,
            'method' : method,
            'headers' : headers, 
            'payload' : buffer
        };

        // Route the request to the handler specified in the router
        chosenHandler(data, function(statusCode, payload) {
            // Use the status code called back by the handler or default to 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            // Use the payload called back by the handler or default to an empty object
            payLoad = typeof(payload) == 'object' ? payload : {};

            // Convert the payload to a string
            var payloadString = JSON.stringify(payload);

            // Return the response
            res.writeHead(statusCode);
            res.end(payloadString);
        
            // Log the request path
            console.log('Returning this response: ', buffer);
        })
    })
});

// Start the server and have it listen on port 3000
server.listen(3000, function() {
    console.log('The server is listening on port 3000 now');
});

// Define the handlers
const handlers = {};

// Sample handler
handlers.sample = function(data, callback) {
  //  Callback a http status code and a payload object
  callback(406, {'name' : 'Sample Handler'});
};

// Sample handler
handlers.notFound = function(data, callback) {

};

// Define a request router
const router = {
    'sample' : handlers.sample
}

