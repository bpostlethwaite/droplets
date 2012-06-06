/*jshint asi: true*/
/*jshint laxcomma: true*/
"use strict";
function mapdisplay(field) {

  var that = {}

  function mapfield () {
    var x
      , y
      , row = []
      , htmlmap = ''
      , f = field.update()
      , dims = field.getdims()
      , height = dims[0]
      , width = dims[1]

    for (y = 0; y < height; y++) {
      for (x = 0; x < width; x++) {
        row[x] = String.fromCharCode( Math.round( f[y][x] * 10 ) + 48 )
      }
      htmlmap += row.join('') + '\n'
    }
    return htmlmap
  }

  function display(DOMElement, timeout) {
    function animate() {
      DOMElement.innerHTML = mapfield()
      window.setTimeout(animate, timeout)
    }
    animate()
  }

  that.display = display

  return that

}