"use strict";


var engine = require('pde-engine')
  , poissonEngine = require('./poissonSolver.js')
  , cg = require('colorgrad')()
  , cmap = require('colormap')

$(document).ready(function() {
  var socket = io.connect("wss://droplets.jit.su")
  //var socket = io.connect("http://droplets.benjp.c9.io")
  //var socket = io.connect("192.168.1.113")

  , field = engine()
  , canvas = document.getElementById('canvas')
  , c = canvas.getContext('2d')
  , xlen = 12
  , ylen = 12
  , rows
  , cols
  , xpix
  , ypix
  , intID = []


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

// This turns on and off button selected class for mode info text
  $(".mode").click(function() {
    var mode = null
    //turn of all previously selected
    $('.selectedII').not(this).removeClass('selectedII')
    // Toggle this buttons class.
    $(this).toggleClass('selectedII')
    // If it wasn't previously selected then continue and engage.
    if ( $(this).hasClass('selectedII') ) {
      // get mode ID
      mode = $(this).attr('id')
      //find matching classes associated w/ ID
      $("." + mode).addClass('selectedII')
    }
    // Start up appropriate physics mode
    switch(mode) {
      case "mode1":
        waveEqnMode();
        break;
      case "mode2":
        diffusionEqnMode();
        break;
      case "mode3":
        noMode();
        break;
      default:
        noMode();
    } // end switch
  }) // end mode click



// CONTENT SOCKETS /////////////////////////////////////////////////
  socket.on('readme', function(data) {
    $('.content.tog3').html(data)
  })
  socket.on('cv', function(data) {
    $('.content.tog4').html(data)
  })

// MODE FUNCTIONS ///////////////////////////////////////////////////

  // Function called on window resize which resets both canvas dims
  // as well as calling physics engine resize method.
  // Also acts as a general clearing house.
  function resetScreen() {
    $(window).resize(function(e) {
      rows = Math.floor(window.innerHeight / xlen)
      cols = Math.floor(window.innerWidth / ylen)
      field.setResolution(rows, cols)
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      //field.s = buildSprites(10)
    })
    $(window).trigger('resize')
  }

  // Function to clear previous bindings and interval
  // timers from previously selected modes
  function clearMode() {
    var i
    $(canvas).unbind("mousemove")
    $(canvas).unbind("click")
    for (i = 0; i < intID.length; i++) {
      clearInterval(intID[i])
    }

  }

  function waveEqnMode() {
    clearMode()
    field = engine( {
      dt: 0.1
    , gamma: 0.02
    , eqn: "wave"
    })
    resetScreen()
    var ca = cg.colorgrad("#000092", {lum: -1, nshades:41})
    var cb = cg.colorgrad("#000092", {lum: 1, nshades:41})
    cb.shift()
    field.cg = ca.concat(cb)

    field.mag = 15

    // Bind Click Events /////////////////////////////////////
    $(canvas).bind("click", function(evt) {
        var xp = evt.pageX
          , yp = evt.pageY
      socket.emit('clientDroplet',{
          x: xp / window.innerWidth // turn into percentage
        , y: yp / window.innerHeight // before sending
        })
      field.addSource( (yp / ylen) | 0 , (xp / xlen) | 0 , field.mag)
    })
    // Set render configurations
    field.scale = 10
    field.maxval = 40 // +/-
    field.adj = 40

    // Start Animation
    intID[0] = setInterval(renderField, 30)

    } // END WAVEEQNMODE


  function diffusionEqnMode() {
    clearMode()
    field = engine( {
      dt: 0.1
    , eqn: "diffusion"
    , alpha: 0.5
    })
    resetScreen()
    field.mag = 30
    // Click Binding //////////////////////////////////////////
    $(canvas).bind("mousemove", function(evt) {
      xpix = evt.pageX
      ypix = evt.pageY
    })

    intID[0] = setInterval(tracedrops, 50)


    function tracedrops() {
      if (xpix) {
        field.addSource( (ypix / ylen) | 0, (xpix / xlen) | 0, field.mag)
        socket.emit('clientDroplet', {
          x: xpix / window.innerWidth
        , y: ypix / window.innerHeight
        })
      }
    }

    // Set render configurations
    field.scale = 10
    field.maxval = 80
    field.adj = 0
    field.cg = cmap({'colormap': 'jet', 'nshades': 81 }).reverse()
    // Start Animation
    intID[1] = setInterval(renderField, 50)

  } // END DIFFUSIONEQMODE


  function poissonEqnMode() {
    $(window).trigger('resize')
    xpix = 0.5*Math.round(window.innerWidth)
    ypix= 0.5*Math.round(window.innerHeight)
    // Click Binding //////////////////////////////////////////
    $(canvas).unbind() // get rid of previous bindings
    $(canvas).dblclick(function(evt) {
        var xpix = evt.pageX
          , ypix = evt.pageY
      field.addSource( (ypix / ylen) | 0 , (xpix / xlen) | 0 )
    })

    $(canvas).mousemove(function(e){
      xpix = e.pageY // yes this is confusing but I like my x dir up and down = height
      ypix = e.pageX
    })

    // Set renderField configurations
    field.scale = 26
    field.maxval = 80
    field.adj = 0
    field.cg = colorgrad
    // set renderSprites config
    field.m = 3
    field.k = 1
    field.dt = 0.1

    // Start Animation
    setInterval(renderSprites, 50)

  } // END PoissonEqnMode


  // Default mode when engine not engaged.
  function noMode() {
    clearMode()
    resetScreen()
  }



// If any event newDroplet, it acts no matter the mode!
  socket.on('newDroplet', function(d) {
      var yp = Math.round( d.y * window.innerHeight ) //recover from percentage
        , xp = Math.round( d.x * window.innerWidth ) // to this user resolution
      field.addSource( (yp / ylen) | 0, (xp / xlen) | 0 , field.mag)
    })


  // Draw Canvas /////////////////////////////////////////////////////////////////

  function renderField () {
    var row, col, ind
      , f = field.update()
    for (row = 0; row < rows; ++row) {
      for (col = 0; col < cols; ++col) {
        ind = f[row * cols + col] * field.scale | 0 // floor if > 0, ceil if < 0
        if (Math.abs(ind) > field.maxval) {
          ind = field.maxval * (ind < 0 ? -1 : 1)
        }
        c.fillStyle = field.cg[ind += field.adj] // start ind at index 0
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
  // q1 and q1 have been set as 1
    var i, row, col, Ex, Ey, Fx, Fy, r, vx ,vy
      , f = field.update()

    // FIll OVER PREV SPRITES
    c.fillStyle = "#000092"
    for (i = 0; i < field.s.length; i++) {
      c.beginPath()
      c.arc(field.s[i].y, field.s[i].x, 11,0, Math.PI*2,true)
      c.fill()
      c.closePath()
    }

    c.fillStyle = "#FFFF87"
    for (i = 0; i < field.s.length; i++) {
      // Change position according to velocity
      field.s[i].x = Math.round(field.s[i].x + field.s[i].vx)
      field.s[i].y = Math.round(field.s[i].y + field.s[i].vy)
      if (field.s[i].x <= 1 || field.s[i].x >= canvas.height -xlen || field.s[i].y <= 1 || field.s[i].y >= canvas.width - ylen) {
        field.s.splice(i,1)
        continue
      }
      // Draw New Sprite position
      c.beginPath()
      c.arc(field.s[i].y, field.s[i].x, 10,0, Math.PI*2,true)
      c.fill()
      c.closePath()
      // Update velocity
      row = field.s[i].x/xlen | 0
      col = field.s[i].y/ylen | 0
      // E = -gradPotential
      Ex = -(f[row + 1][col] - f[row][col])
      Ey = -(f[row][col + 1] - f[row][col])
      // Coulumbs law
      r = Math.sqrt( (field.s[i].x - xpix)*(field.s[i].x - xpix) + (field.s[i].y - ypix)*(field.s[i].y - ypix) )
      Fx = (r > 75) ? 0 : field.k*(field.s[i].x - xpix) / r
      Fy = (r > 75) ? 0 : field.k*(field.s[i].y - ypix) / r
      vx = (Ex + Fx) / field.m
      vy = (Ey + Fy) / field.m
      field.s[i].vx +=  vx/field.dt
      field.s[i].vy += vy/field.dt
    }

  }

  function buildSprites (n) {
    var i, s = []
    for (i = 0; i < n; i++) {
      s[i] = {
          x : 0.5*rows*xlen | 0
        , y : 0.5 * cols*ylen | 0
        , vx : Math.random() < 0.5 ? -1 : 1 * Math.random() * 3
        , vy : Math.random() < 0.5 ? -1 : 1 * Math.random() * 3
      }
    }
    return s
  }

}) // end JQuery
