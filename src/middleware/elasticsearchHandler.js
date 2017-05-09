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
            var originalUrl = req.originalUrl;
            if (originalUrl.indexOf('/user/login/submission') >= 0) {
                next();
            } else {
                var request = require('request');
                var formId = req.formId;
                var data = req.body.data;
                if (data != null) {
                    if (formId == '590ad7d0ec345b0267877fa3') {
                        // "title" : "Patient MRN Record"
                        var e_gender = '';
                        if (data.gender == 'F') {
                            e_gender = '女性';
                        } else if (data.gender == 'M') {
                            e_gender = '男性';
                        }

                        var e_smokingStatus = '';
                        if (data.smokingStatus == "0") {
                            e_smokingStatus = '不吸烟者';
                        } else if (data.smokingStatus == "1") {
                            e_smokingStatus = '吸烟者';
                        }

                        var v_params = {MRN: data.mrn, name: data.name, DOB: data.dob, age: data.age, gender: e_gender, zipcode: data.zipCode, phoneNumber: data.phoneNumber, preferredLanguage: data.preferredLanguage, smokingStatus: e_smokingStatus};
                        //alert('params: ' + JSON.stringify(params));

                        if (req.method === 'POST') {
                            var g_url = "http://101.37.36.41:3020/api/patients?MRN=" + data.mrn;
                            request.get({
                                headers: {'content-type' : 'application/json'},
                                url:     g_url
                            }, function(error, response, body) {
                                var v_resp = JSON.parse(response.body);
                                console.log('response: ' + v_resp);

                                var v_resp_len = v_resp.length;
                                console.log('v_resp_len: ' + v_resp_len);

                                if (v_resp_len == 0) {
                                    var url = "http://101.37.36.41:3020/api/patients";
                                    request.post({
                                        headers: {'content-type': 'application/json'},
                                        url: url,
                                        body: JSON.stringify(v_params)
                                    }, function (error, response, body) {
                                        console.log(body);
                                    });
                                }
                            });
                        } else if (req.method === 'PUT') {
                            var g_url = "http://101.37.36.41:3020/api/patients?MRN=" + data.mrn;
                            request.get({
                                headers: {'content-type' : 'application/json'},
                                url:     g_url
                            }, function(error, response, body){
                                var v_resp = JSON.parse(response.body);
                                console.log('response: ' + v_resp);

                                var v_resp_0 = v_resp[0];
                                console.log('response[0]: ' + v_resp_0);

                                //var _id = JSON.stringify(v_resp_0._id);
                                var _id = v_resp_0._id;
                                _id = _id.replace('\"', '');
                                console.log('_id: ' + _id);

                                var url = "http://101.37.36.41:3020/api/patients/" + _id;
                                //var url = "http://101.37.36.41:3020/api/patients";
                                request.put({
                                    headers: {'content-type' : 'application/json'},
                                    url:     url,
                                    body:    JSON.stringify(v_params)
                                }, function(error, response, body){
                                    console.log(body);
                                });
                            });
                        }
                    } else if (formId == '590af0227098ac037cfe27b0') {
                        // "title" : "Patient Diagnostic Record"
                        var e_diagnosticPeriod = '';
                        if (data.diagnosticPeriod == '0') {
                            e_diagnosticPeriod = '2013年03月12日 - 2013年06月12日';
                        } else if (data.diagnosticPeriod == '1') {
                            e_diagnosticPeriod = '2013年06月12日 - 2013年09月12日';
                        } else if (data.diagnosticPeriod == '2') {
                            e_diagnosticPeriod = '2013年09月12日 - 2013年12月12日';
                        }

                        var v_params = {MRN: data.mrn, name: data.name, diagnosticPeriod: e_diagnosticPeriod, encounterType: data.encounterType, visitReason: data.visitReason, physician: data.physician, weight: data.weight, height: data.height, BMI: data.bmi, temperature: data.temperature, bloodPressure: data.bloodPressure, pulse: data.pulse, respiratoryRate: data.respiratoryRate};
                        //alert('params: ' + JSON.stringify(params));

                        if (req.method === 'POST') {
                            var g_url = "http://101.37.36.41:3020/api/diagnostics?MRN=" + data.mrn;
                            request.get({
                                headers: {'content-type' : 'application/json'},
                                url:     g_url
                            }, function(error, response, body) {
                                var v_resp = JSON.parse(response.body);
                                console.log('response: ' + v_resp);

                                var v_resp_len = v_resp.length;
                                console.log('v_resp_len: ' + v_resp_len);

                                if (v_resp_len == 0) {
                                    var url = "http://101.37.36.41:3020/api/diagnostics";
                                    request.post({
                                        headers: {'content-type' : 'application/json'},
                                        url:     url,
                                        body:    JSON.stringify(v_params)
                                    }, function(error, response, body) {
                                        console.log(body);
                                    });
                                }
                            });
                        } else if (req.method === 'PUT') {
                            var g_url = "http://101.37.36.41:3020/api/diagnostics?MRN=" + data.mrn;
                            request.get({
                                headers: {'content-type' : 'application/json'},
                                url:     g_url
                            }, function(error, response, body){
                                var v_resp = JSON.parse(response.body);
                                console.log('response: ' + v_resp);

                                var v_resp_0 = v_resp[0];
                                console.log('response[0]: ' + v_resp_0);

                                //var _id = JSON.stringify(v_resp_0._id);
                                var _id = v_resp_0._id;
                                _id = _id.replace('\"', '');
                                console.log('_id: ' + _id);

                                var url = "http://101.37.36.41:3020/api/diagnostics/" + _id;
                                //var url = "http://101.37.36.41:3020/api/diagnostics";
                                request.put({
                                    headers: {'content-type' : 'application/json'},
                                    url:     url,
                                    body:    JSON.stringify(v_params)
                                }, function(error, response, body){
                                    console.log(body);
                                });
                            });
                        }
                    }
                }

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
                        if (req.body.data != null) {
                            var req_id = (req.subId == null || req.subId == '') ? randomInt(100).toString() : req.subId;
                            // Adds a typed JSON document in a specific index, making it searchable.
                            // If a document with the same index, type, and id already exists, an error will occur.
                            client.create({
                                index: 'myindex',
                                type: 'mytype',
                                id: req_id,
                                body: req.body.data
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
            }
        } else {
            next();
        }
    };
};

