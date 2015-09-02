var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var ejs = require('ejs');
var fs = require('fs');

var app = express();

var counter = 0;

var env = process.env.NODE_ENV || 'development';
if ('development' == env) {
  app.use(express.static(__dirname + '/public'));

  app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.end(err.status + ' ' + err.messages);
  });
}

app.get('/', jsonParser, function(req, res) {
  fs.readFile('./index.ejs', {
    encoding: 'utf-8'
  }, function(err, filestring) {
    if (err) {
      throw err;
    } else {
      console.log('Connected to Home');
      var html = ejs.render(filestring);

      res.setHeader('content-type', 'text/html');
      res.writeHead(200);
      res.write(html);
      res.end();

      console.log('Request end');

    } //ende else
  }); //readFile
}); //haupt...

// Fach für das Quiz auswählen
app.get('/quiz', jsonParser, function(req, res) {
  fs.readFile('./quiz.ejs', {
    encoding: 'utf-8'
  }, function(err, filestring) {
    if (err) {
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
      //Die leeren Stellen aus dem Array mit den IDs werden rausgefiltert 	
      adata.quizID = adata.quizID.filter(function(x) {
        return x !== null
      });
      if (adata.quizID.length == 0) {
        console.log('Keine Fragen vorhanden');
        fs.readFile('./keinefragen.ejs', {
          encoding: 'utf-8'
        }, function(err, filestring) {
          if (err) {
            throw err;
          } else {

            console.log('Connected to keinefragen');
            var html = ejs.render(filestring);
            res.setHeader('content-type', 'text/html');
            res.writeHead(200);
            res.write(html);
            res.end();

            console.log('Request end');
          }
        });
        externalRequest.end();

      } else {
        fs.readFile('./quiz-gestartet.ejs', {
          encoding: 'utf-8'
        }, function(err, filestring) {
          if (err) {
            throw err;
          } else {
            // Aus dem Array mit den IDs wird eine zufällige gewählt

            random_entry = adata.quizID[counter];
            counter = counter + 1;
            if (counter == adata.quizID.length) {
              counter = 0;
            }

            random_entry = random_entry.id;

            path_question_id = '/question/' + random_entry;

            options_question = {
                host: 'localhost',
                port: 3000,
                path: path_question_id,
                method: 'GET',
                headers: {
                  accept: 'application/json'
                }
              }
              // Der Request um die Daten der Question mit Hilfe der ID zu bekommen
            var externalRequest2 = http.request(options_question, function(externalResponse2) {
              console.log('Anfrage nach der Question mit der zufälligen ID');
              externalResponse2.on('data', function(chunk) {
                var adata2 = [];
                adata2.push(JSON.parse(chunk));

                var random_ans = [];
                var richtige_ans = adata2[0].a;

                random_ans.push(adata2[0].a);
                random_ans.push(adata2[0].b);
                random_ans.push(adata2[0].c);
                random_ans.push(adata2[0].d);

                function shuffle(o) {
                  for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
                  return o;
                }

                shuffle(random_ans);

                for (var i = 0; i < random_ans.length; i++) {
                  if (richtige_ans == random_ans[i]) {
                    richtige_ans = i;
                  }
                };


                adata2[0].answer = richtige_ans;

                adata2[0].random_ans = random_ans;
                console.log(adata2);

                var daten = {
                  questions: adata2
                };
                var html = ejs.render(filestring, daten);

                res.setHeader('content-type', 'text/html');
                res.writeHead(200);
                res.write(html);
                res.end();

              });

            }); // Ende vom zweiten externalRequest2
            externalRequest2.end();
          }; // Ende vom else
        }); // Ende vom fs.readFile
      }; // ende von else
    }); //Ende vom ersten externalRequest
  });

  externalRequest.end();
  console.log('Request end');

});

//Neue Frage einstellen
app.get('/newquestion', jsonParser, function(req, res) {

  fs.readFile('./newquestion.ejs', {
    encoding: 'utf-8'
  }, function(err, filestring) {
    if (err) {
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
  var headers = {
    'Content-Type': 'application/json',
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
app.post('/statistic',jsonParser, function(req, res) {
  console.log('Post on statistic');
  var newStat = req.body;
  var headers = {
    'Content-Type': 'application/json',
  };

  var options = {
    host: 'localhost',
    port: 3000,
    path: '/statistic',
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

  req.write(JSON.stringify(newStat));
  req.end();
  res.end();
});

app.get('/statistic', jsonParser, function(req, res) {
  console.log('GET auf statistic');

  var statpath = {
    host: 'localhost',
    port: 3000,
    path: '/statistic',
    method: 'GET',
    headers: {
      accept: 'application/json'
    }
  }

  var externalRequest = http.request(statpath, function(externalResponse) {
    externalResponse.on('data', function(chunk) {
      var adata = JSON.parse(chunk);
      var right = adata[0].right;
      var wrong = adata[1].wrong;
      console.log('Right: ' + right);
      console.log('Wrong: ' + wrong);

      fs.readFile('./statistics.ejs', {
        encoding: 'utf-8'
      }, function(err, filestring) {
        if (err) {
          throw err;
        } else {
          console.log('Connected to statistic');

          var daten = {
            stat: adata
          };

          var html = ejs.render(filestring, daten);

          res.setHeader('content-type', 'text/html');
          res.writeHead(200);
          res.write(html);
          res.end();

          console.log('Request end');
        } //ende else
      }); //readFile


    });
  });
  externalRequest.end();
});


app.listen(3001, function() {
  console.log("Server listens on Port 3001");
});