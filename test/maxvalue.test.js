/*jshint asi: true*/
/*jshint laxcomma: true*/
"use strict";
var field = require("../public/wavefield.gen.js")()
var printarr = require("../printArray.js")

var m = 25
var n = 25
	, absmax = 0
	, i
	, dist = []

for (i = 0; i <= 200; ++i) {
	dist[i] = 0
}

field.setResolution(m, n)

for (i = 0; i < 500; i++) {
  var u = field.update()
  maxval(u)
  distribution(u)
  var row = Math.floor( Math.random() * m  )
  var col = Math.floor( Math.random() * n  )
  field.addDroplet(row , col)
}

console.log(dist)
console.log(absmax)
function maxval (arr) {
	var i, j, max = 0
	for (i = 0; i < m; ++i) {
		for (j = 0; j < n; ++j) {
			if (arr[i][j] > max) {
				max = arr[i][j]
			}
		}
	}
	if (max > absmax)
		absmax = max
}

function distribution (arr) {
	var i, j, num = 0
	for (i = 0; i < m; ++i) {
		for (j = 0; j < n; ++j) {
			num = Math.abs( Math.floor( arr[i][j] * 100 ) )
			if (num >= 200) num = 200
			dist[num]++
		}
	}
}

//printarr( u , 7)