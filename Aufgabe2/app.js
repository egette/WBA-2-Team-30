var fs = require('fs');
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var obj;
var obj2;
var answer = [
	{question: "answer"}
]


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


app.post('/answer', jsonParser, function(req, res) {
	answer.push(req.body);
	res.type('plain').send('Added!').end();
});

app.get('/answer', function(req, res) {
	res.status(200).json(answer);
});