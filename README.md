# Nodejs Implementation of a naive Bayesian spam filter

This project closely follows the steps laid out by Paul Graham in his essay [A Plan For Spam](http://www.paulgraham.com/spam.html). The result is a naive Bayesian spam
filter trained on a mix of emails from the [Enron Emails](https://www.kaggle.com/wanderfj/enron-spam?select=enron3) data set and the 2001 emails from 
[Untroubled.org]http://untroubled.org/spam/).

I'll briefly describe the four modules and how to build and test the filter yourself.

### ProcessEmails.js
This module contains a function that can tally up how many times a token appears in a directory of text files. This is useful for recording how often a word appears in 
spam emails and legitimate emails.

### GenerateProbMap.js
This module contains functions that can read in spam and ham email word count files and produce a file that maps a token to the probability that it occurs in a spam email.

### testingUtilities.js
This module contains functions used to test the classification accuracy of the filter. The text of an email is broken up into tokens, and then checked against the previously
produced probability map to see how likely it is that an email containing such a token is spam. Tokens are scored by how far away from 0.5 their spam probabilities are. This means
that the highest scoring words are either super spammy (words like "viagra" or "FREE!!!") or super innocuous ("sure", "okay", etc). The combined probability of the tokens with
the 15 highest scores is then computed and checked against a threshold to determine if an email is spam or not.

### tests.js
This module pulls all the previous ones together and provides a function named `automatedTests()` that builds and tests filters with varying training and testing splits.
The splits start at (10% training, 90% testing) and increment by ten percentage points up all the way up to (90% training, 10% testing). The results of each test segment
(classification accuracy, false positive rate, and false negative rate) are logged to the console.
