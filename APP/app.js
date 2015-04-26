var fs = require('fs');
var http = require('http');
var chalk = require("chalk");
var obj;
var myJSON;
var array_sort = [];


http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(1337, '127.0.0.1');

console.log('Server running at http://127.0.0.1:1337/');
console.log('  ');
console.log('  ');

fs.readFile("daten/wolkenkratzer.json", function(err, data) { 

  if (err) throw err;
  
  obj = JSON.parse(data.toString()); 
  console.log(chalk.green('Wolkenkratzer Array wurde eingelesen!'));
  
  function compareNumbers(a, b) {
   if (a.hoehe > b.hoehe) {
    return -1;
  }
  if (a.hoehe < b.hoehe) {
    return 1;
  }
  // a must be equal to b
  return 0;
  }
  
  array_sort = obj.wolkenkratzer.sort(compareNumbers);
  console.log(chalk.green('Wolkenkratzer Array wurde sortiert!'));
  
  myJSON = JSON.stringify({wolkenkratzer: array_sort});
  
  fs.writeFile("daten/wolkenkratzer_sortiert.json", myJSON, function(err) {
	if (err) throw err;
	console.log(chalk.green('Wolkenkratzer Array wurde gespeichert!'));
	console.log(chalk.bgRed(' Ausgabe der Liste: '));
	
		for (i = 0; i < array_sort.length; i++) { 
		console.log(chalk.cyan('Name: '+ array_sort[i].name));
		console.log(chalk.green('Stadt: '+ array_sort[i].stadt));
		console.log(chalk.red('Hoehe: '+ array_sort[i].hoehe));
		console.log(chalk.magenta.bgBlue('--------------------------------------'));
		};
		
		process.exit(code = 0);	
    });
	
	

 });
 
 	
   
 
 	
 

 


