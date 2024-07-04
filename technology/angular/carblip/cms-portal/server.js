var express = require("express");
var bodyParser = require("body-parser");
var path = require("path");

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

// Create link to Angular build directory
app.use(express.static(path.join(__dirname)));

// Catch all other routes and return the index file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});


// Initialize the app.
var server = app.listen(process.env.PORT || 3000, function () {
	var port = server.address().port;
	console.log("App now running on port", port);
});