(function(){var require = function (file, cwd) {
    var resolved = require.resolve(file, cwd || '/');
    var mod = require.modules[resolved];
    if (!mod) throw new Error(
        'Failed to resolve module ' + file + ', tried ' + resolved
    );
    var cached = require.cache[resolved];
    var res = cached? cached.exports : mod();
    return res;
};

require.paths = [];
require.modules = {};
require.cache = {};
require.extensions = [".js",".coffee",".json"];

require._core = {
    'assert': true,
    'events': true,
    'fs': true,
    'path': true,
    'vm': true
};

require.resolve = (function () {
    return function (x, cwd) {
        if (!cwd) cwd = '/';
        
        if (require._core[x]) return x;
        var path = require.modules.path();
        cwd = path.resolve('/', cwd);
        var y = cwd || '/';
        
        if (x.match(/^(?:\.\.?\/|\/)/)) {
            var m = loadAsFileSync(path.resolve(y, x))
                || loadAsDirectorySync(path.resolve(y, x));
            if (m) return m;
        }
        
        var n = loadNodeModulesSync(x, y);
        if (n) return n;
        
        throw new Error("Cannot find module '" + x + "'");
        
        function loadAsFileSync (x) {
            x = path.normalize(x);
            if (require.modules[x]) {
                return x;
            }
            
            for (var i = 0; i < require.extensions.length; i++) {
                var ext = require.extensions[i];
                if (require.modules[x + ext]) return x + ext;
            }
        }
        
        function loadAsDirectorySync (x) {
            x = x.replace(/\/+$/, '');
            var pkgfile = path.normalize(x + '/package.json');
            if (require.modules[pkgfile]) {
                var pkg = require.modules[pkgfile]();
                var b = pkg.browserify;
                if (typeof b === 'object' && b.main) {
                    var m = loadAsFileSync(path.resolve(x, b.main));
                    if (m) return m;
                }
                else if (typeof b === 'string') {
                    var m = loadAsFileSync(path.resolve(x, b));
                    if (m) return m;
                }
                else if (pkg.main) {
                    var m = loadAsFileSync(path.resolve(x, pkg.main));
                    if (m) return m;
                }
            }
            
            return loadAsFileSync(x + '/index');
        }
        
        function loadNodeModulesSync (x, start) {
            var dirs = nodeModulesPathsSync(start);
            for (var i = 0; i < dirs.length; i++) {
                var dir = dirs[i];
                var m = loadAsFileSync(dir + '/' + x);
                if (m) return m;
                var n = loadAsDirectorySync(dir + '/' + x);
                if (n) return n;
            }
            
            var m = loadAsFileSync(x);
            if (m) return m;
        }
        
        function nodeModulesPathsSync (start) {
            var parts;
            if (start === '/') parts = [ '' ];
            else parts = path.normalize(start).split('/');
            
            var dirs = [];
            for (var i = parts.length - 1; i >= 0; i--) {
                if (parts[i] === 'node_modules') continue;
                var dir = parts.slice(0, i + 1).join('/') + '/node_modules';
                dirs.push(dir);
            }
            
            return dirs;
        }
    };
})();

require.alias = function (from, to) {
    var path = require.modules.path();
    var res = null;
    try {
        res = require.resolve(from + '/package.json', '/');
    }
    catch (err) {
        res = require.resolve(from, '/');
    }
    var basedir = path.dirname(res);
    
    var keys = (Object.keys || function (obj) {
        var res = [];
        for (var key in obj) res.push(key);
        return res;
    })(require.modules);
    
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key.slice(0, basedir.length + 1) === basedir + '/') {
            var f = key.slice(basedir.length);
            require.modules[to + f] = require.modules[basedir + f];
        }
        else if (key === basedir) {
            require.modules[to] = require.modules[basedir];
        }
    }
};

