/*
Main Features:

(*) Question Display - Self-Writing Effect
(*) Move To The Next Question
(*) Submit Answers
(*) Handle Keystrokes For Special Effects

*/

let hasUserSubmitted = false;
let letterIndex = 0;
// current quesion index in "questions" array
let questionsIndex = 0;
const validAnswers = ['A', 'B', 'C'];

// answers will be added later in the following format: {questionNumber: answerInUpperCase}
let recievedAnswers = {}

// isWritingNow & finishWritingEffect, are used in order to stop the writing effect if the user types to screen 
let finishWritingEffect = false;
let isWritingNow = false;

const textWritingDelay = 20 // in milliseconds
const outputBoxElement = document.getElementById("system-output-p-id");
const questionAndAnswersIds = [
  "question-paragraph-id", // questionElementId
  "answer-a-id", // firstAnswerElementId
  "answer-b-id", // secondAnswerElementId
  "answer-c-id" // thirdAnswerElementId
]
const sentencesPrefix = ["", 'A) ', 'B) ', 'C) ']

//writeQueue = questions[0]
let answers = {};


function organizeQuestionsList(questionsRaw) {
  /*
  :Array questionsRaw: a list of questions in the following format: 
  [q1, q2, ...] ====> q1 = [questionText, firstAnswerText, secondAnswerText, thirdAnswerText]

  Return -
  Array organizedQuestions: a new, formatted (add prefixes to the strings) and organized list, for future insertion to HTML document 
  format:
  
  [q1, q2, ...] ====> q1 = [
                              [questionText (formatted),     questionElementId      ],
                              [firstAnswerText (formatted),  firstAnswerElementId   ],
                              [secondAnswerText (formatted), secondAnswerElementId  ],
                              [thirdAnswerText (formatted),  thirdAnswerElementId   ]
                           ]
  (Arrays Nested Twice)
  */
  let organizedQuestions = [];
  let tempQuestionConfig = [];
  questionsRaw.forEach((questionArray) => {
    for (let i = 0; i < questionArray.length; i++) {
      tempQuestionConfig.push([sentencesPrefix[i] + questionArray[i], questionAndAnswersIds[i]]);
      }
    organizedQuestions.push(tempQuestionConfig);
    tempQuestionConfig = [];
  })
  return organizedQuestions;
}


function _typeWriter(writeQueue) {
  /* 
    Create the self-writing effect & Used by "runSyncedWriters" function

    Start writing the first element in the array to HTML (by using recursion).
    Once finised, pops the already-written text from the writeQueue and calls itself runSyncedWriters again, in order to move to the next chunk.
  */
  let [txt, elementId] = writeQueue[0];
  isWritingNow = true;

  // This "if" statement is relevant only if, from some reason, we need to stop the effect and simple write the text (e.g someone pressed a button)
  if (finishWritingEffect) {
    writeQueue.forEach((writingChunk) => { 
      // writingChunk -> [questionText, questionElementId]
      document.getElementById(writingChunk[1]).innerHTML = writingChunk[0];
    });
    letterIndex = 0;
    finishWritingEffect = false;
    isWritingNow = false;
    return;
  }

  //  The writing effect - write a letter of the current chunk to the HTML file, and moves to the next letter using recursion
  if (letterIndex < txt.length) {
    document.getElementById(elementId).innerHTML += txt.charAt(letterIndex);
    letterIndex++;
    setTimeout(_typeWriter.bind(null, writeQueue), textWritingDelay);
  } else {
    // finished writing current chunk. deleting finished chunk from queue & moving to next chunk (by calling runSyncedWriters)
    letterIndex = 0;
    writeQueue.shift();
    runSyncedWriters(writeQueue);
  }
}


function runSyncedWriters(writeQueue) {
  /*
    This is a bit more complex part.

    :Array writeQueue: an array of arrays, to be printed to screen by order.
        Format:   [
                    [text, elementIdToWriteTheTextTo],  -->
                    [text, elementIdToWriteTheTextTo], ...
                  ]

        Example:  [
                    ["Q: I am the question", "QuestionElementID"],
                    ["A) I am the first answer", "Answer-A-ElementID"],
                    ["B) I am the second answer", "Answer-B-ElementID"], 
                    ["C) I am the third answer", "Answer-C-ElementID"]
                  ]

    The program recieves the array above (usually a question and its answers), and writes it to the questions HTML document by the array's order (in a neat self-writing effect)
  */

  // deep clone, so writeQueue won't be damaged (not sure if needed, decided to put it here anyways)
  let clonedWriteQueue = JSON.parse(JSON.stringify(writeQueue));

  // start writing the first array's element to HTML, using _typeWriter function (which writes to the HTML doc & pops the text from the writeQueue once finished)
  if (clonedWriteQueue.length > 0){
    _typeWriter(clonedWriteQueue);
  } else {
    // see explanation above the variable's init
    isWritingNow = false;
  }
}


