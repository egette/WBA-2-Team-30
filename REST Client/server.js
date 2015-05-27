var fs = require('fs');
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var redis = require('redis');
var client = redis.createClient();
var jsonParser = bodyParser.json();
var obj;
var obj2;
var test;
var user = [
	{a: "b"}
]

//Starting node Server on localhost:3000
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

//Connecting to redis Server
client.on('connect', function() {
    console.log('connected to redis');
});

client.on("error", function (err) {
    console.log("Error " + err);
});


//Creating User
app.post('/user', jsonParser, function(req, res) {
	var username = req.body.user;
	client.set('user', username, redis.print);
	res.type('plain').send('Added a new User').end();
});

app.get('/user', function(req, res) {
	res.status(200).json(user);
});


/*app.get('/', function(req, res) {
	fs.readFile("daten/fragen.json", function(err, data) { 

  		if (err) throw err;
  
  		obj = JSON.parse(data.toString()); 
  	});

  	res.send(obj).status(200);	
});


app.post('/answer', jsonParser, function(req, res) {
	answer.push(req.body);
	res.type('plain').send('Added!').end();
});

app.get('/answer', function(req, res) {
	res.status(200).json(answer);
});*/