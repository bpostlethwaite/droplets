var http = require('http')
var ecstatic = require('ecstatic')(__dirname + '/static')
var shoe = require('../../')
var es = require('event-stream')
var util = require('util')

var server = http.createServer(ecstatic)
server.listen(9999)

var broadcast = {}
var sock = shoe( function (stream) {

  broadcast[stream.id] = stream


  es.connect( stream
             , es.mapSync(function (data) {
               console.log(data.y)
               return data.y
               })
              , process.stdout
            )

  //stream.pipe(process.stdout, { end : false })

})

sock.install(server, '/invert')
