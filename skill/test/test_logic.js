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
  var speechPrefix = '';
  if (num == 1) {
    speechPrefix = 'First question for 1 point. ';
    uri += '&difficulty=easy';
  }
  else if (num == 2) {
    speechPrefix = 'Second question for 2 points. ';
    uri += '&difficulty=medium';
  }
  else if (num == 3) {
    speechPrefix = 'Final question for 3 points. ';
    uri += '&difficulty=hard';
  }

  questions.getQuestions(uri, function (err, result) {
    console.log(result.results[0].question, result.results[0].correct_answer)
    var q = helpers.handleSpeechQuerks(result.results[0].question);

    // 1. Merge correct answer with options
    var opts = result.results[0].incorrect_answers;
    opts.push(result.results[0].correct_answer)

    // console.log(opts)
    // 2. Shuffle
    helpers.shuffle(opts)
    // console.log(opts);

    // 3. Get idx of correct, map to a, b, c or d.
    var idx = opts.indexOf(result.results[0].correct_answer);

    var correctLetter;
    if (idx == 0) {
      correctLetter = 'a';
    } else if (idx == 1) {
      correctLetter = 'b';
    } else if (idx == 2) {
      correctLetter = 'c';
    } else if (idx == 3) {
      correctLetter = 'd';
    }
    console.log(correctLetter);
    opts[0] = 'a) ' + opts[0];
    opts[1] = 'b) ' + opts[1];
    opts[2] = 'c) ' + opts[2];
    opts[3] = 'd) ' + opts[3];

    // 4. Build natural langauge quesiton
    var question = q + '\n Is it ' + helpers.buildNaturalLangList(opts, 'or');

    var alexa = {
      cardText: 'TODO: Format question',
      title: "New Game",
      sayText: speechPrefix + question,
      repromptText: question + '. Answer by saying a b c or d',
    };

    console.log(alexa);

    var sessionAttributes = {
      questionNum: num,
      questionText: question,
      correctLetter: correctLetter,
      correctAnswer: result.results[0].correct_answer,
      questionType: result.results[0].type,
      shouldEndSession: false,
    };
    sessionAttributes.questionNum = num;

    // console.log(alexa, sessionAttributes)
    // return callback(sessionAttributes, skillHelper.buildSpeechletResponse(retVal.title, retVal.sayText, retVal.repromptText, retVal.shouldEndSession, retVal.cardText));
  });
}

getMultiChoiceQuestion(1);
getMultiChoiceQuestion(2);
getMultiChoiceQuestion(3);
