'use strict';

module.exports = function(router) {
	
	router.get('/hello', function(req, res) {
		res.send({message : 'Hello'});
	});
};