/*jshint asi: true*/
/*jshint laxcomma: true*/
"use strict";
var server = require("node-static")
  , app = require("http").createServer(handler)
  , io = require("socket.io").listen(app)
  , marked = require("marked")
  , fs = require('fs')

// Set logging level
io.set('log level', 1)
// Listen on port
var port = 80
app.listen(port)
console.log("Static server listening on " + port)

// Setup marked
marked.setOptions({
  gfm: true
})

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
// Get Content, use call back to start up the socketIO
// Loop through files asyncronously until all files
// read, then call callback with accumulated data and
// run socketIO
function readAndConnect(items, cb) {
  var i
    , count = 0
    , content = []
  for (i = 0; i < items.length; ++i) {
    parseMarkdown(items[i])
  }

  function parseMarkdown(file) {
    fs.readFile("docs/" + file, 'utf8', function (err, data) {
      var html
      if (err) {
          console.log("error reading " + file)
      }
      try {
        html =  marked(data)
      } catch(e) {
        html = ''
        console.log('Error converting ' + file + ' to html')
      }
      content.push({
         "head": file.toLowerCase().slice(0,-3) // lop off the .md extension
        ,"body": html
        })
      count += 1
      if (count === files.length) {
          cb(content)
      }
    }) //end readFrile
  } // end parseMarkdown
} // end ReadContent

var files = ["README.md","CV.md"]
readAndConnect(files, function (data) {
  //
  // SOCKETS!
  //
  io.sockets.on('connection', function(socket) {
    //
    // Connect content
    //
    var i
    for (i = 0; i < data.length; i++) {
      socket.emit( data[i].head, data[i].body )
    }
    //
    // Broadcast droplets
    //
    socket.on('clientDroplet', function(data) {
      socket.broadcast.emit('newDroplet', data)
    })
  })
}) // end readContent call
