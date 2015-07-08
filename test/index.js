var vows = require('vows'),
    EventEmitter = require('events').EventEmitter,
    assert = require('assert'),
    fixtures = require('./fixtures'),
    _ = require('lodash'),
    ToastioConnection = require('..');

vows
    .describe('Connection to Toastio Server')
    .addBatch({
        'Given a complete configuration': {
            topic: new ToastioConnection(fixtures.host, fixtures.username, fixtures.password, fixtures.port),
            'should be a ToastioConnection': function(connection) {
                assert.instanceOf(connection, ToastioConnection);
            },
            'member host should be set': function(connection) {
                assert.equal(connection.host, fixtures.host);
            },
            'member username should be set': function(connection) {
                assert.equal(connection.username, fixtures.username);
            },
            'member password should be set': function(connection) {
                assert.equal(connection.password, fixtures.password);
            },
            'member port should be set': function(connection) {
              if (fixtures.port) {
                assert.equal(connection.port, fixtures.port);
              }
            },
            'and Given a request to login to Toastio': {

                topic: function(connection) {
                    var ee = new EventEmitter();
                    connection.login().then(function(response) {
                        ee.emit('success', response, connection);
                    }, function(error) {
                        ee.emit('error', error);
                    });
                    return ee;
                },

                'request should return status(200)': function(response) {
                    assert.equal(response.statusCode, 200);
                },
                'request should return a valid username': function(response) {
                    assert.equal(fixtures.username, response.data.username);
                },
                'response should contain a session id': function(response) {
                    var cookie = JSON.stringify(response._connection.headers.Cookie);
                    assert.isTrue((/connect\.toastyio\.sid/).test(cookie));
                },

                'and Given a request for Documents': {

                    topic: function(connectResponse, connection) {
                        var ee = new EventEmitter();
                        connection.listDocuments().then(function(response) {
                            ee.emit('success', response);
                        }, function(error) {
                            ee.emit('error', error);
                        });
                        return ee;
                    },

                    'request should return status(200)': function(response) {
                        assert.equal(response.statusCode, 200);
                    },

                    'response should be an array': function(response) {
                        assert.isArray(response.data);
                    },

                    'response should contain nothing or all documents': function(response) {
                        var types = _.uniq(_.pluck(response.data, '__t'));
                        assert.lengthOf(types, 1);
                    }

                },

                'and Given a request for a specified Document': {
                    topic: function(connectResponse, connection) {
                        var ee = new EventEmitter();
                        connection.getDocumentById(fixtures.documentId).then(function(response) {
                            ee.emit('success', response);
                        }, function(error) {
                            ee.emit('error', error);
                        });
                        return ee;
                    },
                    'request should return status(200)': function(response) {
                        assert.equal(response.statusCode, 200);
                    },

                    'response should be an object': function(response) {
                        assert.isObject(response.data);
                    },

                    'response should have a matching id': function(response) {
                        assert.equal(fixtures.documentId, response.data._id);
                    }
                },

                'and Given a request for children of a specified Document': {
                    topic: function(connectResponse, connection) {
                        var ee = new EventEmitter();
                        connection.getDocumentById(fixtures.documentId, {
                            populate: 'children'
                        }).then(function(response) {
                            ee.emit('success', response);
                        }, function(error) {
                            ee.emit('error', error);
                        });
                        return ee;
                    },
                    'request should return status(200)': function(response) {
                        assert.equal(response.statusCode, 200);
                    },

                    'response should be an array': function(response) {
                        assert.isArray(response.data.children);
                    },

                    'response should contain all documents': function(response) {
                        var types = _.uniq(_.pluck(response.data.children, '__t'));
                        if (!_.isEmpty(types)) {
                          assert.lengthOf(types, 1);
                        }
                    },

                    'all results should have the same parent': function(response) {
                        var parents = _.uniq(_.pluck(response.data.children, 'parent'));
                        if (!_.isEmpty(parents)) {
                          assert.lengthOf(parents, 1);
                          assert.equal(_.first(parents), fixtures.documentId);
                        }
                    }
                },

                'and Given a request for a Document by name': {
                    topic: function(connectResponse, connection) {
                        var ee = new EventEmitter();
                        connection.getDocumentByName(fixtures.documentName).then(function(response) {
                            ee.emit('success', response);
                        }, function(error) {
                            ee.emit('error', error);
                        });
                        return ee;
                    },
                    'request should return status(200)': function(response) {
                        assert.equal(response.statusCode, 200);
                    },

                    'response should be an object': function(response) {
                        assert.isObject(response.data);
                    },

                    'response should have a matching name': function(response) {
                        assert.equal(fixtures.documentName, response.data.name);
                    },

                    'and Given a request to create a subdocument': {
                        topic: function(byNameResponse, connectResponse, connection) {
                            var ee = new EventEmitter();

                            var newDocument = _.clone(fixtures.newDocument);

                            newDocument.parent = byNameResponse.data._id;
                            newDocument.type = byNameResponse.data.type;

                            connection.createDocument(newDocument).then(function(response) {
                                ee.emit('success', response);
                            }, function(error) {
                                ee.emit('error', error);
                            });
                            return ee;
                        },
                        'request should return status(201)': function(response) {
                            assert.equal(response.statusCode, 201);
                        },

                        'response should be an object': function(response) {
                            assert.isObject(response.data);
                        },

                        'response should have a matching name': function(response) {
                            assert.equal(fixtures.newDocument.name, response.data.name);
                        },

                        'and Given a request to delete a document': {
                            topic: function(createDocumentResponse, byNameResponse, connectResponse, connection) {
                                var ee = new EventEmitter();
                                connection.deleteDocument(createDocumentResponse.data._id).then(function(response) {
                                    ee.emit('success', response);
                                }, function(error) {
                                    ee.emit('error', error);
                                });
                                return ee;
                            },
                            'request should return status(200)': function(response) {
                                assert.equal(response.statusCode, 200);
                            }
                        },
                    },
                },


            }
        }
    }).exportTo(module);
