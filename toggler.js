/*
 * Ben Postlethwaite
 * July 2013
 * MIT
 */

module.exports = function (tag) {

  var unselector = curry(toggleClass, tag, false)
  var selector = curry(toggleClass, tag, true)

  var group = []
  var lnode = {}

  function toggleNode(node, classLink, cb) {

    var links = nodeArray(document.querySelectorAll('.'+classLink))
    group.push({node:node, links:links})

    node.addEventListener('click', function () {
      var toggled = toggleClass(tag, null, node)

      if (toggled) {

        /*
         * Unselect other nodes and their linked nodes
         */
        group.forEach( function (lnode) {
          unselector(lnode.node)
          lnode.links.map(unselector)
        })
        /*
         * Reselect node and it's links
         */
        toggleClass(tag, true, node)
        if (links)
          links.map(selector)

      }  else {
        /*
         * Unselect all linked nodes
         */
        if (links[node])
          links.map(unselector)
      }

      /*
       * If user supplied a callback, call it with toggled state
       */
      cb(toggled)
    })
  }

  group.toggleNode = toggleNode
  return group
}


function nodeArray (nodelist) {
  var nodeArray = []
      for (var i = 0; i < nodelist.length; ++i)
               nodeArray[i] = nodelist[i]
  return nodeArray
}


function toggleClass (className, bool, elem) {
  /*
   * Toggles class on or off depending on its state
   * If "bool" is true: Only toggles to "on" state
   * If "bool" is false: Only toggles class off.
   * Set "bool" to null to get usual behaviour
   */
  var index = elem.className.indexOf(className)
  if ( (index >= 0) && (bool !== true) ) {
    elem.className = cut(elem.className, index, index + className.length)
    if (elem.className.slice(-1) === ' ')
      elem.className = elem.className.slice(0, -1)
    index = false
  }
  else if ( (index < 0) && (bool !== false) ) {
    elem.className = elem.className ? (elem.className + " " + className) : className
    index = true
  }

  return index
}

function cut(str, cutStart, cutEnd){
  return str.substr(0,cutStart) + str.substr(cutEnd+1)
}

var curry = function (fn) {
  var slice = [].slice,
      args = slice.call(arguments, 1)
  return function () {
    return fn.apply(this, args.concat(slice.call(arguments)))
  }
}
