/*jshint asi: true*/
/*jshint laxcomma: true*/
"use strict";

function wavefield() {

  var that = {}
    , dt = 0.1
    , dx = 1
    , gamma = 0.002 // decay factor
    , vel = 1 // velocity
    , dsz = 3 // droplet size
    , da = 1  // droplet amplitude
    , u
    , un
    , up
    , dum1
    , dum2
    , width
    , height
    , coeffs = [ // 2d laplace operator
      [0, 1, 0]
    , [1, -4, 1]
    , [0, 1, 0]
    ]
  var c1 = 2 - gamma * dt
  var c2 = gamma * dt - 1
  var c3 = (dt*dt * vel*vel) / (dx*dx)

  function update () {
    var i, j
    var dum2 = conv2(u, dum1, coeffs, height, width, 3, 1)
    for (i = 0; i < height; ++i) {
      for (j = 0; j < width; ++j) {
        un[i][j] = c1 * u[i][j] + c2 * up[i][j] + c3 * dum2[i][j]
        up[i][j] = u[i][j] // current becomes old
        u[i][j] = un[i][j] // new becomes current
      }
    }
  return u
  }

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
          nn = k - 1 - n     // column index of flipped kernel
          // index of input signal, used for checking boundary
          ii = i + (m - K)
          jj = j + (n - K)
          // ignore input samples which are out of bound
          if( ii >= 0 && ii < rows && jj >= 0 && jj < cols )
            dum1[i][j] += u[ii][jj] * kernel[mm][nn];
        }
      }
    }
  }
  return dum1
}

  Array.matrix = function (m , n, initial) {
    var a, i , j, mat = []
    for (i = 0; i < m; i += 1) {
      a = []
      for (j = 0; j < n; j += 1) {
        a[j] = initial
      }
      mat[i] = a
    }
    return mat
  }

  function reset() {
    u = Array.matrix(width, height, 0)
    u[ Math.round(height/2) ][ Math.round(width/2) ] = 1
    up = Array.matrix(width, height, 0)
    un = Array.matrix(width, height, 0)
    dum1 = Array.matrix(width, height, 0)
    dum2 = Array.matrix(width, height, 0)
  }

  function setResolution (hRes, wRes) {
    var res = wRes * hRes
    if (res > 0 && res < 1000000 && (wRes != width || hRes != height)) {
      width = wRes
      height = hRes
      reset()
      return true
    }
    return false
  }

  function getdims () {
    return [height, width]
  }

  that.setResolution = setResolution
  that.update = update
  that.getdims = getdims

  return that
}

