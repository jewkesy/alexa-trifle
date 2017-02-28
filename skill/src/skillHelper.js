"use strict";

var console = require('tracer').colorConsole();
var helpers = require('./helpers.js');

module.exports = {
	buildSpeechletResponse: function (title, output, repromptText, shouldEndSession, cardText, cardType) {
		return buildSpeechletResponse(title, output, repromptText, shouldEndSession, cardText, cardType);
	}
}

function buildSpeechletResponse(title, output, repromptText, shouldEndSession, cardText, cardType) {

  if (typeof cardType == 'undefined') cardType = "Simple";  // Standard
  if (typeof cardText == 'undefined') cardText = output;
  output = helpers.handleSpeechQuerks(output);
  return {
    outputSpeech: {
      type: "SSML", //PlainText or SSML
      ssml: "<speak>" + output + "</speak>"  //output
      //  text: output
    },
    card: {
      type: cardType,
      title: "Trifle - " + title,
      content: cardText
    },
    reprompt: {
      outputSpeech: {
        type: "PlainText",
        text: repromptText
      }
    },
    shouldEndSession: shouldEndSession
  };
}
