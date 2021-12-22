import { tokenizeFile } from "./processEmails.js";
import { buildMapFromFile } from "./generateProbMap.js";

const threshold = 0.65;

// give judge() an filename and probability map
function judge(filename, probMap) {
  const tokenArray = tokenizeFile(filename);
  let interesting = [];  
  for (let token of tokenArray) {  
    let prob = probMap.has(token) ? probMap.get(token) : 0.4;
    let score = Math.abs(prob - 0.5);
    if (!isNaN(token) || token.startsWith('-')) continue;
    interesting.push({ t:token, s: score, p: prob });
  }
  interesting = interesting.sort((a, b) => b.s - a.s).slice(0, 15);
  return calcProbOfSpam(interesting); 
}

const calcProbOfSpam = (arr) => {
  let prodTerm = 1;
  let otherTerm = 1;
  for (let i = 0; i < arr.length; i++) {
    prodTerm *= arr[i].p;
    otherTerm *= (1 - arr[i].p);
  }
  return prodTerm / (prodTerm + otherTerm);
}

export function runTests(probMapFile, testSpamFiles, testHamFiles) {
  const probMap = buildMapFromFile(probMapFile);
  const resultsOnSpam = testSpamEmails(testSpamFiles, probMap);
  const resultsOnHam = testHamEmails(testHamFiles, probMap);

  const compositeResults = {
    size: resultsOnHam.size + resultsOnSpam.size,
    numCorrect: resultsOnHam.numCorrect + resultsOnSpam.numCorrect,
    numIncorrect: resultsOnHam.numIncorrect + resultsOnSpam.numIncorrect,
    falsePositives: resultsOnHam.numIncorrect,
    falseNegatives: resultsOnSpam.numIncorrect
  };

  reportCompositeResults(compositeResults);
  return compositeResults;
}

// Provide test files and a probability map
function testSpamEmails(testSpamFiles, probMap) {
  let size = testSpamFiles.length;
  let classified = [];
  let misclassified = [];

  for (let i = 0; i < size; i++) {
    let spamScore = judge('./Spam/' + testSpamFiles[i], probMap);
    let isSpam = spamScore > threshold ? true : false;
    if (!isSpam) {
      misclassified.push(spamScore);
    } else {
      classified.push(spamScore);
    }
  }
  // reportResults('spam', classified, misclassified, size);
  const summary = {
    size: size,
    numCorrect: classified.length,
    numIncorrect: misclassified.length,
  };
  return summary;
}

// Provide test files and a probability map
function testHamEmails(testHamFiles, probMap) {
  let size = testHamFiles.length;
  let classified = [];
  let misclassified = [];

  for (let i = 0; i < size; i++) {
    let spamScore = judge('./Ham/' + testHamFiles[i], probMap);
    let isSpam = spamScore > threshold ? true : false;
    if (isSpam) {
      misclassified.push(spamScore);
    } else {
      classified.push(spamScore);
    }
  }
  //reportResults('ham', classified, misclassified, size);
  const summary = {
    size: size,
    numCorrect: classified.length,
    numIncorrect: misclassified.length,
  };
  return summary;
}

function reportResults(testType, classified, misclassified, size) {
  const accuracy = classified.length / size;
  const missRate = misclassified.length / size;
  const errorType = testType === 'ham' ? 'false positive' : 'false negative';

  console.log(`\n---------- Results for ${testType} test ---------------------`);
  console.log(`|  classification accuracy: ${accuracy.toFixed(5)}  (${classified.length} / ${size})`);
  console.log(`|      ${errorType} rate: ${missRate.toFixed(5)}  (${misclassified.length} / ${size})`);
  console.log(`|_____________________________________________________`);
}

function reportCompositeResults(c) {
  const accuracy = c.numCorrect / c.size;
  const fpRate = c.falsePositives / c.size;
  const fnRate = c.falseNegatives / c.size;

  console.log(`\n---------- Composite Results ------------------------`);
  console.log(`|  classification accuracy: ${accuracy.toFixed(5)}  (${c.numCorrect} / ${c.size})`);
  console.log(`|      false positive rate: ${fpRate.toFixed(5)}  (${c.falsePositives} / ${c.size})`);
  console.log(`|      false negative rate: ${fnRate.toFixed(5)}  (${c.falseNegatives} / ${c.size})`);
  console.log(`|_____________________________________________________`);
}


function getAverageSpamScore(scores) {
  let sum = 0;
  for (let i = 0; i < scores.length; i++) {
    sum += scores[i];
  }
  return sum / scores.length;
}