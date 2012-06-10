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

  function BuildColorGrad(baseShade, numElem, lum) {
    // Build the gradient variable from a starting darkest shade.
    // Goes up in lum/numElement increments, where lum
    // is percent / 100 (1 = 100% increase)
    var i
      , nc
      , inc = lum/numElem
      , sp1 = '<span style="color:'
      , sp2 = '">'
      , char = "X"
      , sp3 = "</span>"
    for (i = 0; i < numElem; ++i) {
      nc = colorLuminance(baseShade, i*inc)
    }
  }

  that.start = start
  return that
}