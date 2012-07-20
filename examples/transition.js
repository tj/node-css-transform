
/**
 * Module dependencies.
 */

var transform = require('..')
  , fs = require('fs')
  , read = fs.readFileSync;

var vendors = ['-webkit-', '-moz-', '-ms-'];

function transitions(vendors) {
  return function(style){
    style.map(function(prop, val) {
      var self = this;
      if ('transition' != prop) return val;
      vendors.forEach(function(vendor){
        var p = vendor + prop;
        var v = val.replace('transform', vendor + 'transform');
        self.addProperty(p, v);
      });
      this.addProperty(prop, val);
      return;
    });
  }
}

var css = transform(read('examples/transition.css', 'utf8'))
  .use(transitions(vendors))
  .toString();

console.log(css);