/*jshint asi: true*/
/*jshint laxcomma: true*/
"use strict";
var field = require("./public/wavefield.gen.js")()
var printarr = require("./printArray.js")


field.setResolution(10, 10)
var i
  , start = Date.now()
for (i = 0; i < 100000; i++) {
  var u = field.update2()
}
//  printarr( u , 7)
//  console.log('')
console.log(Date.now() - start)



var coeffs = [
    [0.0, -1.0, 0.0]
  , [-1.0, 4.0, -1.0]
  , [0.0, -1.0, 0.0]
]

var C = [
    [1.3, 2.3, 3.3, 4.3, 5.3, 4.3]
  , [6.3, 7.3, 8.3, 9.3, 1.3, 3.3]
  , [1.3, 2.3, 3.3, 4.3, 5.3, 2.3]
  , [6.3, 7.3, 8.3, 9.3, 1.3, 7.3]
  , [1.0, 2.0, 3.0, 4.0, 5.0, 1.0]
  , [6.0, 7.0, 8.0, 9.0, 1.0, 1.0]
]

var C0 = [
    [0.0, 0.0, 0.0 ,0.0, 0.0, 0.0, 0.0, 0.0]
  , [0.0, 1.3, 2.3, 3.3, 4.3, 5.3, 4.3, 0.0]
  , [0.0, 6.3, 7.3, 8.3, 9.3, 1.3, 3.3, 0.0]
  , [0.0, 1.3, 2.3, 3.3, 4.3, 5.3, 2.3, 0.0]
  , [0.0, 6.3, 7.3, 8.3, 9.3, 1.3, 7.3, 0.0]
  , [0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 1.0, 0.0]
  , [0.0, 6.0, 7.0, 8.0, 9.0, 1.0, 1.0, 0.0]
  , [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
]

/*
field.setResolution(6, 6)
var i
for( i = 0; i < 2; i++) {
  C = field.conv2(C, coeffs)
  printarr(C, 6 )
  //console.log(Ca)
  console.log('')
}
*/

// ALTERNATE CONV2 TRIALS
/*
  function conv2(u, dum1, kernel, rows, cols, k, K) {
  // u is data array, dum is a predefined array for out data
  // kernel is the convolution kernel
  // rows and cols are the max data dimensions
  // k is the kxk kernel dimension and K is 1/2 * k
  var i, ii, j, jj, m, mm, sum, n, nn
  for(i=0; i < rows; ++i) {      // rows
    for(j=0; j < cols; ++j) {    // columns
      sum = 0                    // init to 0 before sum
      for(m=0; m < k; ++m) {     // kernel rows
        mm = k - 1 - m           // row index of flipped kernel
        for(n=0; n < k; ++n) {   // kernel columns
          nn = k - 1 - n         // column index of flipped kernel
          // index of input signal, used for checking boundary
          ii = i + (m - K)
          jj = j + (n - K)
          // ignore input samples which are out of bound
          if( ii >= 0 && ii < rows && jj >= 0 && jj < cols )
            sum += u[ii][jj] * kernel[mm][nn];
        }
      }
      dum1[i][j] = sum
    }
  }
  return dum1
}

  function conv2(image, kernel, out) {
    var i, j, ii, jj, data, kern, sum
    for (i = 1; i < height - 1; ++i) { // iterate through image
      for (j = 1; j < width - 1; ++j) {
        sum = 0; // sum will be the sum of input data * coeff terms
        for (ii = - 1; ii <= 1; ++ii) { // iterate over kernel
          for (jj = - 1; jj <= 1; ++jj) {
            data = image[i + ii][j +jj];
            kern = kernel[ii + 1][jj + 1];
            sum += data * kern;
          }
        }
        out[i][j] = sum
      }
    }
    return out
  }
*/