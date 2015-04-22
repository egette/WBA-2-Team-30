var fs = require('fs');
var http = require('http');

var wolkenkrazer = fs.readFile(daten+"/wolkenkratzer.json", function(err, data) { 

  if (err) throw err;
  
  console.log(JSON.stringify( data.toString()));
  
 });