"use strict";

// var async = require('async');
var questions = require('./../src/questions.js');
// var skillHelper = require('./skillHelper.js');
var helpers = require('../src/helpers.js');
// var console = require('tracer').colorConsole();

var QUESTIONS_URI = process.env.QUESTIONS_URI || process.argv[2];

// Handle multichoice question
questions.getQuestions(QUESTIONS_URI + 'api.php?amount=1&type=multiple', function (err, result) {
  console.log(result.results[0].question, result.results[0].correct_answer)
  // 1. Merge correct answer with options
  var opts = result.results[0].incorrect_answers;
  opts.push(result.results[0].correct_answer)

  console.log(opts)
  // 2. Shuffle
  shuffle(opts)
  console.log(opts);

  // 3. Get idx of correct, map to a, b, c or d.
  var idx = opts.indexOf(result.results[0].correct_answer);

  var correct;
  if (idx == 0) {
    correct = 'a';
  } else if (idx == 1) {
    correct = 'b';
  } else if (idx == 2) {
    correct = 'c';
  } else if (idx == 3) {
    correct = 'd';
  }
  console.log(correct);
  opts[0] = 'A) ' + opts[0];
  opts[1] = 'B) ' + opts[1];
  opts[2] = 'C) ' + opts[2];
  opts[3] = 'D) ' + opts[3];

  // 4. Build natural langauge quesiton
  var question = result.results[0].question + ' Is it ' + helpers.buildNaturalLangList(opts, 'or');
  console.log(question);
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

  // console.log(alexa, sessionAttributes)
  // return callback(sessionAttributes, skillHelper.buildSpeechletResponse(retVal.title, retVal.sayText, retVal.repromptText, retVal.shouldEndSession, retVal.cardText));
});


function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
