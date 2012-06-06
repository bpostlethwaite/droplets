/*jshint asi: true*/
/*jshint laxcomma: true*/
"use strict";
function mapdisplay(field) {

  var that = {}

  function mapfield () {
    var row
      , col
      , str = []
      , htmlmap = ''
      , f = field.update()
      , dims = field.getdims()
      , height = dims[0]
      , width = dims[1]

    for (row = 0; row < height; ++row) {
      for (col = 0; col < width; ++col) {
        str[col] = String.fromCharCode( Math.round( f[row][col] * 10 ) + 48 )
      }
      htmlmap += str.join('') + '\n'
    }
    return htmlmap
  }

  function start(DOMElement, timeout) {
    function animate() {
      DOMElement.innerHTML = mapfield()
      window.setTimeout(animate, timeout)
    }
    animate()
  }

  function startTEST(DOMElement, timeout) {
    function animate() {
      var ind = Math.floor(Math.random()*11)
      DOMElement.innerHTML = ind
      window.setTimeout(animate, timeout)
    }
    animate()
  }

  that.start = start
  that.startTEST = startTEST

  return that

}