function handleKeystrokes(keyboardEvent) {
  /*
    Handling the keystokes (submit; stop writing effect; handling special keys etc...)
  */

  // if writing effect didn't finish, don't write anything in user's console & finish the effect
  if (isWritingNow) {
    finishWritingEffect = true; // someone clicked something, finish the writing effect
    keyboardEvent.preventDefault();
    return;
  }

  // Empty output box every time someone presses a button
  outputBoxElement.innerHTML = "";

  let inputElement = document.querySelector("input");
  // handle answer submit (after user presses the ENTER button)
  if (inputElement === document.activeElement && keyboardEvent.code === 'Enter')
  {
    handleSubmit(keyboardEvent, inputElement);

  } else if (inputElement === document.activeElement && keyboardEvent.code === 'Escape') { 
    // unfocus on Escape
    inputElement.blur();


  /* Special Buttons */
  } else if (keyboardEvent.code === 'F4') {
    alert('Under Construction. \nCome Back In The Next Course :)')

  } else if (keyboardEvent.code === 'F8') {
    alert('Under Construction. \nCome Back In The Next Course :)')

  } else if (keyboardEvent.code === 'F9') {
    alert('Under Construction. \nCome Back In The Next Course :)')

  } else if (keyboardEvent.code === 'F10') {
    alert('Under Construction. \nCome Back In The Next Course :)')



  } else if (inputElement !== document.activeElement) {
    // focus on input if user presses a key
    inputElement.focus();
  }
}


function handleSubmit(keyboardEvent, inputElement) {
  /*
    Handle Submit.
  */
  // don't refresh page on submit
  keyboardEvent.preventDefault();
  // get answer
  let answer = inputElement.value.toUpperCase();
  // init input box after sumbit
  inputElement.value = "";

  // check if the answer is valid, if so, continue to the next question (or finish if it is the last question)
  if (validAnswers.some((validAnswer) => answer === validAnswer)) {
    // FEATURE TO ADD: save to answer to a cookie
    // save answer to dict
    recievedAnswers[questionsIndex + 1] = answer;

    // if it is the last question, submit
    if (questionsIndex === questions.length - 1) {
      hasUserSubmitted = true;
      // recievedAnswers example: {1: 'A', 2: 'B', 3: 'A'}
      postData(`/submit/${username}`, recievedAnswers);

      } else {
        // clear question & answers content and move to next question
        questionElementIdsArray = questions[questionsIndex].map((questionAttribute) => questionAttribute[1]);
        removeTextFromElements(questionElementIdsArray);
        questionsIndex += 1;

        // Change question number in the header
        const questionHeaderElement = document.getElementById("question-header-id");
        questionHeaderElement.innerHTML = questionHeaderElement.innerHTML.slice(0, -1) + (questionsIndex + 1);

        // change finishWriting effect back to false, so we can start self-writing again
        finishWritingEffect = false;

        // Start writing the next question, but wait a bit and let the self-writing effect finish its current itteration :-)
        setTimeout(runSyncedWriters.bind(null, questions[questionsIndex], questionsIndex), 50);
        outputBoxElement.innerHTML = 'Answer Recieved.';

    }
  } else { 
    // user entered an invalid answer
    handleInvalidSubmits(answer);
  }
}


function handleInvalidSubmits(recievedAnswer) {
  /*
    Write different outputs for invalid inputs
  */
  const invalidInputAnswers = [
                                        "אחשלי היקר, תגיב לפי הפורמט בבקשה",
                                        "Invalid Answer. Please Try Again",
                                        `Roses are red,
                                        Violets are blue,
                                        Answer by the format,
                                        Or I will kill you  :-)`,
                                        "אין תשובות לא נכונות, יש תשובות שלא נכון להן. נא נסו שוב על פי הפורמט :)"
                                    ];

  if (recievedAnswer.replace(/\s/g, "").indexOf("1=1") >= 0) {
    outputBoxElement.innerHTML = "No SQL Injection, Focus On The Question <3";

  } else {
    // choose random answer out of the bank
    outputBoxElement.innerHTML = invalidInputAnswers[Math.floor(Math.random() * invalidInputAnswers.length)];
  }
}


function removeTextFromElements(elementsIdsArray) {
    elementsIdsArray.forEach((element) => document.getElementById(element).innerHTML = "");
}


function postData(url, data) {
  /*
    Submit "data" to "the "url" as a POST request
    :obj data: the data to be sent to the server
  */
  // data will be an object
  const response = fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    headers: {
      'Content-Type': 'application/json'
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *client
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  }).then(response => {
        // HTTP 301 response
        // HOW CAN I FOLLOW THE HTTP REDIRECT RESPONSE?
        if (response.redirected) {
          window.location.href = response.url;
        } else {
          throw "Wasn't redirected by server-side"; 
        }
  });
}


//////////////////////////////////////////////////////////// MAIN ////////////////////////////////////////////////////////////////////////

// Alert the user if he/she is trying to refresh the page
window.onbeforeunload = function() {
  if (!hasUserSubmitted) {
    return "";
  }
};

// all questions & answers <-> relevent element IDs
const questions = organizeQuestionsList(questionsRaw);

// display the first question & answers, with a sweet typing effect
runSyncedWriters(questions[questionsIndex], questionsIndex);

// Handle user keystrokes & move to next questions if user submited an answer
document.addEventListener('keydown', handleKeystrokes);

