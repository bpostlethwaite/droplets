[![Nodejitsu Deploy Status](http://webhooks.nodejitsu.com/bpostlethwaite/droplets.png)](https://webops.nodejitsu.com#droplets/webhooks)

# [Droplets](http://benpostlethwaite.ca/)

A Javascript physics engine and real-time server-client setup project with node.js which evolved into my [personal website](http://benpostlethwaite.ca/).

The backend computations handling the wave-field physics are written in javascript and solve the wave equation PDE using the finite-difference Euler Method. The module that solves the physics is called [pde-engine](https://github.com/bpostlethwaite/pde-engine) and I have published this to [npm](https://npmjs.org/). The transparent overlay animations are all CSS3. Websockets connect the server to clients and employs a broadcast facility to register droplets clicked by a single user to all clients simultaneously. The server also parses markdown files which hold the site content into html and streams this data to the client upon connection.

_The website runs best on Chrome._

### Todo
1. Test CSS3 animations with IE
2. xlen and ylen resolution sizes should be dependent on overall screen size. Smaller screen sizes can computationally afford better resolutions.
3. Finish coding and implementing the Poisson Equation (gravity and electrostatics)
