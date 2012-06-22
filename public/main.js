/*jshint asi: true*/
/*jshint laxcomma: true*/
"use strict";

jQuery(document).ready(function($) {
  var socket = io.connect("http://droplets.benjp.c9.io")
  //  var socket = io.connect("wss://droplets.jit.su")
  , field = fieldgen()
  , canvas = document.getElementById('canvas')
  , c = canvas.getContext('2d')
  , xlen = 10
  , ylen = 10
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
    maxval = 40 // +/-
    adj = 40
    var colorgrada = buildColorGrad("#000092", 41, -1).reverse()
    var colorgradb = buildColorGrad("#000092", 41, 1)
    colorgradb.shift()
    colorgrad = colorgrada.concat(colorgradb)
    update = field.waveUpdate
    $(window).trigger('resize')
    // Click Binding //////////////////////////////////////////
    $('html').click(function(evt) {
        var xpix = evt.pageX
          , ypix = evt.pageY
      socket.emit('clientDroplet',{
          x: xpix / window.innerWidth // turn into percentage
        , y: ypix / window.innerHeight // before sending
        })
      field.addDroplet( (ypix / ylen) | 0 , (xpix / xlen) | 0 , 15)
    })
  } // END WAVEEQNMODE


  function diffusionEqnMode() {
    adj = 0
    maxval = 80
    , colorgrad = [
        "#000092"
      , "#00009E"
      , "#0000AA"
      , "#0000B6"
      , "#0000C2"
      , "#0000CE"
      , "#0000DB"
      , "#0000E7"
      , "#0000F3"
      , "#0000FF"
      , "#000CFF"
      , "#0018FF"
      , "#0024FF"
      , "#0031FF"
      , "#003DFF"
      , "#0049FF"
      , "#0055FF"
      , "#0061FF"
      , "#006DFF"
      , "#0079FF"
      , "#0086FF"
      , "#0092FF"
      , "#009EFF"
      , "#00AAFF"
      , "#00B6FF"
      , "#00C2FF"
      , "#00CEFF"
      , "#00DBFF"
      , "#00E7FF"
      , "#00F3FF"
      , "#00FFFF"
      , "#0CFFF3"
      , "#18FFE7"
      , "#24FFDB"
      , "#31FFCE"
      , "#3DFFC2"
      , "#49FFB6"
      , "#55FFAA"
      , "#61FF9E"
      , "#6DFF92"
      , "#79FF86"
      , "#86FF79"
      , "#92FF6D"
      , "#9EFF61"
      , "#AAFF55"
      , "#B6FF49"
      , "#C2FF3D"
      , "#CEFF31"
      , "#DBFF24"
      , "#E7FF18"
      , "#F3FF0C"
      , "#FFFF00"
      , "#FFF300"
      , "#FFE700"
      , "#FFDB00"
      , "#FFCE00"
      , "#FFC200"
      , "#FFB600"
      , "#FFAA00"
      , "#FF9E00"
      , "#FF9200"
      , "#FF8600"
      , "#FF7900"
      , "#FF6D00"
      , "#FF6100"
      , "#FF5500"
      , "#FF4900"
      , "#FF3D00"
      , "#FF3100"
      , "#FF2400"
      , "#FF1800"
      , "#FF0C00"
      , "#FF0000"
      , "#F30000"
      , "#E70000"
      , "#DB0000"
      , "#CE0000"
      , "#C20000"
      , "#B60000"
      , "#AA0000"
      , "#9E0000"
      ]
    update = field.diffusionUpdate
    $(window).trigger('resize')

    // Click Binding //////////////////////////////////////////
    var xpix, ypix

    $("html").mousemove(function(e){
      xpix = e.pageX
      ypix = e.pageY
    })

    setInterval(tracedrops, 50)

    function tracedrops() {
      field.addDroplet( (ypix / ylen) | 0 , (xpix / xlen) | 0 , 15)
      socket.emit('clientDroplet', {
          x: xpix / window.innerWidth
        , y: ypix / window.innerHeight
      })
    }
  } // END DIFFUSIONEQMODE

// SET MODE //////////////////////////////////////////////////////////
  diffusionEqnMode()

// Crazy! If any event newDroplet, it acts no matter the mode!
  socket.on('newDroplet', function(d) {
      var ypix = Math.round( d.y * window.innerHeight ) //recover from percentage
        , xpix = Math.round( d.x * window.innerWidth ) // to this user resolution
      field.addDroplet( (ypix / ylen) | 0, (xpix / xlen) | 0 , 15)
    })


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
