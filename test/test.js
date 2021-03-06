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
      } else if (req.url == '/post' && 
                 req.method == 'POST' &&
                 req.headers['content-type'] == 'application/json') {
        var data = '';
        req.on('data', function(ch) { data += ch });
        req.on('end', function() { 
          data = JSON.parse(data);
          res.writeHead(200);
          res.end(JSON.stringify(data));
        });
      } else {
        res.writeHead(404);
        res.end();
      }
    });
    server.listen(0, function(err) {
      if (err) return done(err);
      serverRoot = 'http://localhost:' + server.address().port;
      done();
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

  it('should pass back error on error', function(done) {
    imbibe(serverRoot + '/bad', function(err, data) {
      assert(err);
      assert.equal(err.statusCode, 400);
      assert.equal(err.message, 'Bad Request');
      done();
    });
  });

  it('should take multiple requests', function(done) {
    var reqs = [
      serverRoot + '/first',
      serverRoot + '/second'
    ];
    imbibe(reqs, function(err, data) {
      assert(!err);
      assert.equal(data[0].value, 'first');
      assert.equal(data[1].value, 'second');
      done();
    });
  });

  it('should take multiple named requests', function(done) {
    var reqs = {
      first: serverRoot + '/first',
      second: serverRoot + '/second'
    };
    imbibe(reqs, function(err, data) {
      assert(!err);
      assert.equal(data.first.value, 'first');
      assert.equal(data.second.value, 'second');
      done();
    });
  });

  it('should take a prefix to make an api consumer', function(done) {
    var api = imbibe.using(serverRoot);
    api('/first', function(err, data) {
      assert(!err);
      assert.equal(data.value, 'first');
      done();
    });
  });

  it('should take a prefix and still work with an array', function(done) {
    var api = imbibe.using(serverRoot);
    api(['/first', '/second'], function(err, data) {
      assert(!err);
      assert.equal(data[0].value, 'first');
      assert.equal(data[1].value, 'second');
      done();
    });
  });

  it('should take a prefix and still work with an object', function(done) {
    var api = imbibe.using(serverRoot);
    api({first: '/first', second: '/second'}, function(err, data) {
      assert(!err);
      assert.equal(data.first.value, 'first');
      assert.equal(data.second.value, 'second');
      done();
    });
  });

  it('should send a json object', function(done) {
    var api = imbibe.using(serverRoot);
    var megaObject = {
      thing: 1,
      stuff: ['thing', true, 25.3],
      nested: {
        array: ['omg', 5]
      }
    };
    api('/post', {method: 'POST', json: megaObject}, function(err, data) {
      assert(!err, err);
      assert.deepEqual(megaObject, data);
      done();
    });
  });

  describe('promise support', function () {
    it('should fetch and parse a json object', async function() {
      const data =await imbibe(serverRoot + '/first')
      assert(data);
      assert.equal(data.value, 'first');
    });

    it('should pass back error on error', async function() {
      try {
        await imbibe(serverRoot + '/bad');
        assert.fail('should have thrown error');
      } catch (err) {
        assert.equal(err.statusCode, 400);
        assert.equal(err.message, 'Bad Request');
      }
    });

    it('should take multiple requests', async function() {
      const reqs = [
        serverRoot + '/first',
        serverRoot + '/second'
      ];
      const data = await imbibe(reqs)
      assert.equal(data[0].value, 'first');
      assert.equal(data[1].value, 'second');
    });

    it('should take multiple named requests', async function() {
      const reqs = {
        first: serverRoot + '/first',
        second: serverRoot + '/second'
      };
      const data = await imbibe(reqs)
      assert.equal(data.first.value, 'first');
      assert.equal(data.second.value, 'second');
    });

    it('should take a prefix to make an api consumer', async function() {
      const api = imbibe.using(serverRoot);
      const data = await api('/first')
      assert.equal(data.value, 'first');
    });

    it('should take a prefix and still work with an array', async function() {
      const api = imbibe.using(serverRoot);
      const data = await api(['/first', '/second'])
      assert.equal(data[0].value, 'first');
      assert.equal(data[1].value, 'second');
    });

    it('should take a prefix and still work with an object', async function() {
      const api = imbibe.using(serverRoot);
      const data = await api({first: '/first', second: '/second'})
      assert.equal(data.first.value, 'first');
      assert.equal(data.second.value, 'second');
    });

    it('should send a json object', async function() {
      const api = imbibe.using(serverRoot);
      const megaObject = {
        thing: 1,
        stuff: ['thing', true, 25.3],
        nested: {
          array: ['omg', 5]
        }
      };
      const data = await api('/post', {method: 'POST', json: megaObject})
      assert.deepEqual(megaObject, data);
    });
  })
});
