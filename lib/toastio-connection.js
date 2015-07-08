var http = require('http');
var Q = require('q');
var querystring = require('querystring');
var _ = require('lodash');

var addDocumentRequests = require('./document-requests.js');

function ToastioConnection(host, username, password, port) {

    var _self = this;

    _self.host = host;
    _self.username = username;
    _self.password = password;
    _self.port = port || 80;
    _self.headers = {};

}

function request(options, formdata) {

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
}

function makeRequest(requestPath, method, formdata, query, contentType) {
    var _self = this;

    var options = {
        hostname: _self.host,
        port: _self.port,
        path: requestPath,
        method: method || 'GET',
        headers: _self.headers
    };

    options.headers['Content-Type'] = contentType || 'application/json';

    if (_.isObject(query)) {
        query = querystring.stringify(query);
        options.path += '?' + query;
    }

    var requestPromise = ToastioConnection.request(options, formdata);

    return requestPromise;
}

function _post(requestPath, formdata, query, contentType) {
    return makeRequest.call(this, requestPath, 'POST', formdata || {}, query || {}, contentType);
}

function _put(requestPath, formdata, query, contentType) {
    return makeRequest.call(this, requestPath, 'PUT', formdata, query, contentType);
}

function _get(requestPath, query, contentType) {
    return makeRequest.call(this, requestPath, 'GET', {}, query, contentType);
}

function _del(requestPath, query, contentType) {
    return makeRequest.call(this, requestPath, 'DELETE', {}, query, contentType);
}

ToastioConnection.request = request;
ToastioConnection.makeRequest = makeRequest;
ToastioConnection._post = _post;
ToastioConnection._put = _put;
ToastioConnection._get = _get;
ToastioConnection._del = _del;

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

    var loginRequestPromise = _post.call(_self, '/login', formdata);

    // Set the cookie
    loginRequestPromise.then(function(response) {
    	response._connection = _self;
        _self.setCookie(response.res.headers['set-cookie']);
    });

    return loginRequestPromise;

};

ToastioConnection.prototype.logout = function() {

    var _self = this;

    var logoutRequestPromise = _post.call(_self, '/logout');

    // Set the cookie
    logoutRequestPromise.then(function(response) {
        _self.setCookie(response.res.headers['set-cookie']);
    });

    return logoutRequestPromise;

};

addDocumentRequests(ToastioConnection);

module.exports = ToastioConnection;
