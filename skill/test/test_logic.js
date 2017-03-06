"use strict";

// TODO bring in gulp

var assert = require('assert');
// var async = require('async');
var questions = require('./../src/questions.js');
// var skillHelper = require('./skillHelper.js');
var helpers = require('../src/helpers.js');
// var console = require('tracer').colorConsole();

var QUESTIONS_URI = process.env.QUESTIONS_URI || process.argv[2];


(function testPrepQuestionForSSML(){
  // This field is sometimes known as &ldquo;The Dismal Science.&rdquo;?
  // That was correct. . Second question for 2 points. The category is General Knowledge. This field is sometimes known as &ldquo;The Dismal Science.&rdquo;? Is it a) Politics, b) Economics, c) Philosophy, or d) Physics
  assert(helpers.prepQuestionForSSML(
    "That was correct. . Second question for 2 points. The category is General Knowledge. This field is sometimes known as &ldquo;The Dismal Science.&rdquo;? Is it a) Politics, b) Economics, c) Philosophy, or d) Physics") ==
    "That was correct. Second question for 2 points. The category is General Knowledge. This field is sometimes known as &quot;The Dismal Science.&quot;? Is it a) Politics, b) Economics, c) Philosophy, or d) Physics", "SSML Fail");
  assert(helpers.prepQuestionForSSML(
    "Hello. First question for 1 point.  The category is Cartoon and Animations. What was the first Disney movie to use CGI?? Is it a) Toy Story, b) The Black Cauldron, c) Tron, or d) Fantasia") ==
    "Hello. First question for 1 point.  The category is Cartoon and Animations. What was the first Disney movie to use CGI? Is it a) Toy Story, b) The Black Cauldron, c) Tron, or d) Fantasia", "SSML Fail");
  assert(helpers.prepQuestionForSSML(
    "That was incorrect. The correct answer was c) Queen.. Second question for 2 points.  The category is General Knowledge. What is the name of the very first video uploaded to YouTube? Is it a) Me at the zoo, b) tribute, c) carrie rides a truck, or d) Her new puppy from great grandpa vern.") ==
    "That was incorrect. The correct answer was c) Queen. Second question for 2 points.  The category is General Knowledge. What is the name of the very first video uploaded to YouTube? Is it a) Me at the zoo, b) tribute, c) carrie rides a truck, or d) Her new puppy from great grandpa vern.", "SSML Fail");
  assert(helpers.prepQuestionForSSML(
    "That was incorrect. The correct answer was c) Queen.. Second question for 2 points.  The category is General Knowledge. What is the name of the very first video uploaded to YouTube? Is it a) Me at the zoo, b) tribute, c) carrie rides a truck, or d) Her new puppy from great grandpa vern.") ==
    "That was incorrect. The correct answer was c) Queen. Second question for 2 points.  The category is General Knowledge. What is the name of the very first video uploaded to YouTube? Is it a) Me at the zoo, b) tribute, c) carrie rides a truck, or d) Her new puppy from great grandpa vern.", "SSML Fail");
  assert(helpers.prepQuestionForSSML(
    "Incorrect!. The correct answer was a) Me at the zoo.. Final question for 3 points.  The category is Video Games. True or False. In the game &quot;Melty Blood Actress Again Current Code&quot;, you can enter Blood Heat mode in Half Moon style.") ==
    "Incorrect! The correct answer was a) Me at the zoo. Final question for 3 points.  The category is Video Games. True or False. In the game &quot;Melty Blood Actress Again Current Code&quot;, you can enter Blood Heat mode in Half Moon style.", "SSML Fail");

})();

(function testPrepCategoryForSSML() {

  assert(helpers.prepCategoryForSSML("General Knowledge") == "General Knowledge", "SSML Fail");
  assert(helpers.prepCategoryForSSML("Entertainment: Books") == "Books", "SSML Fail");
  assert(helpers.prepCategoryForSSML("Entertainment: Musicals & Theatres") == "Musicals and Theatres", "SSML Fail");
  assert(helpers.prepCategoryForSSML("Entertainment: Video Games") == "Video Games", "SSML Fail");
  assert(helpers.prepCategoryForSSML("Science & Nature") == "Science and Nature", "SSML Fail");
  assert(helpers.prepCategoryForSSML("Science: Computers") == "Computers", "SSML Fail");
  assert(helpers.prepCategoryForSSML("Entertainment: Japanese Anime & Manga") == "Japanese Anime and Manga", "SSML Fail");

})();


function getMultiChoiceQuestion(num) {
  // Handle multichoice question
  var uri = QUESTIONS_URI + 'api.php?amount=1&type=multiple'
  questions.getAlexaReadyQuestion(uri, num, function (err, result) {
    // console.log(err, result);
  });
}

function getTrueFalseQuestion(num) {
  // Handle multichoice question
  var uri = QUESTIONS_URI + 'api.php?amount=1&type=boolean'
  questions.getAlexaReadyQuestion(uri, num, function (err, result) {
    console.log(err, result);
  });
}

// getMultiChoiceQuestion(1);
// getMultiChoiceQuestion(2);
// getMultiChoiceQuestion(3);
// getTrueFalseQuestion(1);

(function testScores(){
  // -- bonus scores --
  var scores = [{num:1, correct:true}, {num:2, correct:true}, {num:3, correct:true}]
  var score = questions.getFinalScore(scores);
  assert(score == 9, "score failed: " + score);

  var scores = [{num:1, correct:false}, {num:2, correct:true}, {num:3, correct:true}]
  var score = questions.getFinalScore(scores);
  assert(score == 7, "score failed: " + score);

  var scores = [{num:1, correct:true}, {num:2, correct:true}, {num:3, correct:false}]
  var score = questions.getFinalScore(scores);
  assert(score == 4, "score failed: " + score);

  var scores = [{num:1, correct:true}, {num:2, correct:false}, {num:3, correct:true}]
  var score = questions.getFinalScore(scores);
  assert(score == 4, "score failed: " + score);

  // -- default scores --
  var scores = [{num:1, correct:false}, {num:2, correct:false}, {num:3, correct:true}]
  var score = questions.getFinalScore(scores);
  assert(score == 3, "score failed: " + score);

  var scores = [{num:1, correct:false}, {num:2, correct:true}, {num:3, correct:false}]
  var score = questions.getFinalScore(scores);
  assert(score == 2, "score failed: " + score);

  var scores = [{num:1, correct:true}, {num:2, correct:false}, {num:3, correct:false}]
  var score = questions.getFinalScore(scores);
  assert(score == 1, "score failed: " + score);

  var scores = [{num:1, correct:false}, {num:2, correct:false}, {num:3, correct:false}]
  var score = questions.getFinalScore(scores);
  assert(score == 0, "score failed: " + score);

})();



function assert(condition, message) {
    if (!condition) {
        message = message || "Assertion failed";
        if (typeof Error !== "undefined") {
            throw new Error(message);
        }
        throw message; // Fallback
    }
}