(function () {
    var process = {};
    var global = typeof window !== 'undefined' ? window : {};
    var definedProcess = false;
    
    require.define = function (filename, fn) {
        if (!definedProcess && require.modules.__browserify_process) {
            process = require.modules.__browserify_process();
            definedProcess = true;
        }
        
        var dirname = require._core[filename]
            ? ''
            : require.modules.path().dirname(filename)
        ;
        
        var require_ = function (file) {
            var requiredModule = require(file, dirname);
            var cached = require.cache[require.resolve(file, dirname)];

            if (cached && cached.parent === null) {
                cached.parent = module_;
            }

            return requiredModule;
        };
        require_.resolve = function (name) {
            return require.resolve(name, dirname);
        };
        require_.modules = require.modules;
        require_.define = require.define;
        require_.cache = require.cache;
        var module_ = {
            id : filename,
            filename: filename,
            exports : {},
            loaded : false,
            parent: null
        };
        
        require.modules[filename] = function () {
            require.cache[filename] = module_;
            fn.call(
                module_.exports,
                require_,
                module_,
                module_.exports,
                dirname,
                filename,
                process,
                global
            );
            module_.loaded = true;
            return module_.exports;
        };
    };
})();


require.define("path",function(require,module,exports,__dirname,__filename,process,global){function filter (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (fn(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length; i >= 0; i--) {
    var last = parts[i];
    if (last == '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Regex to split a filename into [*, dir, basename, ext]
// posix version
var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
var resolvedPath = '',
    resolvedAbsolute = false;

for (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {
  var path = (i >= 0)
      ? arguments[i]
      : process.cwd();

  // Skip empty and invalid entries
  if (typeof path !== 'string' || !path) {
    continue;
  }

  resolvedPath = path + '/' + resolvedPath;
  resolvedAbsolute = path.charAt(0) === '/';
}

// At this point the path should be resolved to a full absolute path, but
// handle relative paths to be safe (might happen when process.cwd() fails)

// Normalize the path
resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
var isAbsolute = path.charAt(0) === '/',
    trailingSlash = path.slice(-1) === '/';

// Normalize the path
path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }
  
  return (isAbsolute ? '/' : '') + path;
};


// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    return p && typeof p === 'string';
  }).join('/'));
};


exports.dirname = function(path) {
  var dir = splitPathRe.exec(path)[1] || '';
  var isWindows = false;
  if (!dir) {
    // No dirname
    return '.';
  } else if (dir.length === 1 ||
      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {
    // It is just a slash or a drive letter with a slash
    return dir;
  } else {
    // It is a full dirname, strip trailing slash
    return dir.substring(0, dir.length - 1);
  }
};


exports.basename = function(path, ext) {
  var f = splitPathRe.exec(path)[2] || '';
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPathRe.exec(path)[3] || '';
};

});

require.define("__browserify_process",function(require,module,exports,__dirname,__filename,process,global){var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
        && window.setImmediate;
    var canPost = typeof window !== 'undefined'
        && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return window.setImmediate;
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'browserify-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('browserify-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    if (name === 'evals') return (require)('vm')
    else throw new Error('No such module. (Possibly not yet loaded)')
};

(function () {
    var cwd = '/';
    var path;
    process.cwd = function () { return cwd };
    process.chdir = function (dir) {
        if (!path) path = require('path');
        cwd = path.resolve(dir, cwd);
    };
})();

});

require.define("/node_modules/pde-engine/package.json",function(require,module,exports,__dirname,__filename,process,global){module.exports = {"main":"pde-engine.js"}
});

