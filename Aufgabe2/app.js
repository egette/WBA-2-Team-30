var fs = require('fs');
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var obj;


var app = express();
app.listen(3000);

var env = process.env.NODE_ENV || 'development';
if ('development' == env) {
   app.use(express.static(__dirname + '/public'));

	app.use(function(err, req, res, next) {
		console.error(err.stack);
		res.end(err.status + ' ' + err.messages);
	});
}

app.get('/', function(req, res) {
	fs.readFile("daten/fragen.json", function(err, data) { 

  		if (err) throw err;
  
  		obj = JSON.parse(data.toString()); 
  	});

  	res.send(obj);	
});