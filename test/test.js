var http = require('http');
var imbibe = require('../');
var assert = require('assert');

describe('imbibe', function() {
  var serverRoot;
  var server;
  before(function(done) {
    server = http.createServer(function(req, res) {
      if (req.url == '/first') {
        res.writeHead(200);
        res.end(JSON.stringify({ value: 'first' }));  
      } else if (req.url == '/second') {
        res.writeHead(200);
        res.end(JSON.stringify({ value: 'second' }));
      } else if (req.url == '/bad') {
        res.writeHead(400);
        res.end();
      } else if (req.url == '/broken') {
        res.writeHead(200);
        res.end("{ value: 'broken }");
      } else {
        res.writeHead(404);
        res.end();
      }
    });
    server.listen(0, function(err) {
      if (err) return done(err);
      serverRoot = 'http://localhost:' + server.address().port;
    });
  });
  after(function(done) {
    server.close(done);
  });

  it('should fetch and parse a json object', function(done) {
    imbibe(serverRoot + '/first', function(err, data) {
      assert(!err, err);
      assert(data);
      assert.equal(data.value, 'first');
      done();
    });
  });
});
