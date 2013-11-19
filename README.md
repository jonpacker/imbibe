# imbibe

consume a JSON HTTP API, without the regular boilerplate.

## example

```javascript
var imbibe = require('imbibe');
imbibe('http://example.com/user/1', function(err, user) {
  if (err) console.log(err);
  else console.log(user);
});
```

## install

```
npm install --save imbibe
```

## documentation

### `imbibe(url(s), [opts, ] callback)`

* `url(s)` a string representing a URL that points to a json resource, or an
  array of URLs, or an object mapping keys to urls that will be used to compile
  the result object.
* `opts` (optional) - options for the requests. **imbibe** uses
  [mikeal/request](https://github.com/mikeal/request) internally, and these 
  options will be passed to the request that is generated. See request's
  [options documentation](https://github.com/mikeal/request#requestoptions-callback)
  for more details on what is available here
* `callback(err, data)` - a function to be called when the request is completed.
  data is either the parsed result of the request, or an array of results, or an
  object mapping the results to the request keys, depending on the value of
  `url`.
