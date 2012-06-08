/*jshint asi: true*/
/*jshint laxcomma: true*/
"use strict";

function mapdisplay(field) {
  var that = {}
  var charmap = ['A', 'B', 'C', 'D', 'E'
            , 'F', 'G', 'H', 'I', 'J', 'K', 'L'
            , ' ', 'N', 'O', 'P', 'Q', 'R', 'S'
            , 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

  function mapfield() {
    var row, col, str = []
      , htmlmap = ''
      , f = field.update()
      , height = field.getHeight()
      , width = field.getWidth()
      , val, round, ind

    for (row = 0; row < height; ++row) {
      for (col = 0; col < width; ++col) {
        val = f[row][col]
        // The following should result in an indices range from
        // -12 : 13 <add 12 at end to make it indexible>
        round = Math[val < 0 ? 'ceil' : 'floor'] // symmetric behaviour
        if (Math.abs(val) < 1) {
          ind = round(val * 10)
        }
        else if (Math.abs(val) < 2) {
          ind = round(val * 3) + 7 * (val < 0 ? -1 : 1)
        }
        else ind = 13
        str[col] = charmap[ind + 12]
      }
      htmlmap += str.join('') + '\n'
    }
    return htmlmap
  }

  function start(DOMElement, timeout) {
    function animate() {
      //var start = Date.now()
      DOMElement.innerHTML = mapfield()
      //console.log( start - Date.now() )
      window.setTimeout(animate, timeout)
    }
    animate()
  }

  function startTEST(DOMElement, timeout) {
    function animate() {
      var ind = Math.floor(Math.random() * 11)
      DOMElement.innerHTML = ind
      window.setTimeout(animate, timeout)
    }
    animate()
  }
  that.start = start
  that.startTEST = startTEST
  return that
}