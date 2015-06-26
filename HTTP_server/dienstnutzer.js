var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var ejs = require('ejs');
var fs = require('fs');

var app = express();

var env = process.env.NODE_ENV || 'development';
if ('development' == env) {
   app.use(express.static(__dirname + '/public'));

	app.use(function(err, req, res, next) {
		console.error(err.stack);
		res.end(err.status + ' ' + err.messages);
	});
}


app.get('/question', jsonParser, function(req, res) {

	fs.readFile('./quiz.ejs', {encoding: 'utf-8'}, function(err, filestring) {
		if(err) {
			throw err;
		} else {

			var options = {
				host: 'localhost',
				port: 3000,
				path: '/question',
				method: 'GET',
				headers: {
					accept: 'application/json'
				}
			}

			var externalRequest = http.request(options, function(externalResponse) {
				console.log('Connected');
				externalResponse.on('data', function(chunk) {
					console.log('1');
					var adata = JSON.parse(chunk);
					var html = ejs.render(filestring, adata);

					res.setHeader('content-type', 'text/html');
					res.writeHead(200);
					res.write(html);
					res.end();
				});
			});
			console.log('Request end');
			externalRequest.end();
		}
	}); 
});

app.get('/newquestion', jsonParser, function(req, res) {

	fs.readFile('./newquestion.ejs', {encoding: 'utf-8'}, function(err, filestring) {
		if(err) {
			throw err;
		} else {

			console.log('Connected to newquestion');
				var html = ejs.render(filestring);
					res.setHeader('content-type', 'text/html');
					res.writeHead(200);
					res.write(html);
					res.end();

			console.log('Request end');
		}
	}); 
});


app.post('/question', jsonParser, function(req, res) {
	var newquestion = req.body;
	console.log(newquestion);
});

app.listen(3001, function() {
	console.log("Server listens on Port 3001");
});