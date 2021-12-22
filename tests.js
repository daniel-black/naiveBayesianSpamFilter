import { createWordCountFile } from './processEmails.js';
import { buildProbMapFromWcFiles } from './generateProbMap.js';
import { runTests } from './testingUtilities.js';
import arrayShuffle from 'array-shuffle';
import * as fs from 'fs';
import path from 'path';

const __dirname = path.resolve();

// results do not improve past probLow = 0.000001
//                        and probHigh = 0.999999

const probLow = 0.000001;
const probHigh = 0.999999
const minShared = 5;

// Start with the the Ham and Spam directories
const hamPath = __dirname + '/Ham/';
const spamPath = __dirname + '/Spam/';

// All the files in Ham and Spam files as arrays
const hamFiles = fs.readdirSync(hamPath);
const spamFiles = fs.readdirSync(spamPath);

function automatedTests() {
  for (let i = 10; i < 100; i += 10) {
    // i denotes the percentage of files in the corpus to be used as the training set
    // (100 - i) is the percentage of files to be used as the testing set;
    const splitIndexHam = Math.floor((i / 100) * hamFiles.length-1);
    const splitIndexSpam = Math.floor((i / 100) * spamFiles.length-1);
  
    // shuffle the order of the files each time through the loop
    const shuffledHam = arrayShuffle(hamFiles);
    const shuffledSpam = arrayShuffle(spamFiles);
  
    // split the shuffled array into training and testing arrays of files
    const trainHam = shuffledHam.slice(0, splitIndexHam);
    const testHam = shuffledHam.slice(splitIndexHam);
  
    // this split is done for both ham and spam
    const trainSpam = shuffledSpam.slice(0, splitIndexSpam);
    const testSpam = shuffledSpam.slice(splitIndexSpam);
  
    // Create a word (token) count file for each directory
    const hwcFileName = './testWordCounts/hwc' + i + '.txt';
    const swcFileName = './testWordCounts/swc' + i + '.txt';
  
    // create word count files based on the training files
    createWordCountFile(hamPath, trainHam, hwcFileName);
    createWordCountFile(spamPath, trainSpam, swcFileName);
  
    // build the probability map with the word count files we just generated
    const pmFileName = './testProbMaps/pm' + i + '.txt';
    buildProbMapFromWcFiles(swcFileName, hwcFileName, pmFileName, minShared, probLow, probHigh);
  
    // now test the filter 
    console.log(`\n------ Training on ${i}%, Testing on ${100-i}% ------`);
    runTests(pmFileName, testSpam, testHam);
  }
}

automatedTests();