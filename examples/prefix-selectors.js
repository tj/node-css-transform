
/**
 * Module dependencies.
 */

var transform = require('..')
  , fs = require('fs')
  , read = fs.readFileSync;

var vendors = ['-webkit-', '-moz-', '-ms-'];

var css = transform(read('examples/prefix-selectors.css', 'utf8'))
  .prefix('#dialog')
  .toString();

console.log(css);