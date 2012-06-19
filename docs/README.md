# Droplets
A Javascript physics engine and real-time server-client setup project with node.js which evolved into my personal website.

The backend computations handling the wave-field physics are written in javascript while the overlay animations are all CSS3. Socket.io magic connects server to clients and uses a broadcast facility to register droplets clicked by a single user to all clients. The server also parses markdown files in the main directory into html. This is streamed to the client via sockets.

_The website runs best on Chrome._

### Todo
1. Turn javascript function wavefield into a node.js module and publish to NPM
2. Test CSS3 animations with IE
3. xlen and ylen resolution sizes should be dependent on overall screen size. Smaller screen sizes can computationally afford better resolutions.

### Issues
1. Strange Firefox bug: content does not fade in with delay on second access. I suspect the `opacity` property is not being reset to `0` when unselected.

