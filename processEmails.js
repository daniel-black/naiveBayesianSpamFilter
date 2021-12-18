// SPAM and HAM emails from: https://www.kaggle.com/wanderfj/enron-spam?select=enron3
// ALSO, SOME OF THE SPAM EMAILS ARE FROM: http://untroubled.org/spam/  's 2001 spam set
//  hamWordCount:  49,813 tokens
// spamWordCount: 117,201 tokens
const fs = require('fs');
const path = require('path');

const hamPath = __dirname + '/Ham';
const spamPath = __dirname + '/Spam';

const sep1 = /[\s._,:\+\#=;'"~?!@<>\(\)\[\]\{\}\*\/\\]+|[�]+/;

writeWordCountToFile(spamPath, sep1, 'swcAllSep1.txt');

// Given a path to a folder, a regex, and a fileOut name,
// the function iterates over every file in the folder, tokenizing
// the text of the file on separators provided by the regex. The
// tokens are then entered into a map, which is converted
// to a string using the 'stringifyMap()' function and finally
// written to an output file
function writeWordCountToFile(dirPath, regex, fileOut) {
  let tMap = new Map();
  const files = fs.readdirSync(dirPath); 
  for (let i = 0; i < files.length; i++) {
    let file = path.join(dirPath, files[i]);
    try {
      const text = fs.readFileSync(file, { encoding: "utf8", flag: "r" });
      const tokens = text.split(regex);
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
    }
    if (i === files.length - 1) {
      console.log(`Map being converted to ${fileOut} is of size: ${tMap.size}`);
      fs.writeFileSync(fileOut, stringifyMap(tMap));
    }
  }
}

// turns a map into a string to be written to a file
function stringifyMap(map) {
  let str = '';
  for (let [key, val] of map) {
    str += key + ': ' + val + '\n';
  }
  return str;
} 

module.exports = { stringifyMap, sep1 };