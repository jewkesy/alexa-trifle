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
  getUserRank: function (userId, score, uri, apiKey, callback) {
    return getUserRank(userId, score, uri, apiKey, callback);
  }
}

function getUserSummary(userId, uri, apiKey, callback) {
  // console.log(userId, uri);
  var filter = '&q={"userId":"' + userId + '"}';
  var url = uri + "?apiKey=" + apiKey + filter;
  // console.log(url);
  request.get({
    headers: {'content-type':'application/json'},
    url:     url,
  }, function(err, response, body) {
    return callback(err, JSON.parse(body))
  });
}

function setUserSummary(summary, uri, apiKey, callback) {
  // console.log(summary, uri)
  request.post({
    headers: {'content-type' : 'application/json'},
    url:     uri + "?apiKey=" + apiKey,
    body:    JSON.stringify(summary)
  }, function(err, response, body) {
    return callback(err, body)
  });
}

function getUserRank(userId, score, uri, apiKey, callback) {
  // console.log(userId, score, uri);
  var filter = '&q={"score":{$gte:' + score + '}}';
  var sort = '&s={"score":-1,"timestamp":1}';
  var url = uri + "?c=true&apiKey=" + apiKey + filter + sort;
  // console.log(url);
  request.get({
    headers: {'content-type':'application/json'},
    url:     url,
  }, function(err, response, body) {
    var retVal = {
      rank: JSON.parse(body)
    }
    getGameCount(uri, apiKey, function (err, count) {
      retVal.total = count;
      return callback(err, retVal)
    });
  });
}

function getGameCount(uri, apiKey, callback) {
  var url = uri + "?c=true&apiKey=" + apiKey;
  // console.log(url)
  request.get({
    headers: {'content-type':'application/json'},
    url:     url,
  }, function(err, response, body) {
    return callback(err, JSON.parse(body))
  });
}