# Droplets
A Javascript physics engine and real-time server-client setup project with node.js which evolved into my personal website.

The backend computations handling the wave-field physics are written in javascript and solve the wave equation PDE using the finite-difference Euler Method. The transparent overlay animations are all CSS3. Websockets connect the server to clients and employs a broadcast facility to register droplets clicked by a single user to all clients simultaneously. The server also parses markdown files which hold the site content into html and streams this data to the client upon connection.

_The website runs best on Chrome._

### Todo
1. Turn javascript function wavefield into a node.js module and publish to NPM
2. Test CSS3 animations with IE
3. xlen and ylen resolution sizes should be dependent on overall screen size. Smaller screen sizes can computationally afford better resolutions.

### Issues
1. Strange Firefox bug: content does not fade in with delay on second access. I suspect the `opacity` property is not being reset to `0` when unselected.

