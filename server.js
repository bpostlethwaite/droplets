"use strict";
var st = require("st")
  , MuxDemux = require("mux-demux")
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

  var mx = MuxDemux()

  mx.on('error', function () {
    stream.destroy()
  })

  stream.on('error', function () {
    mx.destroy()
  })

  mx.on('connection', function (conn) {


    if (conn.meta === "dropletStream")
      console.log("droplets!")

      //
      // Broadcast droplets
      //
      // conn.on('clientDroplet', function(data) {
      //     socket.broadcast.emit('newDroplet', data)
      //   }
  })

  mx.pipe(stream).pipe(mx)

}
