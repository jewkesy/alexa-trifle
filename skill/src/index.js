"use strict"

var async = require('async');
var questions = require('./questions.js');
var console = require('tracer').colorConsole();

var uri = process.env.quizURI || process.argv[2];

async.parallel({
  getEasy: function (cb) {
    questions.getQuestions(uri + 'api.php?amount=1&difficulty=easy', function (err, result) {
      return cb(err, result);
    });
  },
  getMedium: function (cb) {
    questions.getQuestions(uri + 'api.php?amount=1&difficulty=medium', function (err, result) {
      return cb(err, result);
    });
  },
  getHard: function (cb) {
    questions.getQuestions(uri + 'api.php?amount=1&difficulty=hard', function (err, result) {
    return cb(err, result);
    });
  }
}, function(err, results) {
  console.log(err, JSON.stringify(results));
});

// questions.getCategories(uri + 'api_category.php', function (err, result) {
//   console.log(err, result);
// });
//
// questions.getSessionKey(uri + 'api_token.php?command=request', function (err, result) {
//   console.log(err, result);
// });
