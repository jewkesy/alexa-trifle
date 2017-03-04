"use strict";

var console = require('tracer').colorConsole();
var helpers = require('./helpers.js');

module.exports = {
	buildSpeechletResponse: function (title, output, repromptText, shouldEndSession, showCard, cardText, cardType) {
		return buildSpeechletResponse(title, output, repromptText, shouldEndSession, showCard, cardText, cardType);
	},
  buildResponse: function (sessionAttributes, speechletResponse) {
    return buildResponse(sessionAttributes, speechletResponse);
  }
}

function buildSpeechletResponse(title, output, repromptText, shouldEndSession, showCard, cardText, cardType) {

  if (showCard && typeof cardType == 'undefined') cardType = "Simple";  // Standard
  if (showCard && typeof cardText == 'undefined') cardText = output;

  output = helpers.handleSpeechQuerks(output);
  var retVal = {
    outputSpeech: {
      type: "SSML", // PlainText or SSML
      ssml: "<speak>" + output + "</speak>"
      //  text: output
    },
    card: {
      type: cardType,
      title: title,
      content: cardText
    },
    reprompt: {
      outputSpeech: {
        type: "SSML", // PlainText or SSML
        ssml: "<speak>" + repromptText + "</speak>"
				//  text: repromptText
      }
    },
    shouldEndSession: shouldEndSession
  };
	if (!showCard) {
		delete retVal.card;
	}
	return retVal
}

function buildResponse(sessionAttributes, speechletResponse) {
  // console.log('buildReponse', speechletResponse);
  return {
    version: "1.0",
    sessionAttributes: sessionAttributes,
    response: speechletResponse
  };
}
