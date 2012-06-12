/*jshint asi: true*/
/*jshint laxcomma: true*/
"use strict";
jQuery(document).ready(function($) {
  // Set vars, dims and elements
  var el = document.getElementById('wave')
  var socket = io.connect("http://droplets.benjp.c9.io")
//  var socket = io.connect("192.168.1.113:8081")
  var field = wavefield()
  var canvas = document.getElementById('canvas')
  var c = canvas.getContext('2d')
  var xlen = 10
  var ylen = 10
  var maxval = 40 // +/- 4
  var colorgrad = buildColorGrad("#05050D", maxval*2 + 1, 18)
  var sID=null

// ON RESIZE //////////////////////////////////////////////////////////////
  $(window).resize(function(e) {
    var rows = Math.floor(window.innerHeight / ylen)
      , cols = Math.floor(window.innerWidth / xlen)
    field.setResolution(rows, cols)
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight
  }).trigger('resize')

// BINDINGS ///////////////////////////////////////////////////////////////
  $('html').click(function(evt) {
    var d = {}
      , xpix = evt.pageX
      , ypix = evt.pageY
    d.x = xpix / window.innerWidth // turn into percentage
    d.y = ypix / window.innerHeight // before sending
    socket.emit('clientDroplet', d)
    field.addDroplet( (ypix / ylen) | 0 , (xpix / xlen) | 0 )
  })

// This turns on and off button selected class for animations
  $(".category").click(function() {
    if ($(this).attr('id') === sID) {
      $(".category").removeClass('selected')
      $(".content").removeClass('selected')
      $("."+sID).removeClass('selected')
      sID=null //Nothing selected now.
    }
    else { // turn off whatever IS selected and reselect clicked tab
      $(".category").removeClass('selected')
      $(".connector").removeClass('selected')
      $(".infopane").removeClass('selected')
      $(".content").removeClass('selected')
      sID = $(this).attr('id')
      $(this).addClass('selected')
      $(".content").addClass('selected')
      $("."+sID).addClass('selected') //find matching classes associated w/ ID
    }
  })

// SOCKETS ////////////////////////////////////////////////////////////////
  socket.on('newDroplet', function(d) {
    var ypix = Math.round( d.y * window.innerHeight ) //recover from percentage
      , xpix = Math.round( d.x * window.innerWidth ) // to this user resolution
    field.addDroplet( Math.floor(ypix / ylen), Math.floor(xpix / xlen) )
  })

// Canvas /////////////////////////////////////////////////////////////////
  function start(fps) {
    //var s = Date.now()
    var row, col, ind, val
      , f = field.update()
      , rows = field.getHeight()
      , cols = field.getWidth()
    c.clearRect(0, 0, canvas.width, canvas.height)
    for (row = 0; row < rows; ++row) {
      for (col = 0; col < cols; ++col) {
        val = f[row][col] * 10
        ind = val | 0  // floor if > 0, ceil if < 0
        if (Math.abs(ind) > maxval) {
          ind = maxval * (ind < 0 ? -1 : 1)
        }
        ind += 40 // start ind at index 0
        c.fillStyle = colorgrad[ind]
        c.fillRect(col*xlen, row*ylen, xlen, ylen)
      }
    }
    //console.log( Date.now() - s )
    setInterval(start, fps)
  }
// START ANIMATION /////////////////////////////////////////////////////////
  //start(150)




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