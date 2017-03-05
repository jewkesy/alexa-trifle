"use strict";

var console =     require('tracer').colorConsole();
var request =     require('request');

module.exports = {
  getUserSummary: function (userId, uri, apiKey, callback) {
    return getUserSummary(userId, uri, apiKey, callback);
  },
  setUserSummary: function (summary, uri, apiKey, callback) {
    return setUserSummary(summary, uri, apiKey, callback);
  },
}

function getUserSummary(userId, uri, apiKey, callback) {
  request.get({
    headers: {'content-type':'application/json'},
    url:     uri + "?apiKey=" + apiKey,
  }, function(err, response, body){
    // console.log(JSON.parse(body));
    return callback(err, JSON.parse(body))
  });
}

function setUserSummary(summary, uri, apiKey, callback) {
  // console.log(summary)
  request.post({
    headers: {'content-type' : 'application/json'},
    url:     uri + "?apiKey=" + apiKey,
    body:    JSON.stringify(summary)
  }, function(err, response, body) {
    // console.log(err, response, body);
    return callback(err, body)
  });
}
