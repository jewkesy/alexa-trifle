"use strict";

// var async = require('async');
var questions = require('./questions.js');
var skillHelper = require('./skillHelper.js');
var helpers = require('./helpers.js');
var console = require('tracer').colorConsole();

var QUESTIONS_URI = process.env.QUESTIONS_URI   || process.argv[2];
var ALEXA_APP_ID =  process.env.ALEXA_APP_ID    || process.argv[3];

exports.handler = function (event, context) {
  try {
    // console.log(event.request);
    // console.log("event.session.application.applicationId=" + event.session.application.applicationId, "amzn1.echo-sdk-ams.app." + ALEXA_APP_ID);

    // if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app." + ALEXA_APP_ID) {
    //     context.fail("Invalid Application ID");
    // }

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
  // event.request.intent.slots.Answer.value
  switch(intentName) {
    case "StopIntent":
    case "CancelIntent":
    case "NoIntent":
      return stop(intentName, session, callback);
    case "HelpIntent":
      return processGameHelp(false, session, callback);
    case "PlayIntent":
    case "YesIntent":
      return startGame(session.user.userId, callback);
    case "TrueIntent":
    case "FalseIntent":
    case "AIntent":
    case "BIntent":
    case "CIntent":
    case "DIntent":
      return processAnswer(intentName, session, callback);
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
  callback(sessionAttributes, skillHelper.buildSpeechletResponse("Goodbye", "Thanks for playing", "", true, false));
}

function repeatQuestion(intent, session, callback) {
  var sessionAttributes = session.attributes;
  console.log('TODO Handle true or false or a, b, c or d response');
  callback(sessionAttributes,
    skillHelper.buildSpeechletResponse("Question " + sessionAttributes.questionNum, sessionAttributes.questionText,
      sessionAttributes.questionText + "\nTODO Handle true or false or a, b, c or d response",  false));
}

function unknownAnswer(session, callback) {
  var sessionAttributes = session.attributes;
  callback(sessionAttributes, skillHelper.buildSpeechletResponse("Invalid Answer", "Sorry, I didn't understand the answer.\nPlease try again or say help.", sessionAttributes.questionText, false, false));
}

function invalidAnswer(intent, session, callback) {
  var sessionAttributes = session.attributes;
  sessionAttributes.intent = intent;

  var questiontext = "Sorry, that was not a valid answer. ";

  if (sessionAttributes.questionType == 'multiple') {
    questiontext += "You can say a, b, c or d";
  } else {
    questiontext += "You can say true or false";
  }
  console.log(sessionAttributes)
  var speechlet = skillHelper.buildSpeechletResponse("Invalid Answer", questiontext, sessionAttributes.repromptText, false, false);
  console.log(speechlet)
  callback(sessionAttributes, speechlet);
}

function processGameHelp(firstQuestion, session, callback) {
  var sessionAttributes = session.attributes;
  sessionAttributes.intent = 'HelpIntent';
  var text = "TODO Answer three questions that steadily get more difficult.  Points increase for each correct answer.\n";

  var opts = helpers.buildNaturalLangList(sessionAttributes.options, 'or');

  if (firstQuestion) {
    text += "You can say " + opts + '.\n' + sessionAttributes.questionText;
  } else {
    text = "You can say " + opts + '.\n' + sessionAttributes.questionText;
  }

  var speechlet = skillHelper.buildSpeechletResponse("Help", text, sessionAttributes.questionText, false, false);
  console.log(speechlet);
  callback(sessionAttributes, speechlet);
}

function processAnswer(input, session, callback) {
  console.log(input, session);
  var sessionAttributes = session.attributes;
  var answer;

  // check type of question matches answer type
  if (sessionAttributes.questionType == 'multiple') {
    switch (input) {
      case "AIntent":
        answer = 'a';
        break;
      case "BIntent":
        answer = 'b';
        break;
      case "CIntent":
        answer = 'c';
        break;
      case "DIntent":
        answer = 'd';
        break;
      default:
        return invalidAnswer(input, session, callback);
    }
  } else if (sessionAttributes.questionType == 'boolean') {
    switch (input) {
      case "TrueIntent":
        answer = 'true';
        break;
      case "FalseIntent":
        answer = 'false';
        break;
      default:
        return invalidAnswer(input, session, callback);
    }
  } else {
    return invalidAnswer(input, session, callback);
  }

  var prefix;

  if (answer == sessionAttributes.correct) {
    sessionAttributes.currentScore += sessionAttributes.questionNum;
    sessionAttributes.correctCount++;
    prefix = helpers.getCorrectPhrase();
  } else {
    prefix = helpers.getIncorrectPhrase();
  }

  if (sessionAttributes.questionNum == 3) {
    console.log('TODO Set attribs for completed game')

    getSummary(prefix + '. ', sessionAttributes, function (err, sessionAttributes, speechlet) {
      return callback(sessionAttributes, speechlet);
    });

  } else {
    // set up for next question
    var difficulty;
    if (sessionAttributes.difficulty == 'easy') difficulty = 'medium';
    else if (sessionAttributes.difficulty == 'medium') difficulty = 'hard';

    sessionAttributes.questionNum++;

    askQuestion(prefix + '. ', sessionAttributes, QUESTIONS_URI + 'api.php?amount=1&difficulty=' + difficulty, sessionAttributes.questionNum, function(err, sessionAttributes, speechlet) {
      return callback(sessionAttributes, speechlet);
    });
  }
}

function startGame(userId, callback) {
  // console.log("TODO get user from db");
  var sessionAttributes = {
    questionNum: 1,
    currentScore: 0,
    correctCount: 0,
    shouldEndSession: false,
    device: 'Alexa'
  };

  askQuestion("Hello. ", sessionAttributes, QUESTIONS_URI + 'api.php?amount=1&difficulty=easy', sessionAttributes.questionNum, function(err, sessionAttributes, speechlet) {
    return callback(sessionAttributes, speechlet);
  });
}

function askQuestion(prefix, sessionAttributes, uri, num, callback) {
  questions.getAlexaReadyQuestion(prefix, sessionAttributes, uri, num, function (err, sessionAttributes, speechlet) {
    return callback(err, sessionAttributes, speechlet);
  });
}

function getSummary(prefix, sessionAttributes, callback) {
  console.log('TODO: build game summary');
  // calculate score with bonus

  // push score

  // grab new rank

  // create card

  return callback(sessionAttributes, callback);
}

function getRank(userId, callback) {
  return callback(null, {});
}

function getScore(userId, callback) {
  return callback(null, {});
}
