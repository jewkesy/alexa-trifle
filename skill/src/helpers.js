"use strict";

var console = require('tracer').colorConsole();

const winPhrases  = ["Yay", "Woo hoo", "That was easy", "Good choice", "Better luck next time", "Must try harder", "Easy peasy", "Too easy", "Ha ha", "That was difficult. Not"];
const losePhrases = ["You got me", "Couldn't get that one", "Good choice", "That was tough", "Well done", "You beat me", "That was tricky", "Whatevas", "Fine", "Gutted", "Fair play", "Doh", "Booo", "Nice one", "If I had hands, I'd clap"];
const startGamePhrases = ["I love this game", "Lets play", "Lets go", "Ok", "Lets do this"];
const farewellPhrases = ["Please visit www.daryljewkes.com to see live game statistics from the Alexa community", "Please visit www.daryljewkes.com to see the highest scores"];
const querks = [" what?"];
const correctPhrases = ["Correct!", "That was correct", "That was right"];
const incorrectPhrases = ["Incorrect!", "That was incorrect", "That was wrong"];

module.exports = {
	getStartGamePhrase: function (playr, greetingIdx, bePolite) {
		return getStartGamePhrase(playr, greetingIdx, bePolite);
	},
	getFarewellPhrase: function () {
		return farewellPhrases[randomInt(0, farewellPhrases.length)] + ". ";
	},
	getWinPhrase: function () {
		return winPhrases[randomInt(0, winPhrases.length)] + ". ";
	},
	getLostPhrase: function () {
		return losePhrases[randomInt(0, losePhrases.length)] + ". ";
	},
	getCorrectPhrase: function () {
		return correctPhrases[randomInt(0, correctPhrases.length)] + ". ";
	},
	getIncorrectPhrase: function (correctLetter, correctAnswer) {
		return getIncorrectPhrase(correctLetter, correctAnswer);
	},
	buildNaturalLangList: function (items, finalWord) {
		return buildNaturalLangList(items, finalWord);
	},
	handleSpeechQuerks: function (speech) {
		return handleSpeechQuerks(speech);
	},
	getQuestionNo: function (text){
		return getQuestionNo(text);
	},
	getGuessText: function (guessText) {
		return getGuessText(guessText);
	},
  getRandomFact: function (summary) {
    return getRandomFact(summary);
  },
	randomInt: function (low, high) {
		return randomInt(low, high);
	},
	shuffle: function (arr) {
		return shuffle(arr);
	}
}

function getIncorrectPhrase(correctLetter, correctAnswer) {

	var retVal = incorrectPhrases[randomInt(0, incorrectPhrases.length)] + ". The correct answer was ";

	if (correctLetter == 'true' || correctLetter == 'false') {
		retVal += correctLetter + ".";
	} else {
		retVal += correctLetter + ") " + correctAnswer + ".";
	}

	return retVal;
}

function getStartGamePhrase(player, greetingIdx, bePolite) {
	// console.log(player);
	console.log(greetingIdx, bePolite);

	// if new player
	if (player.length === 0) return startGamePhrases[randomInt(0, startGamePhrases.length)] + ". ";

	var lastGame = player[player.length-1];

	// pick a random welcome and mood
	if (typeof greetingIdx == 'undefined' || greetingIdx > 5 || greetingIdx < 0) greetingIdx = randomInt(0, 5);
	if (typeof bePolite == 'undefined') bePolite = Math.random() < 0.5 ? true : false;
	console.log(greetingIdx, bePolite)

	// default
	if (greetingIdx == 0) return startGamePhrases[randomInt(0, startGamePhrases.length)] + ". ";

	// how long since last game
	if (greetingIdx == 1) {
		var daysAgo = daydiff(new Date(lastGame.timestamp), new Date());
		// console.log(daysAgo)

		// less than 3

		// over a week

		// over a fortnight

		// over a month


		return startGamePhrases[randomInt(0, startGamePhrases.length)] + ". ";
	}

	// who won last game
	if (greetingIdx == 2) {
		if (lastGame.won == true) {
			if (bePolite) { 	// praise
				"You beat me last time, good .";
			} else { 	// insult

			}
		} else {
			if (bePolite) { 	// praise

			} else { 	// insult

			}
		}
		return startGamePhrases[randomInt(0, startGamePhrases.length)] + ". ";
	}

	// anything past this point needs to read the game history
	for (var i = 0; i < player.length; i++) {
		console.log(player[i].num);
	}

	// category
	if (greetingIdx == 3) {
		if (bePolite) {
			// fav cat
		} else {
			// least fav cat
		}
		return startGamePhrases[randomInt(0, startGamePhrases.length)] + ". ";
	}

	// rate score
	if (greetingIdx == 4) {
		if (bePolite) {
			// best score
		} else {
			// avg score
		}
		return startGamePhrases[randomInt(0, startGamePhrases.length)] + ". ";
	}

	// win vs lose
	if (greetingIdx == 5) {
		return startGamePhrases[randomInt(0, startGamePhrases.length)] + ". ";
	}

	// win or lose streak
	if (greetingIdx == 6) {
		if (bePolite) {
			// win streak
		} else {
			// lose streak
		}
		return startGamePhrases[randomInt(0, startGamePhrases.length)] + ". ";
	}

	// fall thru
	return startGamePhrases[randomInt(0, startGamePhrases.length)] + ". ";
}

function handleSpeechQuerks(speech) {
    if (querks.indexOf(speech) > -1) return speech.substring(0, speech.length - 1);
    return speech;
}

function buildNaturalLangList(items, finalWord) {
  var output = '';
  for (var i = 0; i < items.length; i++) {
    if(i === 0) {
      output += items[i];
    } else if (i < items.length - 1) {
      output += ', ' + items[i];
    } else {
      output += ', ' + finalWord + ' ' + items[i];
    }
  }

  return output;
}

function getRandomFact(summary) {
  return "TODO";
  var facts = [
    "Since this Skill launched, the Alexa community are currently playing an average of " + summary.avgGameHr + " games every hour!",
    "Since this Skill launched, the Alexa community are currently playing an average of " +  numberWithCommas(summary.avgGameHr*24) + " games every day!",
  ];

  var retVal =  facts[randomInt(0, facts.length )];
  console.log(retVal)
  return retVal
}

function randomInt(low, high) {
  return Math.floor(Math.random() * high);
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function daydiff(first, second) {
  return Math.round((second-first)/(1000*60*60*24));
}

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
