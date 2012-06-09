/*jshint asi: true*/
/*jshint laxcomma: true*/
"use strict";
jQuery(document).ready(function($) {
  // Set vars, dims and elements
  var el = document.getElementById('wave')
  var socket = io.connect("50.116.7.59")
  var field = wavefield()
  var map = mapdisplay(field)
  var pixel2Height
  var pixel2Width

// ON RESIZE //////////////////////////////////////////////////////////////
  $(window).resize(function(e) {
    var dimfuncs = pixel2dim()
    pixel2Height = dimfuncs[0]
    pixel2Width = dimfuncs[1]
    field.setResolution(pixel2Height($(window).height()), pixel2Width($(window).width()))
  }).trigger('resize')

// BINDINGS ///////////////////////////////////////////////////////////////
  $('html').click(function(evt) {
    var d = {}
      , xpix = evt.pageX
      , ypix = evt.pageY
    d.x = xpix / $(window).width() // turn into percentage
    d.y = ypix / $(window).height() // before sending
    socket.emit('clientDroplet', d)
    field.addDroplet(pixel2Height(ypix), pixel2Width(xpix))
  })

// SOCKETS ////////////////////////////////////////////////////////////////
  socket.on('newDroplet', function(d) {
    var ypix = Math.round(d.y * $(window).height()) //recover from percentage
      , xpix = Math.round(d.x * $(window).width()) // to this user resolution
    field.addDroplet(pixel2Height(ypix), pixel2Width(xpix))
  })

// START ANIMATION /////////////////////////////////////////////////////////
  map.start(el, 15)
}) // end JQuery

function pixel2dim() {
  // returns two function in an array. One for returning the row height
  // for a given pixel, the other for returning the column width for a given
  // x dimension pixel. The reason for the returning of functions is so this
  // main pixel2dim func can be created less frequently (only on screen resize)
  // than the more simple returned funcs who use the screen size data
  // in the closure to output the rows and cols.
  var div = document.createElement("div")
  div.style.position = "absolute"
  div.style.visibility = "hidden"
  div.style.fontFamily = "Courier New"
  div.style.fontSize = "11px"
  div.innerHTML = "M"
  document.body.appendChild(div)
  var dim = {
    width: div.offsetWidth,
    height: div.offsetHeight
  }
  document.body.removeChild(div)
  // this won't be perfect, as the screen dims won't often be evenly divisible
  return [function(pixelHeight) {
    return Math.round(pixelHeight / dim.height)
  }, function(pixelWidth) {
    return Math.round(pixelWidth / dim.width)
  }]
}
// If using an overlay, or area you don't want to
// receive mouseclicks from use:
// $('#sacredcontainer').click(function(event){
//      event.stopPropagation()
//  })