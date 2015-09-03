var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var redis = require('redis');
var db = redis.createClient();
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
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

//Creating a user with ID
app.post('/user', function(req, res) {
 
	db.get(allUsers, function (err, rep) { 
		var userVerzeichniss = JSON.parse(rep);
		var letzteID = 0;
		
		//Suche nach der letzten User ID im Verzeichniss
		for (var i in userVerzeichniss) {
			if (userVerzeichniss[i].id > letzteID){
				letzteID = parseInt(userVerzeichniss[i].id);
			}
		}
		
		var neueId = letzteID + 1;
		
		var neuerUser = {
			id: neueId,
			username: req.body.username,
			password: sha1sum(req.body.password) 
		};
		
		userVerzeichniss.push(neuerUser);
		db.set(allUsers, JSON.stringify(userVerzeichniss));
		res.status(201).json(neuerUser);
    });
 });

//Getting User by Name (ID macht keinen Sinn )
app.get('/user/:name', function(req, res) {
	var nameUser = req.params.name;
	
	db.get(allUsers, function (err, rep) {		
		var userVerzeichniss = JSON.parse(rep);
		
		for (var i in userVerzeichniss) {
			if (userVerzeichniss[i].username == nameUser) {
				//Ausgabe des gefundenen Users
				console.log(userVerzeichniss[i]);
				return res.status(200).json(userList[i]);
			} else {
			res.status(404).type('text').send('Dieser User ist nicht vorhanden');
			}
		}
	});
});

//Updating information of a User with ID
app.put('/user/:id', function(req, res) {
		db.get(allUsers, function (err, rep) {
		var userVerzeichniss = JSON.parse(rep);
		
		for (var i in userVerzeichniss) {
			if (userVerzeichniss[i].id == req.params.id) {
								
				userList[i].username = req.body.username;
				//Nur falls ein neues Password mitgeschickt wurde, wird ein neues Password übernommen
				if (req.body.password) userList[i].password = sha1sum(req.body.password);
				
				var neueUserdaten = userVerzeichniss[i];
			} else {
				res.status(404).type('text').send('Dieser User ist nicht vorhanden');
			}
		}
		db.set(allUsers, JSON.stringify(userVerzeichniss));
		//Neue User Daten werden zurückgeschickt
		res.status(200).json(neueUserdaten);
	});
});

//Delete User
app.delete('/user/:id', function(req, res) {
	db.get(allUsers, function (err, obj) {
		var userVerzeichniss = JSON.parse(obj);
		
		userVerzeichniss = userVerzeichniss.filter(function(del) {
			return del.id != req.params.id
		});
		
		db.set(allUsers, JSON.stringify(userVerzeichniss));
		//res.status(204).type.('text').send('Der User mit der ID ' + req.params.id ' wurde geloescht ');
	});
});

//Get all users
app.get('/alluser', function(req, res) {
	db.get(allUsers, function (err, rep) {		
		var userVerzeichniss = JSON.parse(rep);
		res.status(200).json(userVerzeichniss);
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

	console.log(req.body);
	console.log('AP1: ' + req.body.AP1);
	console.log('BS1: ' + req.body.BS1);
	console.log('WBA: ' + req.body.WBA);

	if(req.body.AP1 != undefined) {
		console.log('AP1 ist das Fach');
		if(req.body.AP1 == 1) {
			db.incr('ap1r', function(err, rep) {
				console.log('Anzahl der richtigen Fragen: ' + rep);
			});
		} else {
			db.incr('ap1w', function(err, rep) {
				console.log('Anzahl der richtigen Fragen: ' + rep);
			});
		}
	} else if(req.body.BS1 != undefined) {
		console.log('BS1 ist das Fach');
		if(req.body.BS1 == 1) {
			db.incr('bs1r', function(err, rep) {
				console.log('Anzahl der richtigen Fragen: ' + rep);
			});
		} else {
			db.incr('bs1w', function(err, rep) {
				console.log('Anzahl der richtigen Fragen: ' + rep);
			});
		}
	} else if(req.body.WBA != undefined) {
		console.log('WBA ist das Fach');
		if(req.body.WBA == 1) {
			db.incr('wbar', function(err, rep) {
				console.log('Anzahl der richtigen Fragen: ' + rep);
			});
		} else {
			db.incr('wbaw', function(err, rep) {
				console.log('Anzahl der richtigen Fragen: ' + rep);
			});
		}
	}
	res.writeHead(200);
	res.end();
});

/*Getting statistics*/
app.get('/statistic', function(req, res) {
	console.log('GET auf statistic');

	var stats = [];

	db.get('ap1r', function (err, rep) {
		var ap1r = {ap1r: rep};
		stats.push(ap1r);
		db.get('ap1w', function (err, rep) {
			var ap1w = {ap1w: rep};
			stats.push(ap1w);
			db.get('bs1r', function (err, rep) {
				var bs1r = {bs1r: rep};
				stats.push(bs1r);
				db.get('bs1w', function (err, rep) {
					var bs1w = {bs1w: rep};
					stats.push(bs1w);
					db.get('wbar', function (err, rep) {
						var wbar = {wbar: rep};
						stats.push(wbar);
						db.get('wbaw', function (err, rep) {
							var wbaw = {wbaw: rep};
							stats.push(wbaw);
							res.json(stats);
						});
					});
				});
			});
		});
	});
});


//Starting node Server on localhost:3000
app.listen(3000, function() {
	console.log("Server listens on Port 3000");
});