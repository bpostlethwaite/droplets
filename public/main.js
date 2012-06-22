/*jshint asi: true*/
/*jshint laxcomma: true*/
"use strict";

jQuery(document).ready(function($) {
  var socket = io.connect("http://droplets.benjp.c9.io")
  //  var socket = io.connect("wss://droplets.jit.su")
  , field = fieldgen()
  , canvas = document.getElementById('canvas')
  , c = canvas.getContext('2d')
  , xlen = 15
  , ylen = 15
  , maxval
  , adj
  , colorgrad
  , update


// ON RESIZE ///////////////////////////////////////
  $(window).resize(function(e) {
    var rows = Math.floor(window.innerHeight / ylen)
      , cols = Math.floor(window.innerWidth / xlen)
    field.setResolution(rows, cols)
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight
  })

// This turns on and off button selected class for animations
  $(".category").click(function() {
    //turn of all previously selected
    $('.selected').not(this).removeClass('selected')
    // Toggle this buttons class.
    $(this).toggleClass('selected')
    // If it wasn't previously selected then continue and engage.
    if ( $(this).hasClass('selected') ) {
      //find matching classes associated w/ ID
      $("."+ $(this).attr('id') ).addClass('selected')
    }
  }) // end click

// CONTENT SOCKETS /////////////////////////////////////////////////
  socket.on('readme', function(data) {
    $('.content.tog3').html(data)
  })

// MODE FUNCTIONS ///////////////////////////////////////////////////
  function waveEqnMode() {
    colorgrad = buildColorGrad("#05050D", maxval*2 + 1, 18)
    update = field.waveUpdate
    adj = 40
    maxval = 40 // +/-
    $(window).trigger('resize')
    // Click Binding //////////////////////////////////////////
    $('html').click(function(evt) {
      var d = {}
        , xpix = evt.pageX
        , ypix = evt.pageY
      d.x = xpix / window.innerWidth // turn into percentage
      d.y = ypix / window.innerHeight // before sending
      socket.emit('clientDroplet', d)
      field.addDroplet( (ypix / ylen) | 0 , (xpix / xlen) | 0 , 15)
    })

    socket.on('newDroplet', function(d) {
      var ypix = Math.round( d.y * window.innerHeight ) //recover from percentage
        , xpix = Math.round( d.x * window.innerWidth ) // to this user resolution
      field.addDroplet( (ypix / ylen) | 0, (xpix / xlen) | 0 , 15)
    })
    return
  } // END WAVEEQNMODE

  function diffusionEqnMode() {
    colorgrad = buildColorGrad("#05050D", maxval*2 + 1, 18)
    update = field.diffusionUpdate
    adj = 0
    maxval = 80
    $(window).trigger('resize')
    // Click Binding //////////////////////////////////////////
    $('html').click(function(evt) {
      var d = {}
        , xpix = evt.pageX
        , ypix = evt.pageY
      d.x = xpix / window.innerWidth // turn into percentage
      d.y = ypix / window.innerHeight // before sending
      socket.emit('clientDroplet', d)
      field.addDroplet( (ypix / ylen) | 0 , (xpix / xlen) | 0 , 55)
    })

    socket.on('newDroplet', function(d) {
      var ypix = Math.round( d.y * window.innerHeight ) //recover from percentage
        , xpix = Math.round( d.x * window.innerWidth ) // to this user resolution
      field.addDroplet( (ypix / ylen) | 0, (xpix / xlen) | 0 , 55)
    })
    return
  } // END DIFFUSIONEQMODE

// SET MODE //////////////////////////////////////////////////////////
  //waveEqnMode()
  diffusionEqnMode()
// Draw Canvas /////////////////////////////////////////////////////////////////
  function renderer () {
    var row, col, ind
      , f = update()
      , rows = field.getHeight()
      , cols = field.getWidth()
    for (row = 0; row < rows; ++row) {
      for (col = 0; col < cols; ++col) {
        ind = f[row][col] * 10 | 0 // floor if > 0, ceil if < 0
        if (Math.abs(ind) > maxval) {
          ind = maxval * (ind < 0 ? -1 : 1)
        }
        c.fillStyle = colorgrad[ind += adj] // start ind at index 0
        c.fillRect(col*xlen, row*ylen, xlen, ylen)
      }
    }
  }

// LOOP WITH RENDER FUNC
  setInterval(renderer, 40)

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