require.define("/node_modules/pde-engine/pde-engine.js",function(require,module,exports,__dirname,__filename,process,global){/*  pde-engine
 *
 * A PDE solver for the wave and diffusion equations.
 *
 * Ben Postlethwaite 2012
 * benpostlethwaite.ca
 */

module.exports = function pdeEngine(spec) {
  var that = {}
    , spec = spec || {}
    , dt = spec.dt || 0.1
    , dx = spec.dx || 1
    , gamma = spec.gamma || 0.02   // wave decay factor
    , vel = spec.vel || 2          // wave velocity
    , alpha = spec.alpha || 1      // diffusion paramter
    , eqn = spec.eqn || 'wave'
    , u                            // main data array
    , un                           // next time step data array
    , up                           // previous time step data array
    , uu                           // poisson data array
    , si = []                      // poisson sources x dim
    , sj = []                      // poisson sources y dim
    , width
    , height
    , coeffs = [   // 2d laplace operator
        0,  1,  0
      , 1, -4,  1
      , 0,  1,  0
    ]
    , gauss = [
      1/256,  4/256,  6/256,  4/256, 1/256
      , 4/256, 16/256, 24/256, 16/256, 4/256
      , 6/256, 24/256, 36/256, 24/256, 6/256
      , 4/256, 16/256, 24/256, 16/256, 4/256
      , 1/256,  4/256,  6/256,  4/256, 1/256
    ]

  , c1 = 2 - gamma * dt
  , c2 = gamma * dt - 1
  , c3 = (dt*dt * vel*vel) / (dx*dx)
  , c4 = alpha * dt / (dx * dx)


  function waveUpdate () {
    // Solves the wave equation PDE
    // using convolution.
    var row, col, ind
    var dum = conv2(u, coeffs)
     for (row = 0; row < height; ++row)
      for (col = 0; col < width; ++col) {
        ind = row * width + col
        un[ind] = c1 * u[ind] + c2 * up[ind] + c3 * dum[ind]
        up[ind] = u[ind] // current becomes old
        u[ind] = un[ind] // new becomes current
      }
    return u
  }

  function diffusionUpdate () {
    // Solves the diffusion equation PDE
    // using convolution.
    var row, col, ind
    var dum = conv2(u, coeffs)
    for (row = 0; row < height; ++row)
      for (col = 0; col < width; ++col) {
        ind = row * width + col
        un[ind] = u[ind] +  c4 * dum[ind]
        u[ind] = un[ind] // new becomes current
      }
    return u
  }

  function conv2(image, kernel) {
    // iterates over image, then over kernel and
    // multiplies the flipped kernel coeffs
    // with appropriate image values, sums them
    // then adds into new array entry.
    var out = new Float64Array( height * width  )
    var acc = 0
    , row, col, i, j, k
    for ( row = 0; row < height; row++ ) {
      for ( col = 0; col < width; col++ ) {
        for ( i = -1; i <= 1; i++ ) {
          for ( j = -1; j <= 1; j++ ) {
            if( row+i >= 0 && col+j >= 0 &&
                row+i < height && col+j < width) {
              k = image[ (row + i) * width + (col + j)]
              acc += k * kernel[ (1 + i) * 3 + (1 + j)]
            }
          }
        }
        out[ row * width + col] = acc
        acc = 0
      }
    }
    return out
  }

  function addSource (row, col, mag) {
    // adds a new gaussian droplet to u
    // at specified coordinates.
    // (For now just adds a point source)
    var i, j
    for ( i = -2; i <= 2; i++ ) {
      for ( j = -2; j <= 2; j++ ) {
        if( row + i >= 0 && col + j >= 0 &&
            row + i < height && col + j < width) {
          u[(row + i) * width + (col + j)] += mag * gauss[ (i + 2) * 5 + j + 2]
        }
      }
    }
  }

  function reset() {
    // function matches the matrix calculation sizes to
    // res size by init'ing new matrices.
    // Also sets up Poisson Default Array, and default source
    u = new Float64Array( height * width  )
    up = new Float64Array( height * width )
    un = new Float64Array( height * width )
    uu = new Float64Array( height * width )
  }

  function setResolution (hRes, wRes) {
    // when screen size is resized and upon init
    // this does basic checking then calls reset
    // to modify array sizes.
    width = wRes
    height = hRes
    reset()
  }

  if (eqn === 'diffusion') {
    that.update = diffusionUpdate
  }
  else {
    that.update = waveUpdate
  }

  that.setResolution = setResolution
  that.addSource = addSource

  return that
}

});

require.define("/lib/poissonSolver.js",function(require,module,exports,__dirname,__filename,process,global){/*jshint asi: true*/
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

});

