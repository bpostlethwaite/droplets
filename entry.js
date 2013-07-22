"use strict";

var engine = require('pde-engine')
  , cg = require('colorgrad')()
  , cmap = require('colormap')
  , fs = require('fs')
  , reconnect = require('reconnect/shoe')
  , domready = require('domready')
  , toggler = require('./toggler')

domready( function () {

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
    , stream


  /*
   * Apply reconnect logic
   */
  reconnect(function (restream) {
    stream = restream


    stream.on('data', function (d) {

      try {
        d = JSON.parse(d)
      } catch (e) {return}

      var yp = Math.round( d.y * window.innerHeight ) //recover from percentage
        , xp = Math.round( d.x * window.innerWidth ) // to this user resolution

      field.addSource( (yp / ylen) | 0, (xp / xlen) | 0 , field.mag)

    })
  }).connect("/droplets")



  /*
   *  This turns on and off button selected class for animations
   */
  var categories = nodeArray(document.querySelectorAll('.category'))

  var catog = toggler('selected')
  var i = 1
  categories.forEach( function (cat) {
    catog.toggleNode(cat, 'tog' + i++)
  })

  var modetog = toggler('selectedII')

  var mode1 = document.querySelector(".mode1")
  var mode2 = document.querySelector(".mode2")

  modetog.toggleNode(mode1, 'mode1', setMode(waveEqnMode, clearMode))
  modetog.toggleNode(mode2, 'mode2', setMode(diffusionEqnMode, clearMode))

  // CONTENT ////////////////////////////////////////////////////////

  var readme = document.querySelector(".content.tog3")
  var resume = document.querySelector(".content.tog4")

  readme.innerHTML = fs.readFileSync(__dirname + '/docs/readme.html')
  resume.innerHTML = fs.readFileSync(__dirname + '/docs/resume.html')


  // CONNECTOR POSITIONS //////////////////////////////////////////////
  categories.forEach(function (category) {
    var pos = category.getBoundingClientRect()
    var connector = document.querySelector(".connector." + category.id)
    connector.style.marginTop = Math.round(pos.top + 0.5 * pos.height) + "px"
  })


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
    resetScreen()
  }


  /*
   * Wave Equation Mode
   */

  function waveEqnMode() {
    clearMode()

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

    // Stream Click Events /////////////////////////////////////

    listeners.addListener(canvas, "click", function (evt) {

      stream.write( JSON.stringify({
        x: evt.pageX / window.innerWidth // turn into percentage
      , y: evt.pageY / window.innerHeight // before sending
      }))
      field.addSource( (evt.pageY / ylen) | 0 , (evt.pageX / xlen) | 0 , field.mag)
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
        stream.write( JSON.stringify({
          x: xpix / window.innerWidth
        , y: ypix / window.innerHeight
        }))
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







/*
 * HELPER FUNCS //////////////////////////////////////////////////////////////
 */


function nodeArray (nodelist) {
  var nodeArray = []
      for (var i = 0; i < nodelist.length; ++i)
               nodeArray[i] = nodelist[i]
  return nodeArray
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

function setMode (onPass, onFail) {
  return function (bool) {
    if (bool)
      onPass()
    else
      onFail()
  }
}


function getPos(el) {
  for (var lx=0, ly=0;
       el != null;
       lx += el.offsetLeft, ly += el.offsetTop, el = el.offsetParent)
    return {x: lx,y: ly}
}
