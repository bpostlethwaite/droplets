"use strict";
var st = require("st")
  , http = require("http")
  , shoe = require('shoe')

// Listen on port
var PORT = 8082


var server = http.createServer( serverHandler )
server.listen(PORT, function() {
    console.log("Listening on port " + PORT)
})

var sock = shoe(socketHandler)
sock.install(server, "/droplets")

var cstreams = {}

server.on('connection', function (socket) {
  var id = socket.remoteAddress + socket.remotePort
  socket.on('close', removeID(id))
})


var staticOptions = {
  path: './public/'
, url: '/'
, index: 'index.html' // use 'index.html' file as the index
, dot: false // default: return 403 for any url with a dot-file part
, passthrough: false // calls next instead of returning a 404 error
}

var mount = st(staticOptions)

function serverHandler(req, res) {
  return mount(req, res)
}


function socketHandler (stream) {

  var id = stream.remoteAddress + stream.remotePort
  cstreams[id] = stream

  stream.on('data', function (packet) {
    Object.keys(cstreams).forEach( function (key) {
      if (key !== id) cstreams[key].write(packet)
      return
    })
  })
}


function removeID (id) {
  return function (socket) {
    delete cstreams[id]
  }
}