var fs = require('fs');
var http = require('http');

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
    console.log('Name: '+ obj.wolkenkratzer[i].name);
	console.log('Stadt: '+ obj.wolkenkratzer[i].stadt);
	console.log('Hoehe: '+ obj.wolkenkratzer[i].hoehe);
	console.log('--------------------------------------');
	
   };
 });
 
