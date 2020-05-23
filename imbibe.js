const request = require('request');
const codes = require('http').STATUS_CODES;
const async = require('async');

const imbibe = module.exports = function(url, opts, callback) {
  if (typeof opts == 'function' || !opts) {
    callback = opts;
    opts = {};
  }

  if (Array.isArray(url)) {
    if (callback) {
      return async.map(url, function(url, callback) {
        imbibe(url, opts, callback);
      }, callback);
    } else {
      return Promise.all(url.map(url => imbibe(url, opts)))
    }
  } else if (typeof url == 'object') {
    if (callback) {
      return async.parallel(Object.keys(url).reduce(function(obj, key) {
        return obj[key] = imbibe.bind(null, url[key], opts), obj;
      }, {}), callback);
    } else {
      return Promise.all(Object.keys(url).map(async key => {
        const result = await imbibe(url[key], opts)
        return { key, result }
      })).then(allResults => allResults.reduce((output, { key, result }) => {
        output[key] = result
        return output
      }, {}))
    }
  }

  opts.json = opts.json || true;
  opts.url = url;

  let requestObj
  const requestPromise = new Promise((resolve, reject) => {
    requestObj = request(opts, function(err, response, body) {
      if (err) reject(err);
      else if (response.statusCode >= 300) {
        let error;
        if (body) {
          error = new Error(body);
        } else {
          error = new Error(codes[response.statusCode]);
        }
        error.statusCode = response.statusCode;
        error.response = response;
        reject(error);
      } else resolve(body);
    });
  });

  if (callback) {
    requestPromise
      .then(result => callback(null, result))
      .catch(callback)
    return requestObj
  } else {
    return requestPromise
  }
};

imbibe.using = function (urlRoot) {
  return function imbiber(path, opts, callback) {
    if (Array.isArray(path) || typeof path == 'object') {
      for (const key in path) path[key] = urlRoot + path[key];
    } else {
      path = urlRoot + path;
    }
    return imbibe(path, opts, callback);
  };
}
