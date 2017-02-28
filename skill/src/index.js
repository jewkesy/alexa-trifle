"use strict"

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
        context.succeed(buildResponse(sessionAttributes, speechletResponse));
      });
    } else if (event.request.type === "IntentRequest") {
      onIntent(event.request, event.session, function callback(sessionAttributes, speechletResponse) {
        context.succeed(buildResponse(sessionAttributes, speechletResponse));
      });
    } else if (event.request.type === "SessionEndedRequest") {
      onSessionEnded(event.request, event.session);
      context.succeed();
    }
  } catch (e) {
    context.fail("Exception: " + e);
  }
};

// Called when the session starts.
function onSessionStarted(sessionStartedRequest, session) {
  console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId + ", sessionId=" + session.sessionId);
}

// Called when the user ends the session. Is not called when the app returns shouldEndSession=true.
function onSessionEnded(sessionEndedRequest, session) {
  console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId + ", sessionId=" + session.sessionId);
}

// Called when the user launches the app without specifying what they want.
function onLaunch(launchRequest, session, callback) {
  console.log("onLaunch requestId=" + launchRequest.requestId + ", sessionId=" + session.sessionId);
  startGame(session.user.userId, callback);
}

function buildResponse(sessionAttributes, speechletResponse) {
  console.log('buildReponse', speechletResponse);
  return {
    version: "1.0",
    sessionAttributes: sessionAttributes,
    response: speechletResponse
  };
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
  var text = "Think of an object and I will try to guess what it is within twenty questions.\n";

  var opts = helpers.buildNaturalLangList(Object.keys(sessionAttributes.options), 'or');

  if (firstQuestion) {
    text += "Is it an " + opts;
  } else {
    text = "You can say " + opts + '.\n' + sessionAttributes.questionText;
  }

  callback(sessionAttributes, skillHelper.buildSpeechletResponse("Help", text, sessionAttributes.questionText, false));
}

function processAnswer(answer, session, callback) {
  var sessionAttributes = session.attributes;
  sessionAttributes.intent = answer;
  if (sessionAttributes.questionNum == 1) sessionAttributes.type = answer;

  if (sessionAttributes.options[answer] === undefined) return invalidAnswer(answer, session, callback);

  return askNextQuestion(sessionAttributes.options[answer], answer, session, callback);
}





async.parallel({
  getEasy: function (cb) {
    questions.getQuestions(QUESTIONS_URI + 'api.php?amount=1&difficulty=easy', function (err, result) {
      return cb(err, result);
    });
  },
  getMedium: function (cb) {
    questions.getQuestions(QUESTIONS_URI + 'api.php?amount=1&difficulty=medium', function (err, result) {
      return cb(err, result);
    });
  },
  getHard: function (cb) {
    questions.getQuestions(QUESTIONS_URI + 'api.php?amount=1&difficulty=hard', function (err, result) {
    return cb(err, result);
    });
  }
}, function(err, results) {
  return console.log(err, JSON.stringify(results));
});

// questions.getCategories(uri + 'api_category.php', function (err, result) {
//   console.log(err, result);
// });
//
// questions.getSessionKey(uri + 'api_token.php?command=request', function (err, result) {
//   console.log(err, result);
// });
