"use strict"

var field = require('./public/wavefield.gen.js')()




var A = [
    [1, 2, 3, 4, 5]
  , [6, 7, 8, 9, 1]
  , [1, 2, 3, 4, 5]
  , [6, 7, 8, 9, 1]
  , [1, 2, 3, 4, 5]
]


var B = [
    [1, 2, 3, 4, 5]
  , [6, 7, 8, 9, 1]
  , [1, 2, 3, 4, 5]
  , [6, 7, 8, 9, 1]
  , [1, 2, 3, 4, 5]
  , [6, 7, 8, 9, 1]
]

var C = [
    [1, 2, 3, 4, 5, 4]
  , [6, 7, 8, 9, 1, 3]
  , [1, 2, 3, 4, 5, 2]
  , [6, 7, 8, 9, 1, 7]
  , [1, 2, 3, 4, 5, 1]
  , [6, 7, 8, 9, 1, 1]
]


var coeffs = [
    [0, 1, 0]
  , [1, -4, 1]
  , [0, 1, 0]
]

var outA = Array.matrix(5, 5, 0)
  , outB = Array.matrix(6, 5, 0)
  , outC = Array.matrix(6, 6, 0)

var Ac = field.conv2(A, outA, coeffs, 5, 5, 3, 1)
  , Bc = field.conv2(B, outB, coeffs, 6, 5, 3, 1)
  , Cc = field.conv2(C, outC, coeffs, 6, 6, 3, 1)

console.log(Ac)
console.log('')
console.log(Bc)
console.log('')
console.log(Cc)
