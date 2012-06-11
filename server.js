/*jshint asi: true*/
/*jshint laxcomma: true*/
"use strict";
var server = require("node-static")
  , app = require("http").createServer(handler)
  , io = require("socket.io").listen(app)

// Set logging level
io.set('log level', 1)
// Listen on port
//var port = process.env.PORT
var port = 8081
app.listen(port)
console.log("Static server listening on " + process.env.PORT)
//
// BORING SERVER
//
var clientFiles = new server.Server("./public")
function handler(request, response) {
  request.addListener('end', function() {
//
// Serve files!
//
    clientFiles.serve(request, response, function(err, res) {
      if (err) { // An error as occured
        console.log("> Error serving " + request.url + " - " + err.message)
        response.writeHead(err.status, err.headers);
        response.end()
      }
      else { // The file was served successfully
        console.log("> " + request.url + " - " + res.message)
      }
    })
  })
}

//
// SOCKETS!
//
io.sockets.on('connection', function(socket) {
  socket.on('clientDroplet', function(data) {
    socket.broadcast.emit('newDroplet', data)
    console.log(data.y, data.x)
  })
})