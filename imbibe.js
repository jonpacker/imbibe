var request = require('request');

module.exports = function(url, opts, callback) {
  if (typeof opts == 'function') {
    callback = opts;
    opts = {};
  }

  opts.json = true;
  opts.url = url;

  return request(opts, function(err, response, body) {
    if (err) callback(err);
    else if (response.statusCode >= 300) 
      callback(new Error(body || response.status || response.statusCode));
    else callback(null, body);
  });
};
