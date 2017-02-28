"use strict"

var questions = require('./questions.js');
var console = require('tracer').colorConsole();

var uri = process.argv[2];

questions.getCategories(uri + 'api_category.php', function (err, result) {
  console.log(err, result);
});

questions.getQuestions(uri + 'api.php?amount=1&difficulty=easy', function (err, result) {
  console.log(err, result);
});

questions.getQuestions(uri + 'api.php?amount=1&difficulty=medium', function (err, result) {
  console.log(err, result);
});

questions.getQuestions(uri + 'api.php?amount=1&difficulty=hard', function (err, result) {
  console.log(err, result);
});

questions.getSessionKey(uri + 'api_token.php?command=request', function (err, result) {
  console.log(err, result);
});