require.define("/lib/entry.js",function(require,module,exports,__dirname,__filename,process,global){/*jshint asi: true*/
/*jshint laxcomma: true*/
"use strict";


var engine = require('pde-engine')
  , poissonEngine = require('./poissonSolver.js')
//  , io = require('socket.io.js')


$(document).ready(function() {
  //var socket = io.connect("http://droplets.benjp.c9.io")
  var socket = io.connect("http://192.168.1.149:8081")
//  var socket = io.connect("wss://droplets.jit.su")

  , field = engine()
  , canvas = document.getElementById('canvas')
  , c = canvas.getContext('2d')
  , xlen = 12
  , ylen = 12
  , rows
  , cols
  , xpix
  , ypix
  , intID = []

  console.log("hello")




// This turns on and off button selected class for animations
  $(".category").click(function() {
    //turn of all previously selected
    $('.selected').not(this).removeClass('selected')
    // Toggle this buttons class.
    $(this).toggleClass('selected')
    // If it wasn't previously selected then continue and engage.
    if ( $(this).hasClass('selected') ) {
      //find matching classes associated w/ ID
      $("."+ $(this).attr('id') ).addClass('selected')
    }
  }) // end click

// This turns on and off button selected class for mode info text
  $(".mode").click(function() {
    var mode = null
    //turn of all previously selected
    $('.selectedII').not(this).removeClass('selectedII')
    // Toggle this buttons class.
    $(this).toggleClass('selectedII')
    // If it wasn't previously selected then continue and engage.
    if ( $(this).hasClass('selectedII') ) {
      // get mode ID
      mode = $(this).attr('id')
      //find matching classes associated w/ ID
      $("." + mode).addClass('selectedII')
    }
    // Start up appropriate physics mode
    switch(mode) {
      case "mode1":
        waveEqnMode();
        break;
      case "mode2":
        diffusionEqnMode();
        break;
      case "mode3":
        noMode();
        break;
      default:
        noMode();
    } // end switch
  }) // end mode click



// CONTENT SOCKETS /////////////////////////////////////////////////
  socket.on('readme', function(data) {
    $('.content.tog3').html(data)
  })
  socket.on('cv', function(data) {
    $('.content.tog4').html(data)
  })

// MODE FUNCTIONS ///////////////////////////////////////////////////

  // Function called on window resize which resets both canvas dims
  // as well as calling physics engine resize method.
  // Also acts as a general clearing house.
  function resetScreen() {
    $(window).resize(function(e) {
      rows = Math.floor(window.innerHeight / xlen)
      cols = Math.floor(window.innerWidth / ylen)
      field.setResolution(rows, cols)
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      //field.s = buildSprites(10)
    })
    $(window).trigger('resize')
  }

  // Function to clear previous bindings and interval
  // timers from previously selected modes
  function clearMode() {
    var i
    $(canvas).unbind("mousemove")
    $(canvas).unbind("click")
    for (i = 0; i < intID.length; i++) {
      clearInterval(intID[i])
    }
  }

  function waveEqnMode() {
    clearMode()
    field = engine( {
      dt: 0.1
    , gamma: 0.02
    , eqn: "wave"
    })
    resetScreen() // Call reset which inits field to window size
    var colorgrada = buildColorGrad("#000092", 41, -1).reverse()
      , colorgradb = buildColorGrad("#000092", 41, 1)
    colorgradb.shift()
    field.mag = 15

    // Bind Click //////////////////////////////////////////
    $(canvas).bind("click", function(evt) {
        var xp = evt.pageX
          , yp = evt.pageY
      socket.emit('clientDroplet',{
          x: xp / window.innerWidth // turn into percentage
        , y: yp / window.innerHeight // before sending
        })
      field.addSource( (yp / ylen) | 0 , (xp / xlen) | 0 , field.mag)
    })
    // Set render configurations
    field.scale = 10
    field.maxval = 40 // +/-
    field.adj = 40
    field.cg = colorgrada.concat(colorgradb)
    // Start Animation
    intID[0] = setInterval(renderField, 30)

    } // END WAVEEQNMODE


  function diffusionEqnMode() {
    clearMode()
    field = engine( {
      dt: 0.1
    , eqn: "diffusion"
    , alpha: 0.5
    })
    resetScreen() // Call reset which inits field to window size
    field.mag = 30
    // Click Binding //////////////////////////////////////////
    $(canvas).bind("mousemove", function(evt) {
      xpix = evt.pageX
      ypix = evt.pageY
    })

    intID[0] = setInterval(tracedrops, 50)

    function tracedrops() {
      field.addSource( (ypix / ylen) | 0 , (xpix / xlen) | 0 , field.mag)
      socket.emit('clientDroplet', {
          x: xpix / window.innerWidth
        , y: ypix / window.innerHeight
      })

    }

    // Set render configurations
    field.scale = 10
    field.maxval = 80
    field.adj = 0
    field.cg = buildColorGrad(null)

    // Start Animation
    intID[1] = setInterval(renderField, 50)

  } // END DIFFUSIONEQMODE


  function poissonEqnMode() {
    $(window).trigger('resize')
    xpix = 0.5*Math.round(window.innerWidth)
    ypix= 0.5*Math.round(window.innerHeight)
    // Click Binding //////////////////////////////////////////
    $(canvas).unbind() // get rid of previous bindings
    $(canvas).dblclick(function(evt) {
        var xpix = evt.pageX
          , ypix = evt.pageY
      field.addSource( (ypix / ylen) | 0 , (xpix / xlen) | 0 )
    })

    $(canvas).mousemove(function(e){
      xpix = e.pageY // yes this is confusing but I like my x dir up and down = height
      ypix = e.pageX
    })

    // Set renderField configurations
    field.scale = 26
    field.maxval = 80
    field.adj = 0
    field.cg = colorgrad
    // set renderSprites config
    field.m = 3
    field.k = 1
    field.dt = 0.1

    // Start Animation
    setInterval(renderSprites, 50)

  } // END PoissonEqnMode


  // Default mode when engine not engaged.
  function noMode() {
    clearMode()
    resetScreen()
  }



// If any event newDroplet, it acts no matter the mode!
  socket.on('newDroplet', function(d) {
      var yp = Math.round( d.y * window.innerHeight ) //recover from percentage
        , xp = Math.round( d.x * window.innerWidth ) // to this user resolution
      field.addSource( (yp / ylen) | 0, (xp / xlen) | 0 , field.mag)
    })


  // Draw Canvas /////////////////////////////////////////////////////////////////

  function renderField () {
    var row, col, ind
      , f = field.update()
    for (row = 0; row < rows; ++row) {
      for (col = 0; col < cols; ++col) {
        ind = f[row * cols + col] * field.scale | 0 // floor if > 0, ceil if < 0
        if (Math.abs(ind) > field.maxval) {
          ind = field.maxval * (ind < 0 ? -1 : 1)
        }
        c.fillStyle = field.cg[ind += field.adj] // start ind at index 0
        c.fillRect(col*ylen, row*xlen, ylen, xlen)
      }
    }
  }


  function renderSprites () {
  // Note F = ma & F = qE
  // so we have field qE = ma and effect of other charges F = kq1q2(r1-r2)/r^2
  // q1E + k*q1*q2/r^2 = ma
  // So velocity change due to electric Field and other charges is:
  // (q1E + k*q1*q2(r2-r1)/r^2)/m = dV/dt
  // q1/m * (E + k*q2(r2-r1)/r^2) = dV/dt
  // Where E = -grad(Potential)
  // or E = -(X[i+1][j] - X[i][j])x -(X[i][j+1] - X[i][j])y
  // q1 and q1 have been set as 1
    var i, row, col, Ex, Ey, Fx, Fy, r, vx ,vy
      , f = field.update()

    // FIll OVER PREV SPRITES
    c.fillStyle = "#000092"
    for (i = 0; i < field.s.length; i++) {
      c.beginPath()
      c.arc(field.s[i].y, field.s[i].x, 11,0, Math.PI*2,true)
      c.fill()
      c.closePath()
    }

    c.fillStyle = "#FFFF87"
    for (i = 0; i < field.s.length; i++) {
      // Change position according to velocity
      field.s[i].x = Math.round(field.s[i].x + field.s[i].vx)
      field.s[i].y = Math.round(field.s[i].y + field.s[i].vy)
      if (field.s[i].x <= 1 || field.s[i].x >= canvas.height -xlen || field.s[i].y <= 1 || field.s[i].y >= canvas.width - ylen) {
        field.s.splice(i,1)
        continue
      }
      // Draw New Sprite position
      c.beginPath()
      c.arc(field.s[i].y, field.s[i].x, 10,0, Math.PI*2,true)
      c.fill()
      c.closePath()
      // Update velocity
      row = field.s[i].x/xlen | 0
      col = field.s[i].y/ylen | 0
      // E = -gradPotential
      Ex = -(f[row + 1][col] - f[row][col])
      Ey = -(f[row][col + 1] - f[row][col])
      // Coulumbs law
      r = Math.sqrt( (field.s[i].x - xpix)*(field.s[i].x - xpix) + (field.s[i].y - ypix)*(field.s[i].y - ypix) )
      Fx = (r > 75) ? 0 : field.k*(field.s[i].x - xpix) / r
      Fy = (r > 75) ? 0 : field.k*(field.s[i].y - ypix) / r
      vx = (Ex + Fx) / field.m
      vy = (Ey + Fy) / field.m
      field.s[i].vx +=  vx/field.dt
      field.s[i].vy += vy/field.dt
    }

  }

  function buildSprites (n) {
    var i, s = []
    for (i = 0; i < n; i++) {
      s[i] = {
          x : 0.5*rows*xlen | 0
        , y : 0.5 * cols*ylen | 0
        , vx : Math.random() < 0.5 ? -1 : 1 * Math.random() * 3
        , vy : Math.random() < 0.5 ? -1 : 1 * Math.random() * 3
      }
    }
    return s
  }

}) // end JQuery


// HELPER FUNCS //////////////////////////////////////////////////////////
function colorLuminance(hex, lum) {
  // validate hex string
  hex = String(hex).replace(/[^0-9a-f]/gi, '')
  if (hex.length < 6) {
    hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2]
  }
  lum = lum || 0
  // convert to decimal and change luminosity
  var rgb = "#", c, i
  for (i = 0; i < 3; i++) {
    c = parseInt(hex.substr(i*2,2), 16)
    c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16)
    rgb += ("00"+c).substr(c.length)
  }
  return rgb
}

