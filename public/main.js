/*jshint asi: true*/
/*jshint laxcomma: true*/
"use strict";

jQuery(document).ready(function($) {
  var socket = io.connect("http://droplets.benjp.c9.io")
  //  var socket = io.connect("wss://droplets.jit.su")
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
  , field = fieldgen()
  , canvas = document.getElementById('canvas')
  , c = canvas.getContext('2d')
  , xlen = 10
  , ylen = 10
  , rows
  , cols
  , sprites = []
  , mag

// ON RESIZE ///////////////////////////////////////
  $(window).resize(function(e) {
    rows = Math.floor(window.innerHeight / xlen)
    cols = Math.floor(window.innerWidth / ylen)
    field.setResolution(rows, cols)
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight
    renderSprites.s = buildSprites(10)
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
    $(window).trigger('resize')
    var colorgrada = buildColorGrad("#000092", 41, -1).reverse()
      , colorgradb = buildColorGrad("#000092", 41, 1)
    
    colorgradb.shift()
    
    var colorgrad = colorgrada.concat(colorgradb)
    mag = 15
    
    // Bind Click //////////////////////////////////////////
    $('html').unbind('click') // get rid of previous bindings
    $('html').click(function(evt) {
        var xpix = evt.pageX
          , ypix = evt.pageY
      socket.emit('clientDroplet',{
          x: xpix / window.innerWidth // turn into percentage
        , y: ypix / window.innerHeight // before sending
        })
      field.addDroplet( (ypix / ylen) | 0 , (xpix / xlen) | 0 , mag)
    
    // Set render configurations
    renderField.update = fieled.waveUpdate 
    renderField.scale = 10
    renderField.maxval = 40 // +/-
    renderField.adj = 40
    
    // Start Animation   
    setInterval(renderField, 50)

    } // END WAVEEQNMODE




  function diffusionEqnMode() {
    $(window).trigger('resize')
    mag = 30

    // Click Binding //////////////////////////////////////////
    var xpix, ypix
    $('html').unbind('click') // get rid of previous bindings
		   
    $("html").mousemove(function(e){
      xpix = e.pageX
      ypix = e.pageY
    })

    setInterval(tracedrops, 50)

    function traceMouse() {
      field.addDroplet( (ypix / ylen) | 0 , (xpix / xlen) | 0 , mag)
      socket.emit('clientDroplet', {
          x: xpix / window.innerWidth
        , y: ypix / window.innerHeight
      })

    }

    // Set render configurations
    renderField.update = field.diffusionUpdate 
    renderField.scale = 10
    renderField.maxval = 80
    renderField.adj = 0
    

    // Start Animation   
    setInterval(renderField, 50)

  } // END DIFFUSIONEQMODE


  function poissonEqnMode() {
    var xpix, ypix
 
    $(window).trigger('resize')

    // Click Binding //////////////////////////////////////////
    $('html').unbind('click') // get rid of previous bindings
    $('html').dblclick(function(evt) {
        var xpix = evt.pageX
          , ypix = evt.pageY
      field.addSource( (ypix / ylen) | 0 , (xpix / xlen) | 0 )
    })

    $('html').mousemove(function(e){
      xpix = e.pageX
      ypix = e.pageY
    })
  
    // Set renderField configurations
    renderField.update = field.poissonUpdate 
    renderField.scale = 26
    renderField.maxval = 80
    renderField.adj = 0

    // set renderSprites config
    renderSprites.q1 = 1
    renderSprites.q2 = 1
    renderSprites.m = 1

    // Start Animation   
    setInterval(renderField, 50)

  } // END PoissonEqnMode

		   

// If any event newDroplet, it acts no matter the mode!
  socket.on('newDroplet', function(d) {
      var ypix = Math.round( d.y * window.innerHeight ) //recover from percentage
        , xpix = Math.round( d.x * window.innerWidth ) // to this user resolution
      field.addDroplet( (ypix / ylen) | 0, (xpix / xlen) | 0 , mag)
    })


  // Draw Canvas /////////////////////////////////////////////////////////////////
  function renderField () {
    var row, col, ind
      , f = this.update()
    for (row = 0; row < rows; ++row) {
      for (col = 0; col < cols; ++col) {
        ind = f[row][col] * this.scale | 0 // floor if > 0, ceil if < 0
        if (Math.abs(ind) > this.maxval) {
          ind = maxval * (ind < 0 ? -1 : 1)
        }
        c.fillStyle = this.colorgrad[ind += this.adj] // start ind at index 0
        c.fillRect(col*ylen, row*xlen, ylen, xlen)
      }
    }
  }

  function renderSprites () {
  // Note F = ma & F = qE
  // so we have field qE = ma and effect of other charges F = kq1q2(r1-r2)/r^2
  // q1E + k*q1*q2/r^2 = ma
  // So velocity change due to electric Field and other charges is:
  // (q1E + k*q1*q2(r2-r1)/r^2)/m = dV/dt
  // q1/m * (E + k*q2(r2-r1)/r^2) = dV/dt
  // Where E = -grad(Potential)
  // or E = -(X[i+1][j] - X[i][j])x -(X[i][j+1] - X[i][j])y
    var i
      , row
      , col
      , Ex
      , Ey
      , f = update()

    // FIll OVER PREV SPRITES
    c.fillStyle = "#000092"
    for (i = 0; i < sprites.length; i++) {
      c.beginPath()
      c.arc(sprites[i].y, sprites[i].x, 11,0, Math.PI*2,true)
      c.fill()
      c.closePath()
    }

    c.fillStyle = "#FFFF87"
    for (i = 0; i < this.s.length; i++) {
      // Change position according to velocity
      this.s[i].x += this.s[i].vx
      this.s[i].y += this.s[i].vy
      // Draw New Sprite position
      c.beginPath()
      c.arc(this.s[i].y, this.s[i].x, 10,0, Math.PI*2,true)
      c.fill()
      c.closePath()
      // Update velocity
      row = this.s[i].x/xlen | 0
      col = this.s[i].y/ylen | 0
      // E = -gradPotential
      Ex = -(f[row + 1][col] - f[row][col])
      Ey = -(f[row][col + 1] - f[row][col])
      // Coulumbs law
      r = Math.sqrt( (this.s[i].x - xpix)*(this.s[i].x - xpix) + (this.s[i].y - ypix)*(this.s[i].y - ypix) )
      Fx = (this.s[i].x - xpix) * this.q1 * this.q2 / r
      Fy = (this.s[i].y - ypix) * this.q1 * this.q2 / r
      this.s[i].vx +=  (q1*Ex + Fx) / this.m
      this.s[i].vy += (q1*Ey + Fy) / this.m
    }
  }

  function buildSprites (n) {
    var i, s = []
    for (i = 0; i < n; i++) {
      s[i] = {
          x : 0.5*rows*xlen | 0
        , y : 0.5 * cols*ylen | 0
        , vx : i + 1
        , vy : (0.5 * i + 1) | 0
      }
    }
    return s
  }
		  
// SET MODE /////////////////////////////////////////////////////
		       poissonEqnMode()
		    
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
