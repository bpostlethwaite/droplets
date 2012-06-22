/*jshint asi: true*/
/*jshint laxcomma: true*/

function fieldgen() {
	"use strict";

  var that = {}
    , dt = 0.1
    , dx = 1
    , gamma = 0.02 // wave decay factor
    , vel = 2       // wave velocity
    , alpha = 0.5     // diffusion paramter
    , u             // main data array
    , un            // next time step data array
    , up            // previous time step data array
    , width
    , height
    , coeffs = [   // 2d laplace operator
      [0, 1, 0]
    , [1, -4, 1]
    , [0, 1, 0]
    ]
  , gauss = [
      [1/256,  4/256,  6/256,  4/256, 1/256]
    , [4/256, 16/256, 24/256, 16/256, 4/256]
    , [6/256, 24/256, 36/256, 24/256, 6/256]
    , [4/256, 16/256, 24/256, 16/256, 4/256]
    , [1/256,  4/256,  6/256,  4/256, 1/256]
  ]

  var c1 = 2 - gamma * dt
  var c2 = gamma * dt - 1
  var c3 = (dt*dt * vel*vel) / (dx*dx)
  var c4 = alpha * dt / (dx * dx)


  function waveUpdate () {
    // Solves the wave equation PDE
    // using convolution.
    var row, col
    var dum = conv2(u, coeffs)
    for (row = 0; row < height; ++row)
      for (col = 0; col < width; ++col) {
        un[row][col] = c1 * u[row][col] + c2 * up[row][col] + c3 * dum[row][col]
        up[row][col] = u[row][col] // current becomes old
        u[row][col] = un[row][col] // new becomes current
      }
    return u
  }

  function diffusionUpdate () {
    // Solves the wave equation PDE
    // using convolution.
    var row, col
    var dum = conv2(u, coeffs)
    for (row = 0; row < height; ++row)
      for (col = 0; col < width; ++col) {
        un[row][col] = u[row][col] +  c4 * dum[row][col]
        u[row][col] = un[row][col] // new becomes current
      }
    return u
  }

  function addDroplet (row, col, mag) {
    // adds a new gaussian droplet to u
    // at specified coordinates.
    // (For now just adds a point source)
    var i, j
    for ( i = -2; i <= 2; i++ ) {
      for ( j = -2; j <= 2; j++ ) {
        if( row + i >= 0 && col + j >= 0 &&
            row + i < height && col + j < width) {
          u[row + i][col + j] += mag * gauss[i + 2][j + 2]
        }
      }
    }
  }

  function conv2(image, kernel) {
    // iterates over image, then over kernel and
    // multiplies the flipped kernel coeffs
    // with appropriate image values, sums them
    // then adds into new array entry.
    var out = Array.matrix(height, width, 0)
    var acc = 0
    , row, col, i, j, k
    for ( row = 0; row < height; row++ ) {
      for ( col = 0; col < width; col++ ) {
        for ( i = -1; i <= 1; i++ ) {
          for ( j = -1; j <= 1; j++ ) {
            if( row+i >= 0 && col+j >= 0 &&
                row+i < height && col+j < width) {
              k = image[ row+i ][ col+j ]
              acc += k * kernel[1+i][1+j]
            }
          }
        }
        out[row][col] = acc
        acc = 0
      }
    }
    return out
  }

  Array.matrix = function (m , n, initial) {
    // Array extender function adds capability
    // of initializing 2D matrices of mxn size
    // to default value = initial
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
    // function matches the matrix calculation sizes to
    // res size by init'ing new matrices.
    u = Array.matrix(height, width, 0)

    up = Array.matrix(height, width, 0)
    un = Array.matrix(height, width, 0)
  }

  function setResolution (hRes, wRes) {
    // when screen size is resized and upon init
    // this does basic checking then calls reset
    // to modify array sizes.
    var res = wRes * hRes
    if (res > 0 && res < 1000000 && (wRes != width || hRes != height)) {
      width = wRes
      height = hRes
      reset()
      return true
    }
    return false
  }

  function getHeight () {
    return height
  }

  function getWidth () {
    return width
  }

  that.setResolution = setResolution
  that.waveUpdate = waveUpdate
  that.diffusionUpdate = diffusionUpdate
  that.getHeight = getHeight
  that.getWidth = getWidth
  that.addDroplet = addDroplet
  return that
}
