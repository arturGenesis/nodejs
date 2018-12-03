/*
 * Primary API file
 */

// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const fs = require('fs');
const config = require('./config');

// HTTP Server
const httpServer = http.createServer(function (req, res) {
  unifiedSever(req, res);
});

// Starting HTTP Server
httpServer.listen(config.httpPort, function () {
  console.log('> Server listening on port', config.httpPort);
});

// HTTPS Server
const httpsServerOptions = {
  cert: fs.readFileSync('./https/cert.pem'),
  key: fs.readFileSync('./https/key.pem')
};
const httpsServer = https.createServer(httpsServerOptions, function (req, res) {
  unifiedSever(req, res);
});

// Starting HTTPS Server
httpsServer.listen(config.httpsPort, function () {
  console.log('> Server listening on port', config.httpsPort);
});

// Common servers logic
const unifiedSever = function (req, res) {

    // Get and parse url
    const parsedUrl = url.parse(req.url, true);

    // Get path
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Query string as object
    const query = parsedUrl.query;

    // HTTP Method
    const method = req.method.toUpperCase();

    // Request headers
    const headers = req.headers;

    // Get payload
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', function (data) {
      buffer += decoder.write(data);
    });
    req.on('end', function () {
      buffer += decoder.end();

      const handler = typeof(router[trimmedPath]) !== 'undefined'
        ? router[trimmedPath]
        : handlers.notFound;
      const data = {
        trimmedPath,
        query,
        method,
        headers,
        payload: buffer
      };

      handler(data, function (statusCode, payload) {
        statusCode = typeof(statusCode) === 'number' ? statusCode : 200;
        payload = typeof(payload) === 'object' ? payload : {};

        const payloadString = JSON.stringify(payload);

        res.setHeader('Content-Type', 'application/json');
        res.writeHead(statusCode);
        res.end(payloadString);

        // Log request
        console.log(method, trimmedPath, query);
        console.log("Headers:", headers);
        console.log("Payload:", buffer);
        console.log("Response:", statusCode, payloadString);
      })

    });
};

// Handlers
const handlers = {};

handlers.ping = function (data, callback) {
  callback(200);
};
handlers.notFound = function (data, callback) {
  callback(404);
};

const router = {
  ping: handlers.ping
};
