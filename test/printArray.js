/*jshint asi: true*/
/*jshint laxcomma: true*/
"use strict";


module.exports = function printArray (arr, spacer) {
  var rowlen = arr.length
  , collen = arr[0].length
  var i, j, k, c, a
  for (i = 0; i < rowlen; i++) {
    for (j = 0; j < collen; j++) {
      a = Math.round( arr[i][j] * (spacer - 1) ) / (spacer - 1)
      c = a.toString()
      if (c.length > spacer)
        c = c.slice(0, spacer)
      if (c.length <= spacer)
        for(k = c.length; k < spacer + 1; k++)
          c += " "
      process.stdout.write( c )
    }
    process.stdout.write("\n")
  }
}