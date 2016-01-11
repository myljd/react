var http = require('http');
var PATH = require('path');
var URL = require('url');
var querystring = require('querystring')

//get
if(process.argv.length == 3){
	var purl = process.argv[2];
	http.get(purl,function(res){

	res.on('data', function(data) {
	  console.log(data.toString())
	});

	}).on('error', function(e) {
	  console.error(e);
	});

}

//post
if(process.argv.length == 4){

	var purl = process.argv[2];
	var postData = process.argv[3];

	var options = {
	  hostname: URL.parse(purl).hostname,
	  port: URL.parse(purl).port,
	  path: URL.parse(purl).pathname,
	  method: 'POST',
	  headers: {
	    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
	    'Content-Length': process.argv[3].length
	  }
	};

	var req = http.request(options, function(res) {
	  res.setEncoding('utf8');
	  res.on('data', function(data) {
	  console.log(data.toString())
	});
	});

	req.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	});
	req.write(postData);
	req.end();

}
