// test/readall.js
//
// Testing readAll() method
//
// Copyright 2012, StatusNet Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var assert = require('assert'),
    vows = require('vows'),
    databank = require('../databank'),
    Databank = databank.Databank;

var readAllContext = function(driver, params) {

    var context = {};

    context["When we create a " + driver + " databank"] = {

        topic: function() {
            params.schema = {
                test: {
                    pkey: 'number'
                }
            };
            return Databank.get(driver, params);
        },

        'We can connect to it': {
            topic: function(bank) {
                bank.connect(params, this.callback);
            },
            'without an error': function(err) {
                assert.ifError(err);
            },
            'and we can create an item': {
                topic: function(bank) {
                    bank.create('test', 2, {'pass': false, 'iters': 30}, this.callback);
                },
                'without an error': function(err, result2) {
                    assert.ifError(err);
                    assert.isObject(result2);
                    assert.equal(result2.pass, false);
                    assert.equal(result2.iters, 30);
                },
                'and we can create another item': {
                    topic: function(result2, bank) {
                        bank.create('test', 3, {'pass': true, 'iters': 77}, this.callback);
                    },
                    'without an error': function(err, result3) {
                        assert.ifError(err);
                        assert.isObject(result3);
                        assert.equal(result3.pass, true);
                        assert.equal(result3.iters, 77);
                    },
                    'and we can create yet another item': {
                        topic: function(result3, result2, bank) {
                            bank.create('test', 4, {'pass': false, 'iters': 109}, this.callback);
                        },
                        'without an error': function(err, result4) {
                            assert.ifError(err);
                            assert.isObject(result4);
                            assert.equal(result4.pass, false);
                            assert.equal(result4.iters, 109);
                        },
                        'and we can read them all back': {
                            topic: function(result4, result3, result2, bank) {
                                bank.readAll('test', [2, 3, 4, 'nonexistent'], this.callback);
                            },
                            'without an error': function(err, results) {
                                assert.ifError(err);
                                assert.isObject(results);
                                assert.isObject(results[2]);
                                assert.equal(results[2].pass, false);
                                assert.equal(results[2].iters, 30);
                                assert.isObject(results[3]);
                                assert.equal(results[3].pass, true);
                                assert.equal(results[3].iters, 77);
                                assert.isObject(results[4]);
                                assert.equal(results[4].pass, false);
                                assert.equal(results[4].iters, 109);
                                assert.isNull(results['nonexistent']);
                            },
                            'and we can delete the most recent': {
                                topic: function(results, result4, result3, result2, bank) {
                                    bank.del('test', 4, this.callback);
                                },
                                'without an error': function(err) {
                                    assert.ifError(err);
                                },
                                'and we can delete the next most recent': {
                                    topic: function(results, result4, result3, result2, bank) {
                                        bank.del('test', 3, this.callback);
                                    },
                                    'without an error': function(err) {
                                        assert.ifError(err);
                                    },
                                    'and we can delete the oldest': {
                                        topic: function(results, result4, result3, result2, bank) {
                                            bank.del('test', 2, this.callback);
                                        },
                                        'without an error': function(err) {
                                            assert.ifError(err);
                                        },
                                        'and we can disconnect': {
                                            topic: function(results, result4, result3, result2, bank) {
                                                bank.disconnect(this.callback);
                                            },
                                            'without an error': function(err) {
                                                assert.ifError(err);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    return context;
};

module.exports = readAllContext;