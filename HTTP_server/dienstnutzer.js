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

// Fach für das Quiz auswählen
app.get('/quiz', jsonParser, function(req, res) {
	fs.readFile('./quiz.ejs', {encoding: 'utf-8'}, function(err, filestring) {
		if(err) {
			throw err;
		} else {

			console.log('Connected to quiz');
				var html = ejs.render(filestring);
					res.setHeader('content-type', 'text/html');
					res.writeHead(200);
					res.write(html);
					res.end();

			console.log('Request end');
		}
	}); 
});


//Quiz mit ausgeweahltem Fach starten
app.get('/quiz/:fach', jsonParser, function(req, res) {
fs.readFile('./quiz-gestartet.ejs', {encoding: 'utf-8'}, function(err, filestring) {
	if(err) {
		throw err;
	} else {
		
        var fach = '/quiz/' + req.params.fach;
		var random_entry;
		var path_question_id;
		var options_question;
		
		var options_fach_id = {
				host: 'localhost',
				port: 3000,
				path: fach,
				method: 'GET',
				headers: {
					accept: 'application/json'
				}
		}
				
		var externalRequest = http.request(options_fach_id, function(externalResponse) {
			console.log('Verbunden und sucht die QuestionIDs zum Fach');
			externalResponse.on('data', function(chunk) {
				var adata = JSON.parse(chunk);
					
				adata.quizID = adata.quizID.filter(function(x){return x !== null});
				console.log('Alle ID der Questions zum dem geweahlten Fach : ' + adata);
					
				random_entry = adata.quizID[Math.floor(Math.random() * adata.quizID.length)]	
				random_entry = random_entry.id;
				console.log('Die zufaellige FragenID  : ' + random_entry);
	
				path_question_id = '/question/' + random_entry;
				console.log('Der Path zur QuestionID :  ' + path_question_id);
			
				options_question = {
						host: 'localhost',
						port: 3000,
						path: path_question_id,
						method: 'GET',
						headers: {
						accept: 'application/json'
						}
				}
			
				var externalRequest2 = http.request(options_question, function(externalResponse2) {
					console.log('Anfrage nach der Question mit der zufälligen ID');
					externalResponse2.on('data', function(chunk) {
						var adata2 = [] ;
						adata2.push(JSON.parse(chunk));
						console.log(adata2);
						
						var daten = {questions: adata2};
						console.log('Die daten : ' + daten);
						
						var html = ejs.render(filestring, daten);

						res.setHeader('content-type', 'text/html');
						res.writeHead(200);
						res.write(html);
						res.end();
				
					});
					
				}); // Ende vom zweiten externalRequest2
				externalRequest2.end();
			}); //Ende vom ersten externalRequest
		});
			
		externalRequest.end();
		console.log('Request end');
	}; // Ende vom else
});		// Ende vom fs.readFile
});

//Neue Frage einstellen
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

	var newQuestion = req.body;
	console.log('1');
	var headers = {
	  'Content-Type': 'application/json',
	  //'Content-Length': newQuestion.length
	};

	var options = {
	  host: 'localhost',
	  port: 3000,
	  path: '/question',
	  method: 'POST',
	  headers: headers
	};

	var req = http.request(options, function(res) {
	 	res.setEncoding('utf-8');

	 	console.log('STATUS' + res.statusCode);

	 	res.on('data', function(chunk) {
	 		console.log('BODY: ' + chunk);
	 	});
	});

	req.on('error', function(e) {
	 	console.log('problem with request' + e.message);
	});

	req.write(JSON.stringify(newQuestion));
	req.end();
	res.end();
});

//Posting statistics (not functional as of now)
app.post('/statistics', jsonParser, function(req, res) {
	var statistics = req.body;
	console.log(statistics);
});

app.listen(3001, function() {
	console.log("Server listens on Port 3001");
});