Meteor.startup(function () {
  // code to run on server at startup
});

Meteor.methods({
  getHTML: function (url, mobile, method, options) {
    url = 'http://chip.vn/fbproxy?url=' + encodeURIComponent(url);

    var headers = {
      'Accept-Language': 'en-US,en;q=0.8',
      'Accept-Encoding': 'text/html',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.1599.101 Safari/537.36',
    };

    if (mobile) {
      //headers['User-Agent'] = 'Mozilla/5.0 (BlackBerry; U; BlackBerry 9900; en) AppleWebKit/534.11+ (KHTML, like Gecko) Version/7.1.0.346 Mobile Safari/534.11+';
      headers = {};
    }

    method = method || 'get';

    options = options || {};
    options.headers = headers;

    console.log('[getHTML]', method, options);
    return HTTP[method](url, options);
  },
  'base64Encode':function(unencoded) {
    return new Buffer(unencoded || '').toString('base64');
  },
  'base64Decode':function(encoded) {
    return new Buffer(encoded || '', 'base64').toString('utf8');
  },
  'base64UrlEncode':function(unencoded) {
    var encoded = Meteor.call('base64Encode',unencoded);
    return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  },
  'base64UrlDecode':function(encoded) {
    encoded = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (encoded.length % 4)
      encoded += '=';
    return Meteor.call('base64Decode',encoded);
  }
});