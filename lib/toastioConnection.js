var http = require('http');
var Q = require('q');
var querystring = require('querystring');
var _ = require('lodash');

function ToastioConnection(host, username, password, port) {

    var _self = this;

    _self.host = host;
    _self.username = username;
    _self.password = password;
    _self.port = port || 80;
    _self.headers = {};

}



ToastioConnection.request = function(options, formdata) {


    var deferred = Q.defer();

    if (formdata) {
	    formdata = JSON.stringify(formdata);
	    options.headers['Content-Length'] = Buffer.byteLength(formdata);
    }

    var req = http.request(options, function(res) {

        var data = '';

        res.setEncoding('utf8');

        res.on('data', function(chunk) {
            data += chunk;
        });

        res.on('end', function() {

        	data = JSON.parse(data);


            deferred.resolve({
            	statusCode: res.statusCode,
            	data: data,
            	res: res
            });

        });
    });

    req.on('error', function(e) {
    	deferred.resolve(e);
    });

    // write data to request body
    req.write(formdata || '');

    req.end();

    return deferred.promise;
};


ToastioConnection.prototype.setCookie = function(cookie) {

    var _self = this;

    if (cookie) {
        _.set(_self.headers, 'Cookie', cookie);
    }

};


ToastioConnection.prototype.login = function() {

    var _self = this;

    var formdata = {
        username: _self.username,
        password: _self.password
    };


    var options = {
        hostname: _self.host,
        port: _self.port,
        path: '/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    };

    var loginRequestPromise = ToastioConnection.request(options, formdata);

    // Set the cookie
    loginRequestPromise.then(function(response) {
    	response._connection = _self;
        _self.setCookie(response.res.headers['set-cookie']);
    });

    return loginRequestPromise;

};

/**
 * List Documents
 * @1 - document id or callback
 * @2 - [callback]
 */

ToastioConnection.prototype.listDocuments = function(documentId, query) {

    var _self = this;

    var options = {
        hostname: _self.host,
        port: _self.port,
        path: '/api/documents',
        method: 'GET',
        headers: _self.headers
    };

    options.headers['Content-Type'] = 'application/json';

   	if (_.isObject(documentId)) {
   		query = querystring.stringify(documentId);
   		documentId = null;
   	} else if (_.isObject(query)) {
   		query = querystring.stringify(query);
   	}

   	if (_.isString(documentId)) {   		
        options.path += '/' + documentId;
    }

   	if (_.isString(query)) {   		
	    options.path += '?' + query;
	}

    var listDocumentRequestPromise = ToastioConnection.request(options);

    listDocumentRequestPromise.then(function(response) {
    	_self.setCookie(response.res.headers['set-cookie']);
    });

    return listDocumentRequestPromise;

};

module.exports = ToastioConnection;
