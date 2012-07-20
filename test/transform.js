
var transform = require('..')
  , fs = require('fs')
  , read = fs.readFileSync;

function fixture(name) {
  return read('test/fixtures/' + name + '.css', 'utf8');
}

describe('transform(css)', function(){
  describe('.prefix(prop, prefixes)', function(){
    it('should prefix properties', function(){
      transform(fixture('prefix'))
        .prefix('transition', ['-webkit-', '-moz-'])
        .prefix('border-radius', ['-webkit-', '-moz-'])
        .toString()
        .should.equal(fixture('prefix.out'));
    })

    describe('when "@keyframes" is given', function(){
      it('should prefix @keyframes', function(){
        var str = transform(fixture('keyframes'))
          .prefix('@keyframes', ['-webkit-', '-moz-'])
          .toString()
          .should.equal(fixture('keyframes.out'));
      })

      it('should prefix only using the parent vendor prefix', function(){
        transform(fixture('keyframes.props'))
          .prefix('border-radius', ['-webkit-', '-moz-'])
          .prefix('@keyframes', ['-webkit-', '-moz-'])
          .toString()
          .should.equal(fixture('keyframes.props.out'));
      })
    })

    describe('when only one arg is given', function(){
      it('should prefix selectors', function(){
        transform(fixture('prefix.selectors'))
          .prefix('#dialog')
          .toString()
          .should.equal(fixture('prefix.selectors.out'));
      })
    })
  })

  describe('.map(fn)', function(){
    it('should map property values', function(){
      transform(fixture('map'))
        .map(function(prop, val){
          if (0 == val.indexOf('linear-gradient')) return '-webkit-' + val;
          return val;
        })
        .toString()
        .should.equal(fixture('map.out'));
    })
  })
})