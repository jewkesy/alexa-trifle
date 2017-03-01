"use strict"

var request = require('request');
var console = require('tracer').colorConsole();

module.exports = {
  getCategories: function (uri, callback) {
    return getCategories(uri, callback);
  },
  getQuestions: function (uri, callback) {
    return getQuestions(uri, callback);
  },
  getSessionKey: function (uri, callback) {
    return getSessionKey(uri, callback);
  }
}

function getCategories(uri, callback) {
  request.get({
    headers: {'content-type':'application/json'},
    url:     uri
  }, function(err, response, body){
    return callback(err, JSON.parse(body))
  });
}

function getQuestions(uri, callback) {
  console.log(uri)
  request.get({
    headers: {'content-type':'application/json'},
    url:     uri
  }, function(err, response, body){
    return callback(err, JSON.parse(body))
  });
}

function getSessionKey(uri, callback) {
  request.get({
    headers: {'content-type':'application/json'},
    url:     uri
  }, function(err, response, body){
    return callback(err, JSON.parse(body))
  });
}
