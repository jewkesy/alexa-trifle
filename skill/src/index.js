"use strict";

// var async = require('async');
var mongo =       require('./mongo.js');
var questions =   require('./questions.js');
var skillHelper = require('./skillHelper.js');
var helpers =     require('./helpers.js');
var console =     require('tracer').colorConsole();

var QUESTIONS_URI = process.env.QUESTIONS_URI   || process.argv[2];
var ALEXA_APP_ID =  process.env.ALEXA_APP_ID    || process.argv[3];
var MONGO_URI =     process.env.MONGO_URI       || process.argv[4];
var MONGO_API_KEY = process.env.MONGO_API_KEY   || process.argv[5];

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
    // console.log(e)
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
    case "AMAZON.StopIntent":
    case "CancelIntent":
    case "AMAZON.NoIntent":
      return stop(intentName, session, callback);
    case "AMAZON.HelpIntent":
      return processGameHelp(intentName, session, callback);
    case "PlayIntent":
    case "AMAZON.YesIntent":
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
  callback(sessionAttributes, skillHelper.buildSpeechletResponse("Invalid Answer", "Sorry, I didn't understand the answer. Please try again ask for help.", sessionAttributes.questionText, false, false));
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

function processGameHelp(intent, session, callback) {
  var sessionAttributes = session.attributes;
  sessionAttributes.intent = intent;
  var text = "Answer three questions that steadily get more difficult. Points increase for each correct answer. " +
    "Answer by saying true or false, or a, b, c or d depending on the question. " +
    "View your Alexa app see the questions, your current score and your rank. ";

  var speechlet = skillHelper.buildSpeechletResponse("Help", text, sessionAttributes.repromptText, false, false);
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

  var answerStats = {
    num: sessionAttributes.questionNum,
    category: sessionAttributes.category
  }

  if (answer == sessionAttributes.correct) {
    answerStats.correct = true;
    sessionAttributes.currentScore += sessionAttributes.questionNum;
    sessionAttributes.correctCount++;
    prefix = helpers.getCorrectPhrase();
  } else {
    answerStats.correct = false;
    prefix = helpers.getIncorrectPhrase(sessionAttributes.correct, sessionAttributes.correctAnswer);
  }

  sessionAttributes.correctAnswers.push(answerStats);

  // console.log(prefix, sessionAttributes)

  if (sessionAttributes.questionNum == 3) {
    // console.log('TODO Set attribs for completed game')

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
  // userId, uri, apiKey, callback
  mongo.getUserSummary(userId, MONGO_URI + 'trifle/collections/game', MONGO_API_KEY, function(err, user) {
    if (user.length === 0) {
      user = [{
        userId: userId,
        startDate: new Date(),
        startTimestamp: new Date().getTime(),
        score: 0,
        games: 0
      }];
    }

    console.log(user);

    var sessionAttributes = {
      questionNum: 1,
      currentScore: 0,
      correctCount: 0,
      correctAnswers: [],
      shouldEndSession: false,
      device: 'Alexa',
      userDetails: user[0]
    };

    askQuestion("Hello. ", sessionAttributes, QUESTIONS_URI + 'api.php?amount=1&difficulty=easy', sessionAttributes.questionNum, function(err, sessionAttributes, speechlet) {
      console.log(speechlet);
      return callback(sessionAttributes, speechlet);
    });
  });
}

function askQuestion(prefix, sessionAttributes, uri, num, callback) {
  questions.getAlexaReadyQuestion(prefix, sessionAttributes, uri, num, function (err, sessionAttributes, speechlet) {
    return callback(err, sessionAttributes, speechlet);
  });
}

function getSummary(prefix, sessionAttributes, callback) {
  console.log(sessionAttributes)

  var score = questions.getFinalScore(sessionAttributes.correctAnswers)
  console.log(score);

  var summary = "After 3 questions, you scored " + score;
  if (score == 1) {
    summary += " point. "
  } else {
    summary += " points. "
  }

  sessionAttributes.userDetails.score += score;
  sessionAttributes.userDetails.games++;
  sessionAttributes.userDetails.date = new Date();
  sessionAttributes.userDetails.timestamp = new Date().getTime();

  // push score
  mongo.setUserSummary(sessionAttributes.userDetails, MONGO_URI + 'trifle/collections/game', MONGO_API_KEY, function(err, result) {
    console.log(err, result)
    // return callback(err, result);
    var combinedScore = sessionAttributes.userDetails.score;

    // grab new rank
    mongo.getUserRank(sessionAttributes.userDetails.userId, combinedScore, MONGO_URI + 'trifle/collections/game', MONGO_API_KEY, function(err, rank) {

      // create card
      
      var cardText = "Points this game: " + score + "\nTotal score: " + combinedScore + "\nGlobal rank: #" + rank;

      summary += "You have a total of " + combinedScore + " points and your global rank position is now number " + rank + ". ";

      // console.log(alexa, sessionAttributes)
      var speechlet = skillHelper.buildSpeechletResponse("Game Summary", prefix + summary + "Would you like to play again?", "Would you like to play again?", false, true, cardText);
      // console.log(speechlet)
      return callback(null, sessionAttributes, speechlet);
    });
    
  });
}

function getRank(userId, callback) {
  mongo.getUserSummary(userId, MONGO_URI + 'trifle/collections/game', MONGO_API_KEY, function(err, user) {
    var text;
    if (user.length === 0) {
      text = "Hello, it looks you have yet to play the game and start building your rank.  Would you like to play now?";
      var speechlet = skillHelper.buildSpeechletResponse("Your Global Rank", text, "Not Ranked", false, false);
      return callback({}, speechlet);
    }

    mongo.getUserRank(userId, MONGO_URI + 'trifle/collections/game', MONGO_API_KEY, function(err, rank) {
      var text = "Welcome back.  Your global rank is " + rank + ". Would you like a quick game now?";
      var speechlet = skillHelper.buildSpeechletResponse("Your Global Rank", text, rank, false, false);
      return callback({}, speechlet);
    });
  });
}

function getScore(userId, callback) {
  mongo.getUserSummary(userId, MONGO_URI + 'trifle/collections/game', MONGO_API_KEY, function(err, user) {
    var text;
    var score = 0;
    if (user.length === 0) {
      text = "Hello, it looks you have yet to play the game and start building your score.  Would you like to play now?";
    } else {
      score = user.score;
      text = "Welcome back.  Your global score is " + score + ". Would you like a quick game now?";
    }

    var speechlet = skillHelper.buildSpeechletResponse("Your Global Score", text, score, false, false);
    return callback({}, speechlet);
  });
}
