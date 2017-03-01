"use strict";

// var async = require('async');
var questions = require('./../src/questions.js');
// var skillHelper = require('./skillHelper.js');
// var helpers = require('./helpers.js');
// var console = require('tracer').colorConsole();

var QUESTIONS_URI = process.env.QUESTIONS_URI || process.argv[2];

questions.getQuestions(QUESTIONS_URI + 'api.php?amount=1&difficulty=easy', function (err, result) {


  console.log(err, result);
  //var question =
  //opts = helpers.buildNaturalLangList(Object.keys(sessionAttributes.options), 'or');
  var alexa = {
    cardText: '\nQuestion 1. ' + result.results[0].question,
    title: "New Game",
    sayText: "Question 1. " + result.results[0].question,
    repromptText: "TODO",
  };

  var sessionAttributes = {
    questionNum: 1,
    questionText: 'TODO',
    correctAnswer: 'TODO',
    questionType: result.results[0].type,
    shouldEndSession: false,
  };
  sessionAttributes.questionNum = 1;

  console.log(alexa, sessionAttributes)
  // return callback(sessionAttributes, skillHelper.buildSpeechletResponse(retVal.title, retVal.sayText, retVal.repromptText, retVal.shouldEndSession, retVal.cardText));
});
