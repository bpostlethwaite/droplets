var shoe = require('../../')
var domready = require('domready')
var es = require('event-stream')

domready(function () {
  var xpix, ypix

  // Perhaps do a setTimeout where we assign an onmousemove
  // get coords then turn func off with doc.onmousemove = null
  // until timer runs out.

  document.onmousemove = function (ev) {
    xpix = ev.pageX
    ypix = ev.pageY
  }

  var result = document.getElementById('result')

  var stream = shoe('/invert')

  var reader = es.readable(function (i, callback) {

    setTimeout( function () {
      var obj = {
        y: ypix
      }
      callback(null, obj )
      } , 500)
  })

  reader.pipe(stream)


  //var s = es.mapSync(function (msg) {
  //  result.appendChild(document.createTextNode(msg))
  //  return String(Number(msg)^1)
  //})

  //s.pipe(stream).pipe(s);
})
