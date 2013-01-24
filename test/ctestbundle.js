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

exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
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
        return function (f) { return window.setImmediate(f) };
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

require.define("/node_modules/colormap/package.json",function(require,module,exports,__dirname,__filename,process,global){module.exports = {"main":"index.js"}
});

require.define("/node_modules/colormap/index.js",function(require,module,exports,__dirname,__filename,process,global){"use strict";
var cg = require('colorgrad')()
var at = require('arraytools')()

module.exports = function (spec) {

  /*
   * Default Options
   */
  if( !at.isObj(spec) )
    spec = {}
  spec.colormap = spec.colormap || "jet"
  spec.nshades = spec.nshades || 72
  spec.format = spec.format || "hex"
     

  /*
   * Supported colormaps
   */
  var cmap = {
    "jet": jet
  } 


  /*
   * apply map and convert result if needed
   */
  var carray = cmap[spec.colormap](spec.nshades)
  var result = []
  if (spec.format === "hex") {
    carray.forEach( function (ar) {
      result.push( cg.rgb2hex(ar) )
    })
  } else result = carray

  

  /*
   * colormap functions
   *
   */
  function jet(n) {
    var divs = [0, 0.125, 0.375, 0.625, 0.875, 1].map(function(x) { return x * n })
      var divs = divs.map( Math.round )

    var r = at.graph( divs, [0.5, 1, 1, 0, 0, 0].map(function(x) { return x * 255})).map(Math.round)
    var g = at.graph( divs, [0, 0, 1, 1, 0, 0].map(function(x) { return x * 255})).map(Math.round)
    var b = at.graph( divs, [0, 0, 0, 1, 1, 0.5].map(function(x) { return x * 255})).map(Math.round)

    return at.zip3(r, g, b)
  }


  return result

}

});

require.define("/node_modules/colorgrad/package.json",function(require,module,exports,__dirname,__filename,process,global){module.exports = {"main":"colorgrad.js"}
});

require.define("/node_modules/colorgrad/colorgrad.js",function(require,module,exports,__dirname,__filename,process,global){/*  colorgrad
 *
 * A simple way to build a hexadecimal or rgb color gradient
 *
 * Ben Postlethwaite 2012
 * benpostlethwaite.ca
 */

module.exports = function () {

  var that = {}

  /*
   * COLORGRAD
   * -------------------------------------------------
   * function for creating gradients of colors based
   * on starting and or terminating hex or rgb values.
   *
   */
  function colorgrad() {
    var args = Array.prototype.slice.call(arguments)
      , arraymath = require('./arraymath')
      , spec
      , cstep
      , c1 = args[0]
      , c2 = null
      , rgb1
      , rgb2
      , outType = isArray(c1) ? 'rgb': 'hex'
      , add = arraymath("+")
      , sub = arraymath("-")
      , div = arraymath("/")
      , mul = arraymath("*")

    /*
     *
     * Unpack specification object
     *
     */
    if(isObj(args[1])) {
      spec = args[1]
    }
    else if (isObj(args[2])) {
      spec = args[2]
      c2 = args[1]
    }
    else
      spec = {}
    /*
     * Or with defaults
     */
    var lum = spec.lum || 1
      , n = spec.nshades || 100
      , type = spec.type || "linear"

    /*
     *
     * Design the color step array which will be
     * a length 3 vector.
     *
     */
    rgb1 = isArray(c1) ? c1 : hex2rgb(c1)
    if(c2) // If two hexcolors supplied
      rgb2 = isArray(c2) ? c2 : hex2rgb(c2)
    else // 2nd color is lum% incr/decr of color1
      rgb2 = add( mul(rgb1,[lum]), rgb1)

    // Create step size to step through color gradient
    cstep = div( sub(rgb2, rgb1), [n-1])

    var i
      , nc = []
    nc[0] = rgb1
    for (i = 1; i < n; ++i) {
      nc[i] = add(nc[i-1], cstep)
    }

    function clims(c) {
      if(c > 255)
        return 255
      else if(c < 0)
        return 0
      else return c
    }

    var result = []
    nc.forEach(function (ar) {
      ar = ar.map(Math.round).map(clims)
      if(outType === 'hex')
        ar = rgb2hex(ar)
      result.push( ar )
    })
    return result
  }


  /*
   *  HELPER FUNCS
   * --------------------------------------------------------
   */
  /*
   * HEXTORGB
   * public
   * Takes a hex string and outputs an rgb vector as a
   * length 3 int array [red, green, blue]
   * where 0 <= rgb values <= 255
   */
  function hex2rgb(hex) {
    //validate hex string
    hex = String(hex).replace(/[^0-9a-f]/gi, '')
    // If 3 digit hex color
    if (hex.length < 6) {
      hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2]
    }
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16)
    , parseInt(result[2], 16)
    , parseInt(result[3], 16)
    ] : null;
  }

  /*
   * RGBTOHEX
   * public
   * Takes a length 3 integer array of rgb values where
   * 0 <= rgbvalue <= 255 and outputs a hexstring
   */
  function rgb2hex(rgbarray) {
    var hex = '#'
    rgbarray.forEach( function (dig) {
      dig = dig.toString(16)
      hex += ("00" + dig).substr( dig.length )
    })
    return hex
  }

  /*
   * ISARRAY
   * private
   */
  function isArray(v) {
    return Object.prototype.toString.call(v) === "[object Array]";
  }

  /*
   * ISOBJ
   * private
   */
  function isObj(v) {
    return (v != null) && (typeof v === 'object') && !isArray(v)
  }


  that.colorgrad = colorgrad
  that.hex2rgb = hex2rgb
  that.rgb2hex = rgb2hex

  return that

}

});

