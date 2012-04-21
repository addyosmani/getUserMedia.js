/*global require:true */
var getUserMedia_js = require('../lib/getUserMedia.js');

exports['awesome'] = {
  setUp: function(done) {
    // setup here
    done();
  },
  'no args': function(test) {
    test.expect(1);
    // tests here
    test.equal(getUserMedia_js.awesome(), 'awesome', 'should be awesome.');
    test.done();
  }
};
