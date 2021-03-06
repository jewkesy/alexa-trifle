"use strict";

var console = require('tracer').colorConsole();
var mongo =   require('./../src/mongo.js');

var MONGO_URI =     process.env.MONGO_URI       || process.argv[2];
var MONGO_API_KEY = process.env.MONGO_API_KEY   || process.argv[3];

console.log(MONGO_URI, MONGO_API_KEY)

var user = {
  userId: new Date().getTime(),
  startDate: new Date(),
  startTimestamp: new Date().getTime(),
  score: randomInt(0, 100),
  games: randomInt(1, 20),
  date: new Date(),
  timestamp: new Date().getTime()
}

function testGetUserSummary(id, callback) {
  mongo.getUserSummary(id, MONGO_URI + 'trifle/collections/game', MONGO_API_KEY, function(err, result) {
    if (result.length == 0) return callback(err, user);
    return callback(err, result[0]);
  });
}

function testSetUserSummary(summary, callback) {
  summary.score++;
  summary.games++;
  summary.date = new Date();
  summary.timestamp = new Date().getTime();
  // console.log(summary)
  mongo.setUserSummary(summary, MONGO_URI + 'trifle/collections/game', MONGO_API_KEY, function(err, result) {
    return callback(err, result);
  });
}

testGetUserSummary(user.userId, function (err, result) {
  // console.log(err, result);
  testSetUserSummary(result, function (err, result) {
    // console.log(err, result);
    testGetUserSummary(result.userId, function (err, result) {
      console.log(err, result);
    });
  });
});

function testGetUserRank(userId, score, callback) {
  
  mongo.getUserRank(userId, score, MONGO_URI + 'trifle/collections/game', MONGO_API_KEY, function(err, result) {
    return callback(err, result);
  });
}
 
// testGetUserSummary();
testSetUserSummary(user, function (err, result){});
testGetUserRank(user.userId, user.score, function (err, result){
  console.log(err, result)
});

function randomInt(low, high) {
  return Math.floor(Math.random() * high);
}