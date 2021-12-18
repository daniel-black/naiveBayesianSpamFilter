// SPAM and HAM emails from: https://www.kaggle.com/wanderfj/enron-spam?select=enron3

//  hamWordCount:  49,813 tokens
// spamWordCount: 117,201 tokens

const fs = require('fs');
const path = require('path');

const dirPath =  __dirname + '/Ham';     // change to '/Spam' when you want to generate the 
const files = fs.readdirSync(dirPath);   // hamWordCount.txt file

let tMap = new Map();
const separators = /[\s._,:\+\#=;'"~?!@<>\(\)\[\]\{\}\*\/\\]+|[�]+/;

for (let i = 0; i < files.length; i++) {
  let file = path.join(dirPath, files[i]);

  try {
    const text = fs.readFileSync(file, { encoding: "utf8", flag: "r" });
    const tokens = text.split(separators);
    
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
    let str = stringifyMap(tMap);
    // console.log(str);
    fs.writeFileSync('hamWordCount.txt', str);
  }
}


function stringifyMap(map) {
  let str = '';
  for (let [key, val] of map) {
    str += key + ': ' + val + '\n';
  }
  return str;
} 

module.exports = { stringifyMap, separators };