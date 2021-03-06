# Droplets
A demonstration website which serves as my personal site for now.

The backend computations handling the wave-field physics are written in javascript and solve the wave equation PDE using the finite-difference Euler Method. The module that solves the physics is called [pde-engine](https://github.com/bpostlethwaite/pde-engine) which I have published to [npm](https://npmjs.org/). The transparent overlay animations are all CSS3. Websockets connect the server to clients and employs a broadcast facility to register droplets clicked by a single user to all clients simultaneously. The server also parses markdown files which hold the site content into html and streams this data to the client upon connection.

_The website runs best on Chrome._

### Todo
1. Test CSS3 animations with IE
2. xlen and ylen resolution sizes should be dependent on overall screen size. Smaller screen sizes can computationally afford better resolutions.
3. Finish coding and implementing the Poisson Equation (gravity and electrostatics)
