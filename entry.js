"use strict";

var engine = require('pde-engine')
  , cg = require('colorgrad')()
  , cmap = require('colormap')
  , MuxDemux = require('mux-demux')
  , fs = require('fs')
  , mx = MuxDemux()
  , shoe = require('shoe')

var sockstream = shoe('/droplets')
sockstream.pipe(mx).pipe(sockstream)


require('domready')(function () {

  var field = engine()
  , canvas = document.getElementById('canvas')
  , c = canvas.getContext('2d')
  , xlen = 12
  , ylen = 12
  , rows
  , cols
  , xpix
  , ypix
  , intID = []


  /*
   *  This turns on and off button selected class for animations
   */
  var categories = nodeArray(document.querySelectorAll('.category'))
  var unselector = curry(toggleClass, 'selected', false)
  var selector = curry(toggleClass, 'selected', true)

  categories.forEach(function (category) {
    category.addEventListener('click', function () {
      // See if clicked elem is now selected
      var toggled = toggleClass('selected', null, category)
      // Unselect all selected
      nodeArray(document.querySelectorAll('.selected')).map(unselector)
      if (toggled) {
        // Reselect all elems with class === category ID if category was selected
        nodeArray(document.querySelectorAll("." + category.id)).map(selector)
        toggleClass('selected', true, category)
      }
    })
  })
  /*
   * Ugly code to turn mode buttons into toggle switches
   */
  var modes = nodeArray(document.querySelectorAll('.mode'))
  var unselector2 = curry(toggleClass, 'selectedII', false)
  var selector2 = curry(toggleClass, 'selectedII', true)

  modes.forEach(function (mode) {
    mode.addEventListener('click', function () {
      // See if clicked elem is now selected
      var toggled = toggleClass('selectedII', null, mode)
      // Unselect all selected
      nodeArray(document.querySelectorAll('.selectedII')).map(unselector2)
      if (toggled) {
        // Reselect all elems with class === category ID if category was selected
        nodeArray(document.querySelectorAll("." + mode.id)).map(selector2)
        toggleClass('selectedII', true, mode)
      // Start up appropriate physics mode
        switch(mode.id) {
          case "mode1":
          waveEqnMode();
          break;
          case "mode2":
          diffusionEqnMode();
          break;
          default:
          noMode();
        }
      }
    })
  })




// CONTENT ////////////////////////////////////////////////////////

  var readme = document.querySelector(".content.tog3")
  var resume = document.querySelector(".content.tog4")

  readme.innerHTML = fs.readFileSync(__dirname + '/docs/readme.html')
  resume.innerHTML = fs.readFileSync(__dirname + '/docs/resume.html')

// MODE FUNCTIONS ///////////////////////////////////////////////////




  // Function called on window resize which resets both canvas dims
  // as well as calling physics engine resize method.
  // Also acts as a general clearing house.
  function resetScreen() {
    window.onresize = function(e) {
      rows = Math.floor(window.innerHeight / xlen)
      cols = Math.floor(window.innerWidth / ylen)
      field.setResolution(rows, cols)
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      //field.s = buildSprites(10)
    }
    window.onresize()
  }




  // Function to clear previous bindings and interval
  // timers from previously selected modes
  function clearMode(type, fn) {
    var i
    listeners.removeAllListeners()

    for (i = 0; i < intID.length; i++) {
      clearInterval(intID[i])
    }

  }

  /*
   * Wave Equation Mode
   */

  function waveEqnMode() {
    clearMode()

    var dropletStream = mx.createWriteStream("dropletStream")

    field = engine( {
      dt: 0.1
    , gamma: 0.02
    , eqn: "wave"
    })
    resetScreen()
    var ca = cg.colorgrad("#000092", {lum: -1, nshades:41}).reverse()
    var cb = cg.colorgrad("#000092", {lum: 1, nshades:41})
    cb.shift()
    field.cg = ca.concat(cb)

    field.mag = 15

    // Bind Click Events /////////////////////////////////////

    listeners.addListener(canvas, "click", function (evt) {
      var xp = evt.pageX
        , yp = evt.pageY
      dropletStream.write( {
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

  }




  /*
   * Diffusion Equation Mode
   */
  function diffusionEqnMode() {
    clearMode()

    var dropletStream = mx.createWriteStream("dropletStream")

    field = engine( {
      dt: 0.1
    , eqn: "diffusion"
    , gamma: 0.5
    })
    resetScreen()
    field.mag = 30
    // Click Binding //////////////////////////////////////////
    listeners.addListener(canvas, "mousemove", function (evt) {
      xpix = evt.pageX
      ypix = evt.pageY
    })

    intID[0] = setInterval(tracedrops, 50)


    function tracedrops() {
      if (xpix) {
        field.addSource( (ypix / ylen) | 0, (xpix / xlen) | 0, field.mag)
        dropletStream.write( {
          x: xpix / window.innerWidth
        , y: ypix / window.innerHeight
        })
      }
    }


    // Set render configurations
    field.scale = 10
    field.maxval = 80
    field.adj = 0
    field.cg = cmap({'colormap': 'jet', 'nshades': 81 })
    // Start Animation
    intID[1] = setInterval(renderField, 50)

  } // END DIFFUSIONEQMODE




  /*
   * No Mode!
   */
  function noMode() {
    clearMode()
    resetScreen()
  }



  /*
   * Server rerouted external Client events
   */
    mx.on('connection', function (conn) {

      if (conn.meta === "client-droplet") {

        conn.on('data', function (d) {
          var yp = Math.round( d.y * window.innerHeight ) //recover from percentage
            , xp = Math.round( d.x * window.innerWidth ) // to this user resolution
          field.addSource( (yp / ylen) | 0, (xp / xlen) | 0 , field.mag)
        })

      }
    })



  /*
   * Draw Canvas
   */
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

  /*
   * Start Sequence
   *
   */
  (function () {
    document.querySelector("#mode1").click()
    var t1 = 250
    var t2 = 1000
    var xmax = window.innerWidth
    var ymax = window.innerHeight
    var numdrops = 15

    function rain () {
      var time = Math.floor(Math.random() * (t2 - t1 + 1)) + t1
      var x = Math.floor(Math.random() * (xmax - 2)) + 1
      var y = Math.floor(Math.random() * (ymax - 2)) + 1
      field.addSource( (y / ylen) | 0, (x / xlen) | 0 , field.mag)
      if (--numdrops > 1)
        setTimeout( rain, time)
    }

    rain()

  })()

})


function nodeArray (nodelist) {
  var nodeArray = []
  for (var i = 0; i < nodelist.length; ++i)
    nodeArray[i] = nodelist[i]
  return nodeArray
}


function toggleClass (className, bool, elem) {
  /*
   * Toggles class on or off depending on its state
   * If "bool" is true: Only toggles to "on" state
   * If "bool" is false: Only toggles class off.
   * Set "bool" to null to get usual behaviour
   */
  var index = elem.className.indexOf(className)
  if ( (index >= 0) && (bool !== true) ) {
    elem.className = cut(elem.className, index, index + className.length)
    if (elem.className.slice(-1) === ' ')
      elem.className = elem.className.slice(0, -1)
    index = false
  }
  else if ( (index < 0) && (bool !== false) ) {
    elem.className = elem.className ? (elem.className + " " + className) : className
    index = true
  }

  return index
}

function cut(str, cutStart, cutEnd){
  return str.substr(0,cutStart) + str.substr(cutEnd+1)
}

var curry = function (fn) {
  var slice = [].slice,
      args = slice.call(arguments, 1)
  return function () {
    return fn.apply(this, args.concat(slice.call(arguments)))
  }
}

var listeners = {
  list: []
, addListener: function (elem, type, fn) {
    elem.addEventListener(type, fn)
    this.list.push({
      "type": type
    , "elem": elem
    , "fn": fn
    })
  }
, removeAllListeners: function () {
    this.list.forEach( function (l) {
      l.elem.removeEventListener(l.type, l.fn)
    })
    this.list = []
  }
}