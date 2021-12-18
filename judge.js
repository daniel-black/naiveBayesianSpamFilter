const fs = require('fs');
const pe = require('./processEmails');

const hamFiles = fs.readdirSync('./Ham');
const spamFiles = fs.readdirSync('./Spam');

let threshold = 0.65;
let falsePositives = 0;
let falseNegatives = 0;


// give judge() an array of tokens from the email in question
function judge(tokenArray) {
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

// testing on spam emails
function testSpamEmails() {
  let total = spamFiles.length;
  let right = [];
  let wrong = [];

  for (let i = 0; i < spamFiles.length; i++) {
    let tokens = fs.readFileSync('./Spam/' + spamFiles[i], { encoding: 'utf8', flag: 'r' }).split(pe.separators);
    let spamScore = judge(tokens);
    let isSpam = spamScore > threshold ? true : false;
    if (!isSpam) {
      falseNegatives++;
      wrong.push(spamScore);
    } else {
      right.push(spamScore);
    }
    // console.log(`spam: ${isSpam}\tscore: ${spamScore}`);
  }
  console.log(`${falseNegatives} incorrectly classifed emails out of ${total}.`);
  console.log(`Correctly classified at a rate of: ${1.0 - (falseNegatives / total)}`);
  quantifyCorrectlyClassifiedSpam(right);
  quantifyWronglyClassifiedSpam(wrong);
  // lowest spamScore for correctly classified spam: 0.4523
  // average spamScore for correctly classified spam: 0.9909
  // highest spamScore for wrongly classified spam: 0.44783
  // averge spamScore for wrongly classified spam: 0.06108

}

// testing on real emails
function testHamEmails() {
  let total = hamFiles.length;
  let right = [];
  let wrong = [];

  for (let i = 0; i < hamFiles.length; i++) {
    let tokens = fs.readFileSync('./Ham/' + hamFiles[i], { encoding: 'utf8', flag: 'r' }).split(pe.separators);
    let spamScore = judge(tokens);
    let isSpam = spamScore > threshold ? true : false;
    if (isSpam) {
      falsePositives++;
      wrong.push(spamScore);
    } else {
      right.push(spamScore);
    }
    // console.log(`spam: ${isSpam}\tscore: ${spamScore}`);
  }
  console.log(`${falsePositives} incorrectly classifed emails out of ${total} legit emails.`);
  console.log(`Correctly classified at a rate of: ${1.0 - (falsePositives / total)}`);
  // quantifyCorrectlyClassifiedSpam(right);
  // quantifyWronglyClassifiedSpam(wrong);
  // lowest spamScore for correctly classified spam: 0.4523
  // average spamScore for correctly classified spam: 0.9909
  // highest spamScore for wrongly classified spam: 0.44783
  // averge spamScore for wrongly classified spam: 0.06108
}

function quantifyCorrectlyClassifiedSpam(right) {
  let avgRight = 0;
  right.sort((a, b) => b - a);
  for (let i = 0; i < right.length; i++) {
    avgRight += right[i];
    console.log(right[i]);
  }
  avgRight = avgRight / right.length;
  console.log('Average spamScore of spam correctly classified as spam: ', avgRight);
  console.log('Lowest spamScore of spam correctly classified as spam: ', right[right.length-1]);
}

function quantifyCorrectlyClassifiedHam(right) {
  let avgRight = 0;
  right.sort((a, b) => b - a);
  for (let i = 0; i < right.length; i++) {
    avgRight += right[i];
    console.log(right[i]);
  }
  avgRight = avgRight / right.length;
  console.log('Average spamScore of ham correctly classified as ham: ', avgRight);
  console.log('Lowest spamScore of ham correctly classified as ham: ', right[right.length-1]);
}

function quantifyWronglyClassifiedSpam(wrong) {
  let avgWrong = 0;
  wrong.sort((a, b) => a - b);
  for (let i = 0; i < wrong.length; i++) {
    avgWrong += wrong[i];
    console.log(wrong[i]);
  }
  avgWrong = avgWrong / wrong.length;
  console.log('Average spamScore of spam incorrectly classifed as ham: ', avgWrong);
  console.log('Highest spamScore of spam incorrectly classifed as ham: ', wrong[wrong.length-1]);
}

function quantifyWronglyClassifiedHam(wrong) {
  let avgWrong = 0;
  wrong.sort((a, b) => a - b);
  for (let i = 0; i < wrong.length; i++) {
    avgWrong += wrong[i];
    console.log(wrong[i]);
  }
  avgWrong = avgWrong / wrong.length;
  console.log('Average spamScore of ham incorrectly classifed as spam: ', avgWrong);
  console.log('Highest spamScore of ham incorrectly classifed as spam: ', wrong[wrong.length-1]);
}

function buildMapfromFile(filename) {
  let map = new Map();
  let data = fs.readFileSync(filename, { encoding: 'utf8', flag: 'r' }).split('\n');
  for (let i = 0; i < data.length; i++) {
    let [key, val] = data[i].split(': ');
    map.set(key, +val);
  }
  return map;
}

module.exports = { buildMapfromFile };