var fs = require('fs');
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var redis = require('redis');
var db = redis.createClient();
var app = express();

app.use(bodyParser.json());


var env = process.env.NODE_ENV || 'development';
if ('development' == env) {
   app.use(express.static(__dirname + '/public'));

	app.use(function(err, req, res, next) {
		console.error(err.stack);
		res.end(err.status + ' ' + err.messages);
	});
}

//Connecting to redis Server
db.on('connect', function() {
    console.log('connected to redis');
});

db.on("error", function (err) {
    console.log("Error " + err);
});



//Creating a user with ID as string
app.post('/user', function(req, res) {
	var newUser = req.body;
	db.incr('id:user', function(err, rep) {
		newUser.id = rep;
		db.set('user:'+newUser.id, JSON.stringify(newUser), function(err, rep) {
			res.json(newUser);
		});
	});
});

//Getting User by ID
app.get('/user/:id', function(req, res) {
	db.get('user:'+req.params.id, function(err, rep) {
		if(rep) {
			res.type('json').send(rep);
		} else {
			res.status(404).type('text').send('Dieser User ist nicht vorhanden')
		}
	});
});

//Updating information of a User
app.put('/user/:id', function(req, res) {
	db.exists('user:'+req.params.id, function(err, rep) {
		if(rep == 1) {
			var updatedUser = req.body;
			updatedUser.id = req.params.id;
			db.set('user:' + req.params.id, JSON.stringify(updatedUser), function(err, rep) {
				res.json(updatedUser);
			});
		} else {
			res.status(404).type('text').send('Dieser User ist nicht vorhanden');
		}
	});
});

//Starting node Server on localhost:3000
app.listen(3000);

/* Alternate function which are archived now
app.post('/user', jsonParser, function(req, res) {
	var username = req.body.username;
	var password = req.body.password;
	var name = req.body.name;
	var surname = req.body.surname;
	db.hmset('user:', 'username', username, 'password', password, 'name', name, 'surname', surname, redis.print);
	res.type('plain').send('Added a new User').end();
});

//Getting a user
app.get('/user', function(req, res) {
	db.hgetall('user:1', function (err, reply) {
		res.send(reply).status(200);
		db.end();
		res.end();
	});
});*/