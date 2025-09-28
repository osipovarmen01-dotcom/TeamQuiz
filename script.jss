const questions = [
  {
    question: "What is the capital of France?",
    answers: [
      { text: "Berlin", correct: false },
      { text: "Madrid", correct: false },
      { text: "Paris", correct: true },
      { text: "Rome", correct: false }
    ]
  },
  {
    question: "2 + 2 = ?",
    answers: [
      { text: "3", correct: false },
      { text: "4", correct: true },
      { text: "5", correct: false },
      { text: "22", correct: false }
    ]
  }
];

const questionElement = document.getElementById("question");
const answersContainer = document.getElementById("answers");
const nextButton = document.getElementById("next-btn");
const resultContainer = document.getElementById("result");

let currentQuestionIndex = 0;
let score = 0;

function startQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  nextButton.innerText = "Next";
  resultContainer.classList.add("hidden");
  showQuestion();
}

function showQuestion() {
  resetState();
  const currentQuestion = questions[currentQuestionIndex];
  questionElement.innerText = currentQuestion.question;

  currentQuestion.answers.forEach(answer => {
    const button = document.createElement("button");
    button.innerText = answer.text;
    button.classList.add("answer-btn");
    button.addEventListener("click", () => selectAnswer(button, answer.correct));
    answersContainer.appendChild(button);
  });
}

function resetState() {
  nextButton.style.display = "none";
  answersContainer.innerHTML = "";
}

function selectAnswer(button, correct) {
  if (correct) {
    button.classList.add("correct");
    score++;
  } else {
    button.classList.add("wrong");
  }

  // disable all buttons after answer
  Array.from(answersContainer.children).forEach(btn => {
    btn.disabled = true;
    if (btn.innerText === questions[currentQuestionIndex].answers.find(a => a.correct).text) {
      btn.classList.add("correct");
    }
  });

  nextButton.style.display = "block";
}

nextButton.addEventListener("click", () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showResult();
  }
});

function showResult() {
  resetState();
  questionElement.innerText = "";
  resultContainer.innerText = `You scored ${score} out of ${questions.length}!`;
  resultContainer.classList.remove("hidden");
  nextButton.innerText = "Play Again";
  nextButton.style.display = "block";
  nextButton.onclick = startQuiz;
}

startQuiz();
