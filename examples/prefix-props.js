
/**
 * Module dependencies.
 */

var transform = require('..')
  , fs = require('fs')
  , read = fs.readFileSync;

var vendors = ['-webkit-', '-moz-', '-ms-'];

var css = transform(read('examples/prefix-props.css', 'utf8'))
  .prefix('border-radius', vendors)
  .toString();

console.log(css);