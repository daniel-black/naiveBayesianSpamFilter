const fs = require('fs');
const processEmails = require('./processEmails');

const separators = /[\s._,:\+\#=;'"~?!@<>\(\)\[\]\{\}\*\/\\]+/;

const spamMap = new Map();
const hamMap = new Map();
const probMap = new Map();

let swc = fs.readFileSync('spamWordCount.txt', 'utf8').split('\n');
let hwc = fs.readFileSync('hamWordCount.txt', 'utf8').split('\n');

// Build the spamMap (size: 117,201)
for (let i = 0; i < swc.length; i++) {
  let [key, val] = swc[i].split(': ');
  spamMap.set(key, +val);
}
console.log(`spamMap size: ${spamMap.size}`);

// Build the hamMap (size: 49,813)
for (let i = 0; i < hwc.length; i++) {
  let [key, val] = hwc[i].split(': ');
  hamMap.set(key, +val);
}
console.log(`hamMap size: ${hamMap.size}`);

// Build probMap (size: 139,827)
for (let [key, val] of spamMap) {
  if (hamMap.has(key)) {
    if (hamMap.get(key) + val < 5) continue;
    probMap.set(key, val / (val + 2*hamMap.get(key)) );
  } else {
    probMap.set(key, 0.99);   // case where word is only in spam and not ham
  }
}
for (let [key, val] of hamMap) {
  if (spamMap.has(key)) {
    if (spamMap.get(key) + val < 5) continue;
    probMap.set(key, spamMap.get(key) / (spamMap.get(key) + 2*val) );
  } else {
    probMap.set(key, 0.01);
  }
}
console.log(`probMap size: ${probMap.size}`);

// const probMapStr = ep.stringifyMap(probMap);
// fs.writeFileSync('probMap.txt', probMapSt