/*jshint asi: true*/
/*jshint laxcomma: true*/
"use strict";
var field = require("pde-engine")({
    dt: 0.1
  , gamma: 0.02
  , eqn: "wave"
  })
var printarr = require("./printArray.js")

var m = 25
var n = 25
	, absmax = 0
	, i
	, dist = []

for (i = 0; i <= 200; ++i) {
	dist[i] = 0
}

field.setResolution(m, n)

field.addSource(5 , 5, 35)

for (i = 0; i < 500; i++) {
  var u = field.update()
  maxval(u)
  distribution(u)
  var row = Math.floor( Math.random() * m  )
  var col = Math.floor( Math.random() * n  )

  console.log(u[15][15])
}

//console.log(dist)
//console.log(absmax)
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