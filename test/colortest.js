var cmap = require("colormap")

console.log(typeof cmap)

var canvas = document.getElementById('canvas')
, c = canvas.getContext('2d')

  var colorgradI = [
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

var colorgradII = cmap({'colormap': 'jet', 'nshades': colorgradI.length }).reverse()


var i
for (i = 0; i < colorgradI.length; ++i) {
c.fillStyle = colorgradI[i] // start ind at index 0
c.fillRect(i*10, 1, 10, 200)
c.fillStyle = colorgradII[i] // start ind at index 0
c.fillRect(i*10, 201, 10, 200)
}