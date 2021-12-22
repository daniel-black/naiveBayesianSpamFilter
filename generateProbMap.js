import { stringifyMap } from './processEmails.js';
import * as fs from 'fs';

// like buildProbFromWcFiles but with the spam and ham maps prebuilt
function buildProbMap(spamMap, hamMap, fileOut, minShared=5, lowProb=0.01, highProb=0.99) {
  let probMap = new Map();
  for (let [key, val] of spamMap) {
    if (hamMap.has(key)) {
      if (hamMap.get(key) + val < minShared) continue;
      probMap.set(key, val / (val + 2*hamMap.get(key)) );
    } else {
      probMap.set(key, highProb);   // word is only in spam and not ham
    }
  }
  for (let [key, val] of hamMap) {
    if (spamMap.has(key)) {
      if (spamMap.get(key) + val < minShared) continue;
      probMap.set(key, spamMap.get(key) / (spamMap.get(key) + 2*val) );
    } else {
      probMap.set(key, lowProb);
    }
  }
  // analyzeMap(probMap);
  // console.log(`writing probMap to ${fileOut} --- probMap size: ${probMap.size}`);
  fs.writeFileSync(fileOut, stringifyMap(probMap));
}

// Builds spam and ham maps from wordCount files. Uses those maps and parameters
// minShared, lowProb, and highProb to create a customizable probability map. 
// The probability map is then saved to a file named fileOut, to be used in 
// filtering/testing
export function buildProbMapFromWcFiles(swc, hwc, fileOut, minShared, lowProb, highProb) {
  const spamMap = buildMapFromFile(swc);   // something probably wrong with buildMapFromFile
  const hamMap = buildMapFromFile(hwc);
  buildProbMap(spamMap, hamMap, fileOut, minShared, lowProb, highProb);
}

// prints 30 most spammy tokens and 30 least spammy tokens
function analyzeMap(map) {
  let arr = Array.from(map);
  arr.sort((a, b) => a[1] - b[1]);
  // console.log(arr);
  // console.log('^^ map as sorted array');
  // print top 30 spammiest words:
  console.log('30 most spammy:');
  for (let i = 0; i < 30; i++) {
    console.log(arr[arr.length - 1 -i]);
  }

  // print bottom 30 spammiest words:
  console.log('30 least spammy:');
  for (let i = 0; i < 30; i++) {
    console.log(arr[i]);
  }
}

export function buildMapFromFile(filename) {
  let map = new Map();
  let data = fs.readFileSync(filename, {encoding: 'utf8', flag: 'r'}).split('\n');
  for (let i = 0; i < data.length; i++) {
    let [token, count] = data[i].split(': ');
    map.set(token, +count);
  }
  return map;
}