var fs = require('fs');
var http = require('http');
var chalk = require("chalk");

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');
console.log('  ');
console.log('  ');

fs.readFile("daten/wolkenkratzer.json", function(err, data) { 

  if (err) throw err;
  
  var obj = JSON.parse(data.toString()); 
  
  for (i = 0; i < obj.wolkenkratzer.length; i++) { 
    console.log(chalk.cyan('Name: '+ obj.wolkenkratzer[i].name));
	console.log(chalk.green('Stadt: '+ obj.wolkenkratzer[i].stadt));
	console.log(chalk.red('Hoehe: '+ obj.wolkenkratzer[i].hoehe));
	console.log(chalk.magenta.bgBlue('--------------------------------------'));
	
   };
 });
 
