
/**
 * Module dependencies.
 */

var transform = require('..')
  , fs = require('fs')
  , read = fs.readFileSync;

var vendors = ['-webkit-', '-moz-', '-ms-'];

var css = transform(read('examples/keyframes.css', 'utf8'))
  .prefix('border-radius', vendors)
  .prefix('@keyframes', vendors)
  .toString();

console.log(css);