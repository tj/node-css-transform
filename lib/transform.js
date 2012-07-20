
/**
 * Module dependencies.
 */

var css = require('css');

/**
 * Expose `transform`.
 */

module.exports = transform;

/**
 * Tranform the given string of css.
 *
 * @param {String} css
 * @return {Stylesheet}
 * @api public
 */

function transform(css) {
  return new Stylesheet(css);
}

/**
 * Initialize a new `Stylesheet` with the given `css`.
 *
 * @param {String} css
 * @api private
 */

function Stylesheet(css) {
  this.str = css;
  this.prefixes = [];
  this.selectorMapFunctions = [];
  this.propertyMapFunctions = [];
  this.keyframePrefixes = null;
}

/**
 * Use the given plugin `fn`.
 *
 * @param {Function} fn
 * @return {Stylesheet}
 * @api public
 */

Stylesheet.prototype.use = function(fn){
  fn(this);
  return this;
};

/**
 * Apply `prefixes` to occurrences of `prop`.
 *
 * @param {String} prop
 * @param {Array} prefixes
 * @return {Stylesheet}
 * @api public
 */

Stylesheet.prototype.prefix = function(prop, prefixes){
  if (1 == arguments.length) return this.prefixSelectors(prop);
  if ('@keyframes' == prop) return this.prefixKeyframes(prefixes);
  this.prefixes.push({
    prop: prop,
    vendors: prefixes
  });
  return this;
};

/**
 * Apply `prefixes` to occurrences of `@keyframes`.
 *
 * @param {String} prop
 * @param {Array} prefixes
 * @return {Stylesheet}
 * @api private
 */

Stylesheet.prototype.prefixKeyframes = function(prefixes){
  this.keyframePrefixes = prefixes;
  return this;
};

/**
 * Prefix selectors with `prefixes` followed by a space.
 *
 * @param {String} prefix
 * @return {Stylesheet}
 * @api public
 */

Stylesheet.prototype.prefixSelectors = function(prefix){
  this.mapSelectors(function(sel){
    return prefix + ' ' + sel;
  });
  return this;
};

/**
 * Apply the given map `fn` to selectors.
 *
 * @param {Function} fn
 * @return {Stylesheet}
 * @api public
 */

Stylesheet.prototype.mapSelectors = function(fn){
  this.selectorMapFunctions.push(fn);
  return this;
};

/**
 * Apply the given map `fn` to properties.
 *
 * @param {Function} fn
 * @return {Stylesheet}
 * @api public
 */

Stylesheet.prototype.map = function(fn){
  this.propertyMapFunctions.push(fn);
  return this;
};

/**
 * Apply `prefixes` to the given `rule`.
 *
 * Options:
 *
 *  - `only` the given vendor prefix
 *
 * @param {Object} rule
 * @param {Object} options
 * @api private
 */

Stylesheet.prototype.applyPropertyPrefixes = function(rule, options){
  var self = this;
  options = options || {};
  var only = options.only;
  self.prefixes.forEach(function(prefix){
    if (!rule.declarations) return;
    var val = getProperty(rule, prefix.prop).value;
    if (null == val) return;
    prefix.vendors.forEach(function(vendor){
      if (only && vendor != only) return;
      rule.declarations.unshift({
        property: vendor + prefix.prop,
        value: val
      });
    });
  });
};

/**
 * Apply keyframes `prefixes` to the given `style`.
 *
 * @param {Object} style
 * @api private
 */

Stylesheet.prototype.applyKeyframePrefixes = function(style){
  var self = this;
  var prefixes = this.keyframePrefixes;
  if (!prefixes) return style;

  var rules = [];

  style.stylesheet.rules.forEach(function(rule, i){
    if (!rule.keyframes) return;

    prefixes.forEach(function(vendor){
      // keyframes
      var clone = cloneKeyframes(rule);
      clone.vendor = vendor;

      // prefix properties
      clone.keyframes.forEach(function(keyframe){
        self.applyPropertyPrefixes(keyframe, { only: vendor });
      });

      rules.push(clone);
    });

    rules.push(rule);
  });

  return { stylesheet: { rules: rules }};
};

/**
 * Apply selector map functions to `rule`.
 *
 * @param {Object} rule
 * @api private
 */

Stylesheet.prototype.applySelectorMapFunctions = function(rule){
  this.selectorMapFunctions.forEach(function(fn){
    rule.selector = fn(rule.selector);
  });
};

/**
 * Apply property map functions to `rule`.
 *
 * @param {Object} rule
 * @api private
 */

Stylesheet.prototype.applyPropertyMapFunctions = function(rule){
  if (!rule.selector) return;
  var self = this;
  this.propertyMapFunctions.forEach(function(fn){
    rule.declarations.forEach(function(decl, i){
      decl.value = fn.call(self, decl.property, decl.value);
      if (decl.value == null) {
        rule.declarations.splice(i, 1);
      }
    });
  });
};

/**
 * Add property `name` and `val`.
 *
 * @param {String} name
 * @param {String} val
 * @api public
 */

Stylesheet.prototype.addProperty = function(name, val){
  this.currentRule.declarations.push({
    property: name,
    value: val
  });
};

/**
 * Transform and return the css.
 *
 * @return {String}
 * @api public
 */

Stylesheet.prototype.toString = function(){
  var self = this;
  var style = css.parse(this.str);

  style = this.applyKeyframePrefixes(style);
  style.stylesheet.rules = style.stylesheet.rules.map(function(rule){
    self.currentRule = rule;
    self.applyPropertyPrefixes(rule);
    self.applySelectorMapFunctions(rule);
    self.applyPropertyMapFunctions(rule);
    return rule;
  });

  return css.stringify(style);
};


/**
 * Clone keyframes.
 *
 * @param {Object} keyframes
 * @return {Object}
 * @api public
 */

function cloneKeyframes(keyframes) {
  return {
    name: keyframes.name,
    vendor: keyframes.vendor,
    keyframes: keyframes.keyframes.map(cloneKeyframe)
  }
}

/**
 * Clone `keyframe`.
 *
 * @param {Object} keyfarme
 * @return {Object}
 * @api public
 */

function cloneKeyframe(keyframe) {
  return {
    values: keyframe.values.slice(),
    declarations: keyframe.declarations.map(cloneDeclaration)
  }
};

/**
 * Clone declaration.
 *
 * @param {Object} decl
 * @return {Object}
 * @api public
 */

function cloneDeclaration(decl) {
  return {
    property: decl.property,
    value: decl.value
  }
}

/**
 * Get `prop` in `rule`.
 *
 * @param {Object} rule
 * @param {String} prop
 * @return {Object}
 * @api private
 */

function getProperty(rule, prop) {
  for (var i = 0, len = rule.declarations.length; i < len; ++i) {
    if (rule.declarations[i].property == prop) {
      return rule.declarations[i];
    }
  }
}