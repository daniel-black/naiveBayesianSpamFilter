const fs = require('fs');
const ep = require('./processEmails');

const hamFiles = fs.readdirSync('./Ham');
// const spamFiles = fs.readdirSync('./Spam');

const probMap = new Map();
const readOptions = { encoding: 'utf8', flag: 'r' };
const superSep = /[\s._,:\+\#=;'"~?!@<>\(\)\[\]\{\}\*\/\\]+|[�]+|[\-]+/;

let data = fs.readFileSync('./probMap.txt', readOptions).split('\n');
for (let i = 0; i < data.length; i++) {
  let [key, val] = data[i].split(': ');
  probMap.set(key, +val);
}

// give judge an array of tokens from the email in question
function judge(tokenArray) {
  // find 15 most interesting tokens in the tokenArray
  let interesting = [];   // highest score at index 0
  for (let token of tokenArray) {  
    let p = probMap.has(token) ? probMap.get(token) : 0.4;
    let s = Math.abs(p - 0.5);
    interesting.push({t: token, s: s, p: p});
  }
  // SET STUFF DOESNT WORK BECAUSE ITS AN ARRAY OF OBJECTS
  interesting = new Set(interesting);       // remove duplicates
  interesting = Array.from(interesting);    // back into an array to sort
  console.log('should have no duplicates:\n', interesting);

  interesting.sort((a, b) => b.s - a.s).slice(0, 15);
  // console.log(interesting);
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

let hamTokens = fs.readFileSync('./Ham/' + hamFiles[356], readOptions).split(ep.separators);

let res = judge(hamTokens);
// console.log(res);


// need to capture the 15 most interesting tokens. Dont want duplicate tokens so maybe we can just check for that right off the bat