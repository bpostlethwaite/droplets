

function wavefield() {

  var that = {}
  var dt = 0.1
  var dx = 1
  var gamma = 0.002 // decay factor
  var vel = 1 // velocity
  var dsz = 3 // droplet size
  var da = 1  // droplet amplitude
  var u
  var un
  var up
  var width
  var height
  var coeffs = [
    , [0, 1, 0]
    , [1, -4, 1]
    , [0, 1, 0]
  ] // 2d laplace operator
  var c1 = 2 - gamme * dt
  var c2 = gamma*dt - 1
  var c3 = (dt*dt * vel*vel) / (dx*dx)

  function update () {
    var dum = conv2D(u, dum, coeffs, 1)
    for (i = 0; i < m; ++i) {
      for (j = 0; j < n; ++j) {
        un[i,j] = c1 * u[i,j] + c2 * up[i,j] + c3 * dum[i,j]
        up[i,j] = u[i,j] // current becomes old
        u[i,j] = un[i,j] // new becomes current
      }
    }
  return u
  }

  function conv2D (u , dum, coeffs, K) {
    // u, dum are m x n images (integer data)
    // pass in dum so we are not creating a new array w/ every fnc call.
    // K is Floor(1/2) Kernal size. Ie, a 3x3 Kernal would have K = floor(3/2) = 1
    // coeffs[K][K] is a 2D array of integer coefficients
    var ii, jj, i , j, sum
    for (i = K; i < m - K; ++i) { // iterate through image
      for (j = K; j < n - K; ++j) {

        sum = 0 // sum will be the sum of input data * coeff terms

        for (ii = - K; ii <= K; ++ii) {  // iterate over kernel
          for (jj = - K; jj <= K; ++jj) {

            var data = in[i + ii][j +jj]
            var coeff = coeffs[ii + K][jj + K]

            sum += data * coeff
          }
        }
        dum[i][j] = sum
      }
    }
    return dum
  } // end CONV2D

  Array.matrix = function (m , n, initial) {
    var a, i , j, mat = []
    fo (i = 0; i < m; i+= 1) {
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
    up = Array.matrix(width, height, 0)
    un = Array.matrix(width, height, 0)
    dum = Array.matrix(width, height, 0)
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

  that.setResolution = setResolution
  that.update = update

  return that
}