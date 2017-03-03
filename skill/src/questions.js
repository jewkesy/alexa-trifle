"use strict"

var request = require('request');
var console = require('tracer').colorConsole();
var helpers = require('./helpers.js');
var skillHelper = require('./skillHelper.js');

module.exports = {
  getAlexaReadyQuestion: function (uri, num, callback) {
    return getAlexaReadyQuestion(uri, num, callback);
  },
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

function getAlexaReadyQuestion(uri, num, callback) {
  var speechPrefix = '';
  var difficulty = '';
  if (num == 1) {
    speechPrefix = 'First question for 1 point. ';
    uri += '&difficulty=easy';
    difficulty = 'easy';
  }
  else if (num == 2) {
    speechPrefix = 'Second question for 2 points. ';
    uri += '&difficulty=medium';
    difficulty = 'tricky';
  }
  else if (num == 3) {
    speechPrefix = 'Final question for 3 points. ';
    uri += '&difficulty=hard';
    difficulty = 'hard';
  }

  getQuestions(uri, function (err, result) {
    if (err) return callback(err);

    var alexa;
    if (result.results[0].type == 'multiple') {
      alexa = buildMultiChoiceQuestion(result.results[0], difficulty, speechPrefix, num);
    } else if (result.results[0].type == 'boolean') {
      alexa = buildTrueFalseQuestion(result.results[0], difficulty, speechPrefix, num);
    } else {
      return callback('Unhandled question type: ' + result.results[0].type);
    }

    // console.log(alexa)

    var sessionAttributes = {
      questionNum: num,
      questionText: alexa.question,
      correctLetter: alexa.correctLetter,
      correctAnswer: result.results[0].correct_answer,
      questionType: result.results[0].type,
      shouldEndSession: false,
    };

    // console.log(alexa, sessionAttributes)
    var speechlet = skillHelper.buildSpeechletResponse(alexa.title, alexa.sayText, alexa.repromptText, sessionAttributes.shouldEndSession, alexa.cardText);
    return callback(null, sessionAttributes, speechlet);
  });
}

function buildTrueFalseQuestion(result, difficulty, speechPrefix, num) {
  var q = "True or False. " + helpers.handleSpeechQuerks(result.question);
  var cardText =
    "Category: "   +  result.category + "\n" +
    "Difficulty: " +  difficulty  +  "\n" + q;

  var alexa = {
    cardText: cardText,
    title: "Question " + num,
    sayText: speechPrefix + q,
    repromptText: q + '. Answer by saying true or false',
    question: q,
    correct: result.correct_answer
  };
// console.log(alexa)
  return alexa;
}

function buildMultiChoiceQuestion(result, difficulty, speechPrefix, num) {
  var q = helpers.handleSpeechQuerks(result.question);

  // 1. Merge correct answer with options
  var opts = result.incorrect_answers;
  opts.push(result.correct_answer)

  // 2. Shuffle
  helpers.shuffle(opts)

  // 3. Get idx of correct, map to a, b, c or d.
  var idx = opts.indexOf(result.correct_answer);

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

  opts[0] = 'a) ' + opts[0];
  opts[1] = 'b) ' + opts[1];
  opts[2] = 'c) ' + opts[2];
  opts[3] = 'd) ' + opts[3];

  // 4. Build natural langauge quesiton
  var question = q + '? Is it ' + helpers.buildNaturalLangList(opts, 'or');

  var cardText =
    "Category: "   +  result.category + "\n" +
    "Difficulty: " +  difficulty  +  "\n" + q +
    "\n" + opts[0] + "\n" + opts[1] + "\n" + opts[2] + "\n" + opts[3];

  var alexa = {
    cardText: cardText,
    title: "Question " + num,
    sayText: speechPrefix + question,
    repromptText: question + '. Answer by saying a ,b, c or d',
    questionText: question,
    correctLetter: correctLetter,
    answer: result.correct_answer
  };

  return alexa;
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
  // console.log(uri)
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
