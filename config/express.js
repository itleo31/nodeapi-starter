'use strict';

var express = require('express'),
	fs = require('fs'),
	https = require('https'),
	path = require('path'),
	methodOverride = require('method-override'),
	morgan = require('morgan'),
	bodyParser = require('body-parser'),
	flash = require('connect-flash'),
	config = require('./config');

module.exports = function(db) {
	// Initialize express app
	var app = express();
	
	// Globbing model files
	config.getGlobbedFiles('./app/models/**/*.js').forEach(function(modelPath) {
		require(path.resolve(modelPath));
	});
	
	// Showing stack errors
	app.set('showStackError', true);
	
	// Environment dependent middleware
	if (process.env.NODE_ENV === 'development') {
		// Enable logger (morgan)
		app.use(morgan('dev'));
	}
	
	// Request body parsing middleware should be above methodOverride
	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(bodyParser.json());
	app.use(methodOverride());
	
	// connect flash for flash messages
	app.use(flash());
	
	var router = express.Router();
	
	// Globbing routing files
	config.getGlobbedFiles('./app/routes/**/*.js').forEach(function(routePath) {
		require(path.resolve(routePath))(router);
	});
	
	app.use('/api', router);
	
	// Assume 404 since no middleware responded
	app.use(function(req, res) {
		res.status(404).send('Not found');
	});
	
	if (process.env.NODE_ENV === 'secure') {
		// Log SSL usage
		console.log('Securely using https protocol');

		// Load SSL key and certificate
		var privateKey = fs.readFileSync('./config/sslcerts/key.pem', 'utf8');
		var certificate = fs.readFileSync('./config/sslcerts/cert.pem', 'utf8');

		// Create HTTPS Server
		var httpsServer = https.createServer({
			key: privateKey,
			cert: certificate
		}, app);

		// Return HTTPS server instance
		return httpsServer;
	}
	
	// Return Express server instance
	return app;
};