function buildColorGrad(baseShade, numElem, lum) {
  // Build the gradient variable from a starting darkest shade.
  // Goes up in lum/numElement increments, where lum
  // is percent / 100 (1 = 100% increase)
  var i
  , nc = []
  , inc = lum/numElem
  if (baseShade) {
    for (i = 0; i < numElem; ++i) {
      nc[i] = colorLuminance(baseShade, i*inc)
    }
    return nc
  }
  else {
    return [
        "#000092"
      , "#00009E"
      , "#0000AA"
      , "#0000B6"
      , "#0000C2"
      , "#0000CE"
      , "#0000DB"
      , "#0000E7"
      , "#0000F3"
      , "#0000FF"
      , "#000CFF"
      , "#0018FF"
      , "#0024FF"
      , "#0031FF"
      , "#003DFF"
      , "#0049FF"
      , "#0055FF"
      , "#0061FF"
      , "#006DFF"
      , "#0079FF"
      , "#0086FF"
      , "#0092FF"
      , "#009EFF"
      , "#00AAFF"
      , "#00B6FF"
      , "#00C2FF"
      , "#00CEFF"
      , "#00DBFF"
      , "#00E7FF"
      , "#00F3FF"
      , "#00FFFF"
      , "#0CFFF3"
      , "#18FFE7"
      , "#24FFDB"
      , "#31FFCE"
      , "#3DFFC2"
      , "#49FFB6"
      , "#55FFAA"
      , "#61FF9E"
      , "#6DFF92"
      , "#79FF86"
      , "#86FF79"
      , "#92FF6D"
      , "#9EFF61"
      , "#AAFF55"
      , "#B6FF49"
      , "#C2FF3D"
      , "#CEFF31"
      , "#DBFF24"
      , "#E7FF18"
      , "#F3FF0C"
      , "#FFFF00"
      , "#FFF300"
      , "#FFE700"
      , "#FFDB00"
      , "#FFCE00"
      , "#FFC200"
      , "#FFB600"
      , "#FFAA00"
      , "#FF9E00"
      , "#FF9200"
      , "#FF8600"
      , "#FF7900"
      , "#FF6D00"
      , "#FF6100"
      , "#FF5500"
      , "#FF4900"
      , "#FF3D00"
      , "#FF3100"
      , "#FF2400"
      , "#FF1800"
      , "#FF0C00"
      , "#FF0000"
      , "#F30000"
      , "#E70000"
      , "#DB0000"
      , "#CE0000"
      , "#C20000"
      , "#B60000"
      , "#AA0000"
      , "#9E0000"
    ]
  }
}

});
require("/lib/entry.js");
})();
