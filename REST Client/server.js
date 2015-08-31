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

//Send server log with time stamp
app.use(function (req, res, next) {
	console.log('Time: %d ' + ' Request-Pfad: ' + req.path, Date.now());
	next();
});


//Creating a user with ID as JSON string
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

//Delete User
app.delete('/user/:id', function(req, res) {
	db.del('user:'+req.params.id, function(err, rep) {
		if(rep == 1) {
			res.status(200).type('text').send('Der User wurde gelöscht');
		} else {
			res.status(404).type('text').send('Dieser User ist nicht vorhanden');
		}
	});
});

//Get all users
app.get('/user', function(req, res) {
	db.keys('user:*', function(err, rep) {
		var user = [];

		if(rep.length == 0) {
			res.json(user);
			return;
		}
		db.mget(rep, function(err, rep) {
			rep.forEach(function(val) {
				user.push(JSON.parse(val));
		});

		user = user.map(function(user) {
			return {id: user.id, name: user.name};
		});
		res.json(user);
		});
	});
});

//Creating a Question with ID as string
app.post('/question', function(req, res) {
	var newQuestion = req.body;
	console.log('Adding new question to Database');
	db.incr('id:question', function(err, rep) {
		newQuestion.id = rep;
		db.set('question:'+newQuestion.id, JSON.stringify(newQuestion), function(err, rep) {
			res.json(newQuestion);
			console.log('New question added succedfully');
		});
	});
});

//Getting Question by ID
app.get('/question/:id', function(req, res) {
	db.get('question:'+req.params.id, function(err, adata2) {
		if(adata2) {
			res.type('json').send(adata2);
		} else {
			res.status(404).type('text').send('Diese Frage ist nicht vorhanden')
		}
	});
});

//Updating information of a Question
app.put('/question/:id', function(req, res) {
	db.exists('question:'+req.params.id, function(err, rep) {
		if(rep == 1) {
			var updatedQuestion = req.body;
			updatedQuestion.id = req.params.id;
			db.set('question:' + req.params.id, JSON.stringify(updatedQuestion), function(err, rep) {
				res.json(updatedQuestion);
			});
		} else {
			res.status(404).type('text').send('Diese Frage ist nicht vorhanden');
		}
	});
});

//Delete Question
app.delete('/question/:id', function(req, res) {
	db.del('question:'+req.params.id, function(err, rep) {
		if(rep == 1) {
			res.status(200).type('text').send('Die Frage wurde gelöscht');
		} else {
			res.status(404).type('text').send('Diese Frage ist nicht vorhanden');
		}
	});
});

//Get all questions
app.get('/question', function(req, res) {
	db.keys('question:*', function(err, rep) {
		var question = [];

		if(rep.length == 0) {
			res.json(question);
			return;
		}
		db.mget(rep, function(err, rep) {
			rep.forEach(function(val) {
				question.push(JSON.parse(val));
		});

		question = question.map(function(question) {
			return {id: question.id, answer: question.answer, fach: question.fach, question: question.question, a: question.a, b: question.b, c: question.c, d: question.d};
		}); 
		var data = {questions: question};
		
		res.json(data);
		console.log('All questions sent');
		});
	});
});

//Getting questions by subject
app.get('/quiz/:fach', function(req, res) {
	db.keys('question:*', function(err, rep) {
		var question = [];
		var fachUp = req.params.fach.toUpperCase();

		if(rep.length == 0) {
			res.json(question);
			return;
		}
		
		db.mget(rep, function(err, rep) {
			rep.forEach(function(val) {
				question.push(JSON.parse(val));
		});

		question = question.map(function(question) {
			if(question.fach == fachUp) {
				return {id: question.id};
			}
		}); 
		var data = {quizID: question};
		
		res.json(data);
		});
	});
});

/*Posting statistics on Database*/
app.post('/statistic', function(req, res) {
	console.log('POST auf Statistics');
	var newStat = req.body;
	console.log('Gesendetes value: ' + newStat.right);
	if(newStat.right == 1) {
		db.incr('right', function(err, reply) {
	        console.log('Anzahl der richtigen Fragen: ' + reply);
	    });
	} else {
	    db.incr('wrong', function(err, reply) {
	        console.log('Anzahl der falschen Fragen :' + reply);
	    });
	}
	res.writeHead(200);
	res.end();
});

/*Getting statistics*/
app.get('/statistic', function(req, res) {
	console.log('GET auf statistic');
});


//Starting node Server on localhost:3000
app.listen(3000, function() {
	console.log("Server listens on Port 3000");
});