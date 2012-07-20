
/**
 * Module dependencies.
 */

var transform = require('..')
  , fs = require('fs')
  , read = fs.readFileSync;

var vendors = ['-webkit-', '-moz-', '-ms-'];

var css = transform(read('examples/sink.css', 'utf8'))
  .prefix('border-radius', vendors)
  .prefix('@keyframes', vendors)
  .prefix('#dialog')
  .toString();

console.log(css);