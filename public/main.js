/*jshint asi: true*/
/*jshint laxcomma: true*/
"use strict";
jQuery(document).ready(function($) {
  // Set vars, dims and elements
  var el = document.getElementById('wave')
//  var socket = io.connect("http://droplets.benjp.c9.io")
  var socket = io.connect("192.168.1.113:8081")
  var field = wavefield()
  var canvas = document.getElementById('wave')
  var c = canvas.getContext('2d')
  var xlen = 10
  var ylen = 10
  var rows
  var cols
  var colorgrad = buildColorGrad("#05050D", 26, 18)

// ON RESIZE //////////////////////////////////////////////////////////////
  $(window).resize(function(e) {
    rows = Math.floor(window.innerHeight / ylen)
    cols = Math.floor(window.innerWidth / xlen)
    c.canvas.width  = window.innerWidth
    c.canvas.height = window.innerHeight
    field.setResolution(rows, cols)
    console.log(rows,cols)
  }).trigger('resize')


// BINDINGS ///////////////////////////////////////////////////////////////
  $('html').click(function(evt) {
    var d = {}
      , xpix = evt.pageX
      , ypix = evt.pageY
    d.x = xpix / window.innerWidth // turn into percentage
    d.y = ypix / window.innerHeight // before sending
    socket.emit('clientDroplet', d)
    field.addDroplet( Math.floor(ypix / ylen), Math.floor(xpix / xlen) )
  })

// SOCKETS ////////////////////////////////////////////////////////////////
  socket.on('newDroplet', function(d) {
    var ypix = Math.round( d.y * window.innerHeight ) //recover from percentage
      , xpix = Math.round( d.x * window.innerWidth ) // to this user resolution
    field.addDroplet( Math.floor(ypix / ylen), Math.floor(xpix / xlen) )
  })

  // Canvas /////////////////////////////////////////////////////////////////
  function start(fps) {
    var s = Date.now()
    var row, col, ind, val, round
    var f = field.update()
    c.clearRect(0, 0, canvas.width, canvas.height)
    for (row = 0; row < rows; ++row) {
      for (col = 0; col < cols; ++col) {
        val = f[row][col]
        // The following should result in an indices range from
        // -12 : 13 <add 12 at end to make it indexible>
        round = Math[val < 0 ? 'ceil' : 'floor'] // symmetric behaviour
        if (Math.abs(val) < 1) {
          ind = round(val * 10)
        }
        else if (Math.abs(val) < 2) {
          ind = round(val * 3) + 7 * (val < 0 ? -1 : 1)
        }
        else if (val <= -2 ) ind = -13
        else ind = 13
        ind += 13 // start ind at index 0
        // ind 13 is middle value (0 value)
        c.fillStyle = colorgrad[ind]
        c.fillRect(col*xlen, row*ylen, xlen, ylen)
      }
    }
    console.log( Date.now() - s )
    setInterval(start, fps)
  }
  // START ANIMATION /////////////////////////////////////////////////////////
  start(100)
}) // end JQuery

// HELPER FUNCS //////////////////////////////////////////////////////////
function colorLuminance(hex, lum) {
  // validate hex string
  hex = String(hex).replace(/[^0-9a-f]/gi, '')
  if (hex.length < 6) {
    hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2]
  }
  lum = lum || 0
  // convert to decimal and change luminosity
  var rgb = "#", c, i
  for (i = 0; i < 3; i++) {
    c = parseInt(hex.substr(i*2,2), 16)
    c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16)
    rgb += ("00"+c).substr(c.length)
  }
  return rgb
}

function buildColorGrad(baseShade, numElem, lum) {
  // Build the gradient variable from a starting darkest shade.
  // Goes up in lum/numElement increments, where lum
  // is percent / 100 (1 = 100% increase)
  var i
  , nc = []
  , inc = lum/numElem
  for (i = 0; i < numElem; ++i) {
    nc[i] = colorLuminance(baseShade, i*inc)
  }
  return nc
}



// If using an overlay, or area you don't want to
// receive mouseclicks from use:
// $('#sacredcontainer').click(function(event){
//      event.stopPropagation()
//  })