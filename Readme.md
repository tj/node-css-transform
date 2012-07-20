
# css-transform

  CSS manipulations built on [node-css](github.com/visionmedia/node-css).

## Example

style.css:

```css
@keyframes round {
  from { border-radius: 5px }
  to { border-radius: 10px }
}

.title {
  font-size: 18px;
  padding: 5px;
}

.close {
  position: absolute;
  top: 5px;
  right: 5px;
}
```

example.js:

```js
var transform = require('css-transform')
  , fs = require('fs')
  , read = fs.readFileSync;

var vendors = ['-webkit-', '-moz-'];

var css = transform(read('examples/sink.css', 'utf8'))
  .prefix('border-radius', vendors)
  .prefix('@keyframes', vendors)
  .prefix('#dialog')
  .toString();

console.log(css);
```

stdout:

```css
@keyframes round { 
  from { border-radius: 5px; } 
  to { border-radius: 10px; } 
}
@-moz-keyframes round { 
  from { border-radius: 5px; -moz-border-radius: 5px; } 
  to { border-radius: 10px; -moz-border-radius: 10px; } 
}
@-webkit-keyframes round { 
  from { border-radius: 5px; -webkit-border-radius: 5px; } 
  to { border-radius: 10px; -webkit-border-radius: 10px; } 
}
#dialog .title {font-size: 18px; padding: 5px;}
#dialog .close {position: absolute; top: 5px; right: 5px;}
```

## API

### .use(fn)

  Use the given plugin `fn`.

  A "plugin" is simply a function when is passed the `Stylesheet` instance,
  and make invoke one or more of the other API methods. The following example
  uses a closure to pass the `vendors` option, returning the plugin `fn` which
  maps transition vendor prefixes.

```js
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
```

### .prefix(string)

  Prefix selectors with `string`.

```js
.prefix('#dialog')
```

### .prefix(property, prefixes)

  Apply vendor `prefixes` array to occurrences of `property`.

```js
.prefix('border-radius', ['-webkit-', '-moz-'])
```

### .prefixes("@keyframes", prefixes)

  Apply vendor `prefixes` array to __@keyframes__.

```js
.prefix('@keyframes', ['-webkit-', '-moz-'])
```

### .mapSelectors(callback)

  Map selector strings using the given `callback`.

```js
.mapSelectors(function(sel){
  return '#dialog ' + sel;
})
```

### .map(callback)

  Map property values with `callback`.

```js
.map(function(prop, val){
  if (0 == val.indexOf('linear-gradient')) return '-webkit-' + val;
  return val;
})
```

## License 

(The MIT License)

Copyright (c) 2012 Learnboost &lt;tj@vision-media.ca&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.