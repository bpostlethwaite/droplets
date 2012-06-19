
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

var colorgrad = buildColorGrad("#05050D", 41, 18)

console.log(colorgrad[20])

