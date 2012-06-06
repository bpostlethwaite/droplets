/*jshint asi: true*/
/*jshint laxcomma: true*/
"use strict";

var server = require("node-static")
  , app = require("http").createServer(handler)
  , io  = require("socket.io").listen(app)
  
console.log(process.env.C9_PORT)

app.listen(process.env.C9_PORT)
console.log("Static server listening on http://192.168.1.113:8081")

//
// BORING SERVER
//
var clientFiles = new server.Server("./public")
function handler (request, response) {
  request.addListener('end', function () {
    //
    // Serve files!
    //
    clientFiles.serve(request, response, function (err, res) {
      if (err) { // An error as occured
        console.log("> Error serving " + request.url + " - " + err.message)
        response.writeHead(err.status, err.headers);
        response.end()
      } else { // The file was served successfully
        console.log("> " + request.url + " - " + res.message)
      }
    })
  })
}

//
// SOCKETS!
//


io.sockets.on('connection', function (socket) {
  socket.on('clientDroplet', function (data) {
    console.log(data)
    socket.broadcast.emit('newDroplet', data)
  })
})
