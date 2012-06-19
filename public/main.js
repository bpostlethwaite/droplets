/*jshint asi: true*/
/*jshint laxcomma: true*/
"use strict";


jQuery(document).ready(function($) {
/// Set vars, dims and elements //////////////////////////////////////
  var el = document.getElementById('wave')
  //  var socket = io.connect("http://droplets.benjp.c9.io")
  var socket = io.connect("wss://droplets.jit.su")
  var field = wavefield()
  var canvas = document.getElementById('canvas')
  var c = canvas.getContext('2d')
  var xlen = 15
  var ylen = 15
  var maxval = 40 // +/- 4
  var colorgrad = buildColorGrad("#05050D", maxval*2 + 1, 18)
//  var shapeArray = buildShapeArray(xlen, ylen, colorgrad)
//  var time = 0


/////////////BINDINGS//////////////////////////////////////////////////////
// ON RESIZE ///////////////////////////////////////
  $(window).resize(function(e) {
    var rows = Math.floor(window.innerHeight / ylen)
      , cols = Math.floor(window.innerWidth / xlen)
    field.setResolution(rows, cols)
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight
  }).trigger('resize')

// Clicks //////////////////////////////////////////
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
    $('.selected').not(this).removeClass('selected') //turn of all previously selected
    $(this).toggleClass('selected') // Toggle this buttons class.
    if ( $(this).hasClass('selected') ) { // If it wasn't previously selected then continue and engage.
      $("."+ $(this).attr('id') ).addClass('selected') //find matching classes associated w/ ID
    }
  }) // end click
// ScrollBar /////////////////////////////////////////


////////// SOCKETS ////////////////////////////////////////////////////////////////
  socket.on('readme', function(readme) {
    $('.content.tog3').html(readme)
  })

  socket.on('newDroplet', function(d) {
    var ypix = Math.round( d.y * window.innerHeight ) //recover from percentage
      , xpix = Math.round( d.x * window.innerWidth ) // to this user resolution
    field.addDroplet( (ypix / ylen) | 0, (xpix / xlen) | 0 )
  })

// Draw Canvas /////////////////////////////////////////////////////////////////


  function renderer () {
    var row, col, ind
      , f = field.update()
      , rows = field.getHeight()
      , cols = field.getWidth()
    for (row = 0; row < rows; ++row) {
      for (col = 0; col < cols; ++col) {
        ind = f[row][col] * 10 | 0 // floor if > 0, ceil if < 0
        if (Math.abs(ind) > maxval) {
          ind = maxval * (ind < 0 ? -1 : 1)
        }
        c.fillStyle = colorgrad[ind += maxval] // start ind at index 0
        c.fillRect(col*xlen, row*ylen, xlen, ylen)
      }
    }
  }

  function rendererII () {
    var row, col, ind, val
    , f = field.update()
    , rows = field.getHeight()
    , cols = field.getWidth()
    for (row = 0; row < rows; ++row) {
      for (col = 0; col < cols; ++col) {
        val = f[row][col] * 10
        ind = val | 0  // floor if > 0, ceil if < 0
        if (Math.abs(ind) > maxval) {
          ind = maxval * (ind < 0 ? -1 : 1)
        }
        ind += 40 // start ind at index 0
        c.drawImage(shapeArray[ind], col*xlen, row*ylen)
      }
    }
  }

  setInterval(renderer, 50)

  //field.addDroplet( Math.floor(50 / ylen), Math.floor(150 / xlen) )
  //field.addDroplet( Math.floor(350 / ylen), Math.floor(350 / xlen) )

/*
  var count = 0
  function animate() {
    var s = Date.now()
    renderer()
    console.log(Date.now() - s)
    time += Date.now() - s
    if (++count === 1000) {
      console.log(time / 1000)
      return
    }
    setTimeout(animate, 0)
  }
*/




// START ANIMATION /////////////////////////////////////////////////////////
  //animate()

  /* *** FOR TESTING PRERENDERED SQUARES ***
  for (var ii = 0; ii < shapeArray.length; ++ii) {
    c.drawImage(shapeArray[ii], ii*xlen, ii*ylen)
  }
  */

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

// PRE-RENDER FUNCS //
function renderToCanvas (width, height, renderFunction) {
    var buffer = document.createElement('canvas')
    buffer.width = width
    buffer.height = height
    renderFunction(buffer.getContext('2d'))
    return buffer;
}


  function buildShapeArray(width, height, colorArray) {
    var i, out = []
    for (i = 0; i < colorArray.length; ++i) {
      out[i] = renderToCanvas(width, height, function (ctx) {
        ctx.fillStyle = colorArray[i]
        ctx.fillRect(0, 0, width, height)
      })
    }
    return out
  }


// If using an overlay, or area you don't want to
// receive mouseclicks from use:
// $('#sacredcontainer').click(function(event){
//      event.stopPropagation()
//  })