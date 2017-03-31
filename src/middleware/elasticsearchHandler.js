'use strict';

var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var randomInt = require('random-int');
var debug = require('debug')('formio:middleware:elasticsearchHandler');

/**
 * The elasticsearchHandler middleware.
 *
 * This middleware is used for adding middleware handler to send data to external data storage e.g. elastic search.
 *
 * @param router
 * @returns {Function}
 */
module.exports = function(router) {
    var hook = require('../util/hook')(router.formio);
    var formio = hook.alter('formio', router.formio);

    return function elasticsearchHandler(req, res, next) {
        var elasticsearch = require('elasticsearch');

        var client = new elasticsearch.Client( {
            hosts: [
                'https://esuser:20UcXlab!17@101.37.36.41:9200/'
            ],
            //host: '101.37.36.41:9200',
            log: 'trace'
        });

        module.exports = client;

        client.ping({
            requestTimeout: 1800000,
        }, function (error) {
            if (error) {
                console.error('elasticsearch cluster is down!');
            } else {
                console.log('All is well');
            }
        });

        if (req.method === 'POST' || req.method === 'PUT') {
            // Returns a boolean indicating whether or not a given document exists.
            client.exists({
                index: 'myindex',
                type: 'mytype',
                id: req.subId
            }, function (error, exists, value) {
                if (exists === true && req.subId != null && req.subId != '') {
                    //return res.status(400).send('Could not create the same Forms data.');
                    //req.body.data = value;
                    next();
                } else {
                    if (req.body.data.container1 != null) {
                        var req_id = (req.subId == null || req.subId == '') ? randomInt(100).toString() : req.subId;
                        // Adds a typed JSON document in a specific index, making it searchable.
                        // If a document with the same index, type, and id already exists, an error will occur.
                        client.create({
                            index: 'myindex',
                            type: 'mytype',
                            id: req_id,
                            body: req.body.data.container1
                        }, function (err, value) {
                            if (err) {
                                return res.status(400).json(err);
                            }

                            // Reset the value to what the create returns.
                            //req.body.data = value;
                            next();
                        });
                    } else {
                        next();
                    }
                }
            });
        } else {
            next();
        }


        // Get a typed JSON document from the index based on its id.
        client.get({
            index: 'myindex',
            type: 'mytype',
            id: '101'
        }, function (err, value) {
            if (err) {
                //return res.status(400).json(err);
            }

            // Reset the value to what the create returns.
            //req.body.data = value;
        });

    };
};

