jQuery(document).ready(function($) {

  // Set vars, dims and elements
  var el = document.getElementById('wave')
  var socket = io.connect('http://192.168.1.113:8081')
  var field = wavefield()
  var map = mapdisplay(field)

  $(window)
    .resize(function(e) {
      var charDims = function() {
        var div = document.createElement("div")
        div.style.position = "absolute"
        div.style.visibility = "hidden"
        div.style.fontFamily = "Courier New"
        div.style.fontSize = "11px"
        div.innerHTML = "M"
        document.body.appendChild(div)
        var dims = {
	  width: div.offsetWidth,
	  height: div.offsetHeight
	}
        document.body.removeChild(div)
        return dims
      }()
      // this won't be perfect, as the screen dims won't often be evenly disible
      field.setResolution(Math.round($(window).height() / charDims.height)
                           , Math.round($(window).width() / charDims.width))
    })
    .trigger('resize')


  // Bindings
  $('html').click( function (evt) {
    var droplet = {}
    droplet.x = evt.pageX
    droplet.y = evt.pageY
    socket.emit('clientDroplet', droplet)
    console.log( droplet.x.toString().concat(" ", droplet.y.toString() ) )
  })

  socket.on('newDroplet', function (droplet) {
    console.log(droplet.x.toString().concat(" ", droplet.y.toString() ) )
  })

  // Configure Display
  map.display(el, 10)



}) // end JQuery


// If using an overlay, or area you don't want to
// receive mouseclicks from use:
// $('#sacredcontainer').click(function(event){
//      event.stopPropagation()
//  })