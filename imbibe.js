var request = require('request');
var codes = require('http').STATUS_CODES;

module.exports = function(url, opts, callback) {
  if (typeof opts == 'function') {
    callback = opts;
    opts = {};
  }

  opts.json = true;
  opts.url = url;

  return request(opts, function(err, response, body) {
    if (err) callback(err);
    else if (response.statusCode >= 300) {
      if (body) return callback(new Error(body));
      var error = new Error(codes[response.statusCode]);
      error.statusCode = response.statusCode;
      error.response = response;
      callback(error);
    } else callback(null, body);
  });
};
