// SPAM and HAM emails from: https://www.kaggle.com/wanderfj/enron-spam?select=enron3
// ALSO, SOME OF THE SPAM EMAILS ARE FROM: http://untroubled.org/spam/  's 2001 spam set
//  hamWordCount:  49,813 tokens
// spamWordCount: 117,201 tokens

import * as fs from 'fs';
import path from 'path';

// const __dirname = path.resolve();

export const separators = /[\s._,:\+\#=;'"~?!@<>\(\)\[\]\{\}\*\/\\]+|[]+/;


// Given a path to a folder and a fileOut name,
// the function iterates over every file in the folder, tokenizing
// the text of the file on separators. The
// tokens are then entered into a map, which is converted
// to a string using the 'stringifyMap()' function and finally
// written to an output file
export function createWordCountFile(path, files, fileOut) {
  let tMap = new Map();                               
  for (let i = 0; i < files.length; i++) {          
    let filename = path + files[i];     
    try {
      const tokens = tokenizeFile(filename);
      for (let i = 0; i < tokens.length; i++) {
        let t = tokens[i];
        if (!isNaN(t) || t.startsWith('-')) continue;
        if (tMap.has(t)) {
          let prevCount = tMap.get(t);
          tMap.set(t, prevCount + 1);
        } else {
          tMap.set(t, 1);
        }
      }
    } catch (err) {
      console.error(err);
      process.exit();
    }
    if (i === files.length - 1) {
      console.log(`Map being converted to ${fileOut} is of size: ${tMap.size}`);
      fs.writeFileSync(fileOut, stringifyMap(tMap));
    }
  }
}

// turns a map into a string to be written to a file
export function stringifyMap(map) {
  let str = '';
  for (let [key, val] of map) {
    str += key + ': ' + val + '\n';
  }
  return str;
} 

// takes a filename and returns an array of tokens
export function tokenizeFile(filename) {
  return fs.readFileSync(filename, { encoding: "utf8", flag: "r" }).split(separators);
}