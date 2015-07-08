var _ = require('lodash');

module.exports = function(ToastioConnection) {

    var request = ToastioConnection.request,
        makeRequest = ToastioConnection.makeRequest,
        _post = ToastioConnection._post,
        _put = ToastioConnection._put,
        _get = ToastioConnection._get,
        _del = ToastioConnection._del;

    /**
     * List Documents
     */

    ToastioConnection.prototype.listDocuments = function(query) {

        var _self = this;

        var listDocumentRequestPromise = _get.call(this, '/api/documents', query);

        listDocumentRequestPromise.then(function(response) {
            _self.setCookie(response.res.headers['set-cookie']);
        });

        return listDocumentRequestPromise;

    };

    ToastioConnection.prototype.getDocumentById = function(documentId, query) {

        var _self = this;

        var getDocumentRequestPromise = _get.call(this, '/api/documents/' + documentId, query);

        getDocumentRequestPromise.then(function(response) {
            _self.setCookie(response.res.headers['set-cookie']);
        });

        return getDocumentRequestPromise;
    };

    ToastioConnection.prototype.getDocumentByName = function(name, query) {

        var _self = this;
        var getDocumentRequestPromise = _get.call(this, '/api/documents', {
            name: name,
            limit: 1
        });

        getDocumentRequestPromise.then(function(response) {
            _self.setCookie(response.res.headers['set-cookie']);
        });

        getDocumentRequestPromise.then(function(response) {
            response.data = _.first(response.data);
        });

        return getDocumentRequestPromise;

    };

    ToastioConnection.prototype.getDocument = function(query) {

        var _self = this;

        var getDocumentRequestPromise = _get.call(this, '/api/documents', query);

        getDocumentRequestPromise.then(function(response) {
            _self.setCookie(response.res.headers['set-cookie']);
        });

        return getDocumentRequestPromise;

    };

    /*
     *  document = {
     *      name: String,
     *      type: ObjectId
     *      properties: {
     *          name: String,
     *          format: String,
     *          value: String
     *      }
     *  };
     */

    ToastioConnection.prototype.createDocument = function(formdata) {

        var _self = this;
        var createDocumentRequestPromise = _post.call(this, '/api/documents', formdata);

        createDocumentRequestPromise.then(function(response) {
            _self.setCookie(response.res.headers['set-cookie']);
        });

        return createDocumentRequestPromise;

    };

    ToastioConnection.prototype.deleteDocument = function(documentId) {

        var _self = this;
        var deleteDocumentRequestPromise = _del.call(this, '/api/documents/' + documentId);

        deleteDocumentRequestPromise.then(function(response) {
            _self.setCookie(response.res.headers['set-cookie']);
        });

        return deleteDocumentRequestPromise;

    };
};