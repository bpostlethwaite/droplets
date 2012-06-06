/*jshint asi: true*/
/*jshint laxcomma: true*/
"use strict";


module.exports = function printArray (arr) {
	var rowlen = arr.length
		, collen = arr[0].length
	var i, j, c, a
	for (i = 0; i < rowlen; i++) {
		for (j = 0; j < collen; j++) {
			a = Math.round( arr[i][j] * 100 ) / 100
			c = a.toString()
			process.stdout.write( c )
			process.stdout.write("  ")
		}
		process.stdout.write("\n")
	}
}