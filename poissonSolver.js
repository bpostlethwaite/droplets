/*jshint asi: true*/
/*jshint laxcomma: true*/

exports = module.exports = function poissonSolver() {
	"use strict";

  var that = {}
    , u             // main data array
    , si = []       // poisson sources x dim
    , sj = []       // poisson sources y dim
    , width
    , height

function poissonUpdate () {
    // Solves the Poisson equation PDE
    // using Successive Overrelaxation (SOR) - Gauss Seidel Method
    var row, col, i
    for (row = 1; row < (height - 1); ++row) {
      for (col = 1; col < (width - 1); ++col) {
        u[row][col] = (u[row-1][col] + u[row+1][col] +
          u[row][col-1] + u[row][col+1]) / 4
        for (i = 0; i < si.length; i++) {
          if (row === si[i] && col === sj[i]) {
            u[row][col] = 0
          }
        }
      }
    }
    return u
  }


  function addSource (row, col) {
    si.push(row)
    sj.push(col)
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
    // Also sets up Poisson Default Array, and default source
    u = Array.matrix(height, width, 0)
    initPoisson()
  }

  function initPoisson() {
    // Initializes 1's at border, so with the gravity wells
    // inside will make a parabolic potential field.
    // For speed when a new gravity well is added it solves SOR using multigrid
    // approach.
    var i , j
    si[0] = 0.5*height | 0;
    sj[0] =  0.5*width | 0
    si[1] = si[0] - 3
    sj[1] = sj[0] - 3
    si[2] = si[0] + 3
    sj[2] = sj[0] - 3
    si[3] = si[0] - 3
    sj[3] = sj[0] + 3
    si[4] = si[0] + 3
    sj[4] = sj[0] + 3

    for (i = 0; i < height; i += 1) {
      for (j = 0; j < width; j += 1) {
        u[i][j] = 10 - 10 / Math.sqrt((Math.sqrt( (i - si[0])*(i - si[0]) + (j - sj[0])*(j - sj[0])) ))
        if (i === 0 || i === (height - 1) || (j === 0) || (j === (width - 1) )) {
          u[i][j] = 10
        }
      }
    }
    u[si[0]][sj[0]] = 0
    u[si[1]][sj[1]] = 0
    u[si[2]][sj[2]] = 0
    u[si[3]][sj[3]] = 0
    u[si[4]][sj[4]] = 0
  }

  function setResolution (hRes, wRes) {
    // when screen size is resized and upon init
    // this does basic checking then calls reset
    // to modify array sizes.

    width = wRes
    height = hRes
    reset()

  }


  that.setResolution = setResolution
  that.poissonUpdate = poissonUpdate
  that.addSource = addSource

  return that
}
