var request = require('request');
var codes = require('http').STATUS_CODES;
var async = require('async');

var imbibe = module.exports = function(url, opts, callback) {
  if (typeof opts == 'function') {
    callback = opts;
    opts = {};
  } else if (opts == null && callback == null) {
    return function imbiber(path, opts, callback) {
      if (Array.isArray(path) || typeof path == 'object') {
        for (var key in path) path[key] = url + path[key];
      } else {
        path = url + path;
      }
      return imbibe(path, opts, callback);
    };
  }

  if (Array.isArray(url))
    return async.map(url, function(url, callback) {
      imbibe(url, opts, callback);
    }, callback);
  else if (typeof url == 'object')
    return async.parallel(Object.keys(url).reduce(function(obj, key) {
      return obj[key] = imbibe.bind(null, url[key], opts), obj;
    }, {}), callback);

  opts.json = opts.json || true;
  opts.url = url;

  return request(opts, function(err, response, body) {
    if (err) callback(err);
    else if (response.statusCode >= 300) {
      var error;
      if (body) {
        error = new Error(body);
      } else {
        error = new Error(codes[response.statusCode]);
      }
      error.statusCode = response.statusCode;
      error.response = response;
      callback(error);
    } else callback(null, body);
  });
};
