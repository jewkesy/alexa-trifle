"use strict";

// var async = require('async');
var questions = require('./../src/questions.js');
// var skillHelper = require('./skillHelper.js');
var helpers = require('../src/helpers.js');
// var console = require('tracer').colorConsole();

var QUESTIONS_URI = process.env.QUESTIONS_URI || process.argv[2];

function getMultiChoiceQuestion(num) {
  // Handle multichoice question
  var uri = QUESTIONS_URI + 'api.php?amount=1&type=multiple'
  questions.getAlexaReadyQuestion(uri, num, function (err, result) {
    // console.log(err, result);
  });
}

function getTrueFalseQuestion(num) {
  // Handle multichoice question
  var uri = QUESTIONS_URI + 'api.php?amount=1&type=boolean'
  questions.getAlexaReadyQuestion(uri, num, function (err, result) {
    console.log(err, result);
  });
}

// getMultiChoiceQuestion(1);
// getMultiChoiceQuestion(2);
// getMultiChoiceQuestion(3);
getTrueFalseQuestion(1);
