# Droplets
A Javascript physics engine and real-time server-client setup project with node.js which evolved into my personal website. The backend computations handling the wave-field physics are written in javascript while the overlay animations are all CSS3. Socket.io magic connects server to clients and uses a broadcast facility to register droplets clicked by a single user to all clients. The website runs better on Chrome.

## Issues
1. xlen and ylen resolution sizes should be dependent on overall screen size. Smaller screen sizes can computationally afford better resolutions.
2. Test CSS3 animations with IE
