"use strict";

var async = require('async');
var questions = require('./questions.js');
var skillHelper = require('./skillHelper.js');
var helpers = require('./helpers.js');
var console = require('tracer').colorConsole();

var QUESTIONS_URI = process.env.quizURI || process.argv[2];
var ALEXA_APP_ID =  process.env.appID   || process.argv[3];

exports.handler = function (event, context) {
  try {
    console.log("event.session.application.applicationId=" + event.session.application.applicationId, "amzn1.echo-sdk-ams.app." + ALEXA_APP_ID);

    if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app." + ALEXA_APP_ID) {
        context.fail("Invalid Application ID");
    }

    if (event.session.new) {
      onSessionStarted({requestId: event.request.requestId}, event.session);
    }

    if (event.request.type === "LaunchRequest") {
      onLaunch(event.request, event.session, function callback(sessionAttributes, speechletResponse) {
        context.succeed(skillHelper.buildResponse(sessionAttributes, speechletResponse));
      });
    } else if (event.request.type === "IntentRequest") {
      onIntent(event.request, event.session, function callback(sessionAttributes, speechletResponse) {
        context.succeed(skillHelper.buildResponse(sessionAttributes, speechletResponse));
      });
    } else if (event.request.type === "SessionEndedRequest") {
      onSessionEnded(event.request, event.session);
      context.succeed();
    }
  } catch (e) {
    context.fail("Exception: " + e);
  }
};

function onSessionStarted(sessionStartedRequest, session) { // Called when the session starts.
  console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId + ", sessionId=" + session.sessionId);
}

function onSessionEnded(sessionEndedRequest, session) { // Called when the user ends the session. Is not called when the app returns shouldEndSession=true.
  console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId + ", sessionId=" + session.sessionId);
}

function onLaunch(launchRequest, session, callback) { // Called when the user launches the app without specifying what they want.
  console.log("onLaunch requestId=" + launchRequest.requestId + ", sessionId=" + session.sessionId);
  startGame(session.user.userId, callback);
}

function onIntent(intentRequest, session, callback) { // Called when the user specifies an intent for this application.
  // console.log("onIntent requestId=" + intentRequest.requestId + ", sessionId=" + session.sessionId + ", intentName=" + intentRequest.intent.name);
  // console.log('onIntent', intentRequest)

  var intent = intentRequest.intent, intentName = intentRequest.intent.name;

  var sessionAttributes = session.attributes;

  if (typeof sessionAttributes == 'undefined') return startGame(session.user.userId, callback);

  switch(intentName) {
    case "StopIntent":
    case "CancelIntent":
      return stop(intentName, session, callback);
    case "HelpIntent":
      return processGameHelp(false, session, callback);
    case "PlayIntent":
      return startGame(session.user.userId, callback);
    case "TrueFalseIntent":
      return processAnswer('TODO', session, callback);
    case "MultiChoiceIntent":
      return processAnswer('TODO', session, callback);
    case "RepeatIntent":
      return repeatQuestion(intentName, session, callback);
    case "RankIntent":
      return getRank(session, callback);
    case "ScoreIntent":
      return getScore(session, callback);
    default:
      return invalidAnswer(intentName, session, callback);
  }
}

function stop(intent, session, callback) {
  var sessionAttributes = session.attributes;
  sessionAttributes.intent = intent;
  callback(sessionAttributes, skillHelper.buildSpeechletResponse("Goodbye", "Thanks for playing", "", true));
}

function repeatQuestion(intent, session, callback) {
  var sessionAttributes = session.attributes;
  callback(sessionAttributes,
    skillHelper.buildSpeechletResponse("Question " + sessionAttributes.questionNum, sessionAttributes.questionText,
      sessionAttributes.questionText + "\nTODO Handle true or false or a, b, c or d response",  false));
}

function unknownAnswer(session, callback) {
  var sessionAttributes = session.attributes;
  callback(sessionAttributes, skillHelper.buildSpeechletResponse("Invalid Answer", "Sorry, I didn't understand the answer.\nPlease try again or say help.", sessionAttributes.questionText, false));
}

function invalidAnswer(intent, session, callback) {
  console.log(intent);
  var sessionAttributes = session.attributes;
  sessionAttributes.intent = intent;
  var optionlist = helpers.buildNaturalLangList(Object.keys(sessionAttributes.options), 'or');

  var questiontext = "Sorry, that was not a valid answer.\n";

  if(sessionAttributes.questionNum.toString() == '1') {
    questiontext += "You can say " + optionlist;
  } else {
    questiontext += "Please try again or ask for help.\n" + sessionAttributes.questionText;
  }

  callback(sessionAttributes, skillHelper.buildSpeechletResponse("Invalid Answer", questiontext, sessionAttributes.questionText, false));
}

function processGameHelp(firstQuestion, session, callback) {
  var sessionAttributes = session.attributes;
  sessionAttributes.intent = 'HelpIntent';
  var text = "TODO Answer three questions that steadily get more difficult.  Points increase for each correct answer.\n";

  var opts = helpers.buildNaturalLangList(Object.keys(sessionAttributes.options), 'or');

  if (firstQuestion) {
    text += "You can say " + opts + '.\n' + sessionAttributes.questionText;
  } else {
    text = "You can say " + opts + '.\n' + sessionAttributes.questionText;
  }

  callback(sessionAttributes, skillHelper.buildSpeechletResponse("Help", text, sessionAttributes.questionText, false));
}

function processAnswer(answer, session, callback) {

  // this.event.request.intent.slots.Answer.value

  var sessionAttributes = session.attributes;
  sessionAttributes.intent = answer;
  if (sessionAttributes.questionNum == 1) sessionAttributes.type = answer;

  if (sessionAttributes.options[answer] === undefined) return invalidAnswer(answer, session, callback);

  return askNextQuestion(sessionAttributes.options[answer], answer, session, callback);
}

function startGame(userId, callback) {
  questions.getQuestions(QUESTIONS_URI + 'api.php?amount=1&difficulty=easy', function (err, result) {

    var retVal = {
      cardText: '\nQuestion 1. TODO',
      title: "New Game",
      sayText: "Question 1. TODO",
      repromptText: "TODO",
      shouldEndSession: false
    }

    return callback(err, retVal);
  });
}

function askNextQuestion(uri, answer, session, callback) {
  return callback(null, {});
})

function getRank(userId, callback) {
  return callback(null, {});
}

function getScore(userId, callback) {
  return callback(null, {});
}

// async.parallel({
//   getEasy: function (cb) {
//     questions.getQuestions(QUESTIONS_URI + 'api.php?amount=1&difficulty=easy', function (err, result) {
//       return cb(err, result);
//     });
//   },
//   getMedium: function (cb) {
//     questions.getQuestions(QUESTIONS_URI + 'api.php?amount=1&difficulty=medium', function (err, result) {
//       return cb(err, result);
//     });
//   },
//   getHard: function (cb) {
//     questions.getQuestions(QUESTIONS_URI + 'api.php?amount=1&difficulty=hard', function (err, result) {
//     return cb(err, result);
//     });
//   },
//   getCategories: function (cb) {
//     questions.getCategories(QUESTIONS_URI + 'api_category.php', function (err, result) {
//       return cb (err, result);
//     });
//   },
//   getSessionKey: function (cb) {
//     // Session keys help prevent repeat questions, but needs persisting.  Prob not possible through Alexa downtime
//     questions.getSessionKey(QUESTIONS_URI + 'api_token.php?command=request', function (err, result) {
//       cb(err, result);
//     });
//   }
// }, function(err, results) {
//   return console.log(err, JSON.stringify(results));
// });
