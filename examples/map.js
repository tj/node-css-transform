
/**
 * Module dependencies.
 */

var transform = require('..')
  , fs = require('fs')
  , read = fs.readFileSync;

var css = transform(read('examples/map.css', 'utf8'))
  .map(function(prop, val){
    if (0 == val.indexOf('linear-gradient')) {
      return '-webkit-' + val;
    }
    return val;
  })
  .toString();

console.log(css);