require.define("/node_modules/colorgrad/arraymath.js",function(require,module,exports,__dirname,__filename,process,global){/*  arraymath
 *
 * simple array mathematic functions
 *
 * Ben Postlethwaite 2012
 * benpostlethwaite.ca
 */

module.exports = function (o) {

  var opfunc = op(o)

  /*
   * ARRAYMATH
   */
  return function(a, b) {
    if(!isArray(a) || !isArray(b))
      throw new Error("arraymath inputs must be arrays.")
    var i, out = []
    if(a.length === 1) {
      for(i = 0; i < b.length; i++)
        out[i] = opfunc(a, b[i])
      return out
    }
    else if(b.length === 1) {
      for(i = 0; i < a.length; i++)
        out[i] = opfunc(a[i], b)
      return out
    }
    else if (a.length === b.length) {
      for(i = 0; i < a.length; i++)
        out[i] = opfunc(a[i], b[i])
      return out
    }
    else
      throw new Error("Array lengths must be equal")
  }

  /*
   * OP
   */
  function op(o) {
    return function (a, b) {
      var op = {
        "*": a * b
      , "+": a + b
      ,"-": a - b
      ,"/": a / b
      }
      return op[o]
    }
  }

  /*
   * ISARRAY
   */
  function isArray(v) {
    return Object.prototype.toString.call(v) === "[object Array]";
  }


}





});

require.define("/node_modules/colormap/node_modules/arraytools/package.json",function(require,module,exports,__dirname,__filename,process,global){module.exports = {"main":"index.js"}
});

require.define("/node_modules/colormap/node_modules/arraytools/index.js",function(require,module,exports,__dirname,__filename,process,global){"use strict";
module.exports = function () {

  var that = {}

  function isArray (v) {
    return Object.prototype.toString.call(v) === "[object Array]"
  }
   
  function isObj (v) {
    return (v != null) && (typeof v === 'object') && !isArray(v)
  }

  function linspace (start, end, num) {
    var inc = (end - start) / num
    var a = []
    for( var ii = 0; ii <= num; ii++)
      a.push(start + ii*inc)
    return a
  }

   function graph (x , y) {
    var a = []
    for (var i = 0; i < x.length - 1; i++)
      a = a.concat( linspace(y[i], y[i+1], x[i+1] - x[i] ) )
    return a
  }

  function zip3 (a, b, c) {
      var len = Math.min.apply(null, [a.length, b.length, c.length]) 
      var result = []
      for (var n = 0; n < len; n++) {
          result.push([a[n], b[n], c[n]])
      }
      return result
  }

that.isArray = isArray
that.isObj = isObj
that.linspace = linspace
that.graph = graph
that.zip3 = zip3

return that

}
});

require.define("/test/colortest.js",function(require,module,exports,__dirname,__filename,process,global){var cmap = require("colormap")

console.log(typeof cmap)

var canvas = document.getElementById('canvas')
, c = canvas.getContext('2d')

  var colorgradI = [
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

var colorgradII = cmap({'colormap': 'jet', 'nshades': colorgradI.length })


var i
for (i = 0; i < colorgradI.length; ++i) {
c.fillStyle = colorgradI[i] // start ind at index 0
c.fillRect(i*10, 1, 10, 200)
c.fillStyle = colorgradII[i] // start ind at index 0
c.fillRect(i*10, 201, 10, 200)
}
});
require("/test/colortest.js");
})();
