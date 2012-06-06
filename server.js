var static = require("node-static")
, app = require("http").createServer(handler)
, io  = require("socket.io").listen(app)

app.listen(8081)
console.log("Static server listening on http://192.168.1.113:8081")

//
// BORING SERVER
//
var clientFiles = new static.Server("./public")
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



/*

*/