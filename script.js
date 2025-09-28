// List of names to use for the quiz with their corresponding images
const nameList = [
  { name: "Janne", image: "images/janne.jpg" },
  { name: "James", image: "images/james.jpg" },
  { name: "Alexandru", image: "images/alexandru.jpg" },
  { name: "Adam", image: "images/adam.jpg" },
  { name: "Jacob", image: "images/jacob.jpg" },
  { name: "Ann", image: "images/ann.jpg" },
  { name: "Saurabh", image: "images/saurabh.jpg" },
  { name: "Bedriye", image: "images/bedriye.jpg" },
  { name: "Vitalii", image: "images/vitalii.jpg" },
  { name: "Peter", image: "images/peter.jpg" },
  { name: "Mahdi", image: "images/mahdi.jpg" },
  { name: "Zak", image: "images/zak.jpg" }
];

// Function to generate 4 random answers from the name list
function generateRandomAnswers(correctName) {
  const availableNames = nameList.filter(person => person.name !== correctName);
  const shuffled = availableNames.sort(() => 0.5 - Math.random());
  const wrongAnswers = shuffled.slice(0, 3);
  
  const correctPerson = nameList.find(person => person.name === correctName);
  
  const answers = [
    { text: correctName, image: correctPerson.image, correct: true },
    ...wrongAnswers.map(person => ({ text: person.name, image: person.image, correct: false }))
  ];
  
  // Shuffle the answers so correct answer isn't always first
  return answers.sort(() => 0.5 - Math.random());
}

const questions = [
  {
    fact: "", // Empty fact - to be filled later
    answers: generateRandomAnswers("Janne")
  },
  {
    fact: "", // Empty fact - to be filled later
    answers: generateRandomAnswers("James")
  },
  {
    fact: "", // Empty fact - to be filled later
    answers: generateRandomAnswers("Alexandru")
  },
  {
    fact: "", // Empty fact - to be filled later
    answers: generateRandomAnswers("Adam")
  },
  {
    fact: "", // Empty fact - to be filled later
    answers: generateRandomAnswers("Jacob")
  },
  {
    fact: "", // Empty fact - to be filled later
    answers: generateRandomAnswers("Ann")
  },
  {
    fact: "", // Empty fact - to be filled later
    answers: generateRandomAnswers("Saurabh")
  },
  {
    fact: "", // Empty fact - to be filled later
    answers: generateRandomAnswers("Bedriye")
  },
  {
    fact: "", // Empty fact - to be filled later
    answers: generateRandomAnswers("Vitalii")
  },
  {
    fact: "", // Empty fact - to be filled later
    answers: generateRandomAnswers("Peter")
  },
  {
    fact: "", // Empty fact - to be filled later
    answers: generateRandomAnswers("Mahdi")
  },
  {
    fact: "", // Empty fact - to be filled later
    answers: generateRandomAnswers("Zak")
  }
];

// Game state
let currentPlayer = null;
let currentQuestionIndex = 0;
let userAnswers = [];
let isAdministrator = false;
let timerInterval = null;
let timeLeft = 60; // 1 minute in seconds
let timerActive = false;
let gameStarted = false;
let registeredPlayers = [];

// DOM elements
const registrationDiv = document.getElementById("registration");
const adminDashboardDiv = document.getElementById("admin-dashboard");
const quizDiv = document.getElementById("quiz");
const resultDiv = document.getElementById("result");
const adminResultsDiv = document.getElementById("admin-results");

const playerNameInput = document.getElementById("player-name");
const startGameBtn = document.getElementById("start-game-btn");
const currentPlayerSpan = document.getElementById("current-player");
const timerElement = document.getElementById("timer");
const questionElement = document.getElementById("question");
const answersContainer = document.getElementById("answers");
const nextButton = document.getElementById("next-btn");
const resultContainer = document.getElementById("result");

// Administrator elements
const totalParticipantsSpan = document.getElementById("total-participants");
const currentQuestionNumberSpan = document.getElementById("current-question-number");
const adminQuestionText = document.getElementById("admin-question-text");
const adminAnswersContainer = document.getElementById("admin-answers");
const adminNextBtn = document.getElementById("admin-next-btn");
const adminResultsBtn = document.getElementById("admin-results-btn");
const backToAdminBtn = document.getElementById("back-to-admin");
const resultsTable = document.getElementById("results-table");

// New administrator elements
const waitingView = document.getElementById("waiting-view");
const gameProgressView = document.getElementById("game-progress-view");
const playersList = document.getElementById("players-list");
const startGameAdminBtn = document.getElementById("start-game-admin-btn");
const waitingMessage = document.getElementById("waiting-message");
const readyParticipantsSpan = document.getElementById("ready-participants");
const gameStatusSpan = document.getElementById("game-status");

// Initialize the game
function initGame() {
  // Check if user is already registered
  const savedPlayer = localStorage.getItem('currentPlayer');
  if (savedPlayer) {
    currentPlayer = savedPlayer;
    if (currentPlayer.toLowerCase() === 'administrator') {
      showAdministratorDashboard();
    } else {
      showQuiz();
    }
  } else {
    showRegistration();
  }
}

// Show registration form
function showRegistration() {
  hideAllSections();
  registrationDiv.classList.remove("hidden");
  playerNameInput.focus();
}

// Show administrator dashboard
function showAdministratorDashboard() {
  hideAllSections();
  adminDashboardDiv.classList.remove("hidden");
  isAdministrator = true;
  updateAdminStats();
  updatePlayersList();
  showWaitingView();
  
  // Start polling for new players
  startAdminPolling();
}

// Start polling for administrator dashboard updates
function startAdminPolling() {
  if (isAdministrator) {
    updatePlayersList();
    updateAdminStats();
    setTimeout(startAdminPolling, 2000); // Check every 2 seconds
  }
}

// Show waiting for game view
function showWaitingForGame() {
  hideAllSections();
  quizDiv.classList.remove("hidden");
  currentPlayerSpan.textContent = `Player: ${currentPlayer}`;
  questionElement.innerHTML = `
    <div style="text-align: center; padding: 40px;">
      <h2>⏳ Waiting for Game to Start</h2>
      <p>You are registered as: <strong>${currentPlayer}</strong></p>
      <p>The administrator will start the game when all players are ready.</p>
      <div style="margin-top: 20px;">
        <div class="loading-spinner"></div>
      </div>
    </div>
  `;
  answersContainer.innerHTML = "";
  nextButton.style.display = "none";
  
  // Start polling for game start
  checkGameStart();
}

// Register a new player
function registerPlayer(playerName) {
  const existingPlayers = getRegisteredPlayers();
  if (!existingPlayers.find(p => p.name === playerName)) {
    existingPlayers.push({
      name: playerName,
      status: 'ready',
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('registeredPlayers', JSON.stringify(existingPlayers));
    registeredPlayers = existingPlayers;
  }
}

// Get registered players from localStorage
function getRegisteredPlayers() {
  const players = localStorage.getItem('registeredPlayers');
  return players ? JSON.parse(players) : [];
}

// Update players list in administrator view
function updatePlayersList() {
  const players = getRegisteredPlayers();
  registeredPlayers = players;
  
  if (players.length === 0) {
    playersList.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">No players registered yet...</p>';
    startGameAdminBtn.classList.add("hidden");
    waitingMessage.textContent = "Waiting for players to register...";
  } else {
    playersList.innerHTML = "";
    players.forEach(player => {
      const playerDiv = document.createElement("div");
      playerDiv.classList.add("player-item");
      playerDiv.innerHTML = `
        <span class="player-name">${player.name}</span>
        <span class="player-status status-ready">Ready</span>
      `;
      playersList.appendChild(playerDiv);
    });
    
    startGameAdminBtn.classList.remove("hidden");
    waitingMessage.textContent = `${players.length} player(s) ready. Click "Start Game" to begin.`;
  }
}

// Show waiting view in administrator dashboard
function showWaitingView() {
  waitingView.classList.remove("hidden");
  gameProgressView.classList.add("hidden");
  gameStatusSpan.textContent = "Waiting for Players";
  gameStatusSpan.className = "status-waiting-players";
}

// Show game progress view in administrator dashboard
function showGameProgressView() {
  waitingView.classList.add("hidden");
  gameProgressView.classList.remove("hidden");
  gameStatusSpan.textContent = "Game in Progress";
  gameStatusSpan.className = "status-game-started";
  showAdminQuestion();
}

// Start game for all players
function startGameForAllPlayers() {
  gameStarted = true;
  localStorage.setItem('gameStarted', 'true');
  showGameProgressView();
  updateAdminStats();
  
  // Notify all players that game has started
  // This would typically be done through a server, but for localStorage we'll use a flag
  localStorage.setItem('gameStartTime', new Date().toISOString());
}

// Show regular quiz
function showQuiz() {
  hideAllSections();
  quizDiv.classList.remove("hidden");
  currentPlayerSpan.textContent = `Player: ${currentPlayer}`;
  startQuiz();
}

// Check if game has started and start polling
function checkGameStart() {
  const gameStarted = localStorage.getItem('gameStarted');
  if (gameStarted === 'true') {
    // Game has started, begin the quiz
    showQuiz();
  } else {
    // Continue waiting, check again in 1 second
    setTimeout(checkGameStart, 1000);
  }
}

// Show results
function showResults() {
  hideAllSections();
  resultDiv.classList.remove("hidden");
  displayResults();
}

// Show administrator results
function showAdminResults() {
  hideAllSections();
  adminResultsDiv.classList.remove("hidden");
  displayAllResults();
}

// Hide all sections
function hideAllSections() {
  registrationDiv.classList.add("hidden");
  adminDashboardDiv.classList.add("hidden");
  quizDiv.classList.add("hidden");
  resultDiv.classList.add("hidden");
  adminResultsDiv.classList.add("hidden");
}

// Start game button handler
startGameBtn.addEventListener("click", () => {
  const playerName = playerNameInput.value.trim();
  if (playerName) {
    currentPlayer = playerName;
    localStorage.setItem('currentPlayer', currentPlayer);
    
    if (playerName.toLowerCase() === 'administrator') {
      showAdministratorDashboard();
    } else {
      // Register player and wait for administrator to start game
      registerPlayer(playerName);
      showWaitingForGame();
    }
  }
});

// Administrator start game button
startGameAdminBtn.addEventListener("click", () => {
  startGameForAllPlayers();
});

// Enter key handler for name input
playerNameInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    startGameBtn.click();
  }
});

// Administrator dashboard functions
function updateAdminStats() {
  const allResults = getAllResults();
  const players = getRegisteredPlayers();
  
  totalParticipantsSpan.textContent = players.length;
  readyParticipantsSpan.textContent = players.length;
  currentQuestionNumberSpan.textContent = currentQuestionIndex + 1;
}

function showAdminQuestion() {
  const currentQuestion = questions[currentQuestionIndex];
  
  if (currentQuestion.fact === "") {
    adminQuestionText.innerHTML = `<strong>Question ${currentQuestionIndex + 1}</strong><br><em>Fact will be added here...</em>`;
  } else {
    adminQuestionText.innerHTML = `<strong>Question ${currentQuestionIndex + 1}</strong><br>${currentQuestion.fact}`;
  }
  
  adminAnswersContainer.innerHTML = "";
  currentQuestion.answers.forEach(answer => {
    const answerDiv = document.createElement("div");
    answerDiv.classList.add("admin-answer-item");
    
    const img = document.createElement("img");
    img.src = answer.image;
    img.alt = answer.text;
    img.classList.add("admin-answer-image");
    
    const text = document.createElement("span");
    text.textContent = answer.text;
    text.classList.add("admin-answer-text");
    
    answerDiv.appendChild(img);
    answerDiv.appendChild(text);
    adminAnswersContainer.appendChild(answerDiv);
  });
  
  adminNextBtn.classList.remove("hidden");
}

// Administrator next question
adminNextBtn.addEventListener("click", () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    updateAdminStats();
    showAdminQuestion();
  } else {
    adminNextBtn.classList.add("hidden");
    adminQuestionText.innerHTML = "<strong>All questions completed!</strong>";
    adminAnswersContainer.innerHTML = "";
  }
});

// Administrator results button
adminResultsBtn.addEventListener("click", () => {
  showAdminResults();
});

// Back to admin dashboard
backToAdminBtn.addEventListener("click", () => {
  showAdministratorDashboard();
});

// Regular quiz functions
function startQuiz() {
  currentQuestionIndex = 0;
  userAnswers = [];
  nextButton.innerText = "Next";
  resultContainer.classList.add("hidden");
  showQuestion();
}

// Timer functions
function startTimer() {
  console.log('Starting timer...');
  
  // Clear any existing timer first
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  
  timerActive = true;
  timeLeft = 60;
  updateTimerDisplay();
  
  timerInterval = setInterval(() => {
    if (!timerActive) {
      clearInterval(timerInterval);
      timerInterval = null;
      return;
    }
    
    timeLeft--;
    updateTimerDisplay();
    
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      timerActive = false;
      timeUp();
    }
  }, 1000);
  
  console.log('Timer started, interval ID:', timerInterval);
}

function updateTimerDisplay() {
  if (!timerElement) {
    console.error('Timer element not found');
    return;
  }
  
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  // Change timer color based on time left
  timerElement.classList.remove('warning', 'danger');
  if (timeLeft <= 10) {
    timerElement.classList.add('danger');
  } else if (timeLeft <= 30) {
    timerElement.classList.add('warning');
  }
}

function stopTimer() {
  console.log('Stopping timer, interval ID:', timerInterval);
  timerActive = false;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  console.log('Timer stopped');
}

function timeUp() {
  // Automatically select no answer (incorrect) and move to next question
  userAnswers[currentQuestionIndex] = false;
  
  // Disable all buttons
  Array.from(answersContainer.children).forEach(btn => {
    btn.disabled = true;
  });
  
  // Show time up message
  questionElement.innerHTML += '<br><br><div style="color: #dc3545; font-weight: bold;">⏰ Time\'s up!</div>';
  
  // Show next button
  nextButton.style.display = "block";
  nextButton.innerText = currentQuestionIndex + 1 < questions.length ? "Next Question" : "Show Results";
}

function showQuestion() {
  resetState();
  const currentQuestion = questions[currentQuestionIndex];
  
  // Handle empty facts
  if (currentQuestion.fact === "") {
    questionElement.innerHTML = `<strong>Who is the person associated with this fact?</strong><br><br><em>Fact will be added here...</em>`;
  } else {
    questionElement.innerHTML = `<strong>Who is the person associated with this fact?</strong><br><br>${currentQuestion.fact}`;
  }

  currentQuestion.answers.forEach(answer => {
    const button = document.createElement("button");
    button.classList.add("answer-btn");
    
    // Create image element
    const img = document.createElement("img");
    img.src = answer.image;
    img.alt = answer.text;
    img.classList.add("answer-image");
    
    // Create text element
    const text = document.createElement("span");
    text.innerText = answer.text;
    text.classList.add("answer-text");
    
    // Add image and text to button
    button.appendChild(img);
    button.appendChild(text);
    
    button.addEventListener("click", () => selectAnswer(button, answer.correct));
    answersContainer.appendChild(button);
  });
  
  // Start the timer for this question (with a small delay to ensure DOM is ready)
  setTimeout(() => {
    startTimer();
  }, 100);
}

function resetState() {
  stopTimer(); // Stop any running timer
  nextButton.style.display = "none";
  answersContainer.innerHTML = "";
  timerElement.textContent = "01:00";
  timerElement.classList.remove('warning', 'danger');
}

function selectAnswer(button, correct) {
  // Stop the timer
  stopTimer();
  
  // Store the selected answer and whether it's correct
  button.classList.add("selected");
  
  // Store user's answer for this question
  userAnswers[currentQuestionIndex] = correct;

  // disable all buttons after answer
  Array.from(answersContainer.children).forEach(btn => {
    btn.disabled = true;
  });

  nextButton.style.display = "block";
  nextButton.innerText = currentQuestionIndex + 1 < questions.length ? "Next Question" : "Show Results";
}

nextButton.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  
  console.log('Next button clicked, current question:', currentQuestionIndex);
  stopTimer(); // Stop any running timer
  
  // Force immediate response
  setTimeout(() => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
      console.log('Moving to next question:', currentQuestionIndex);
      showQuestion();
    } else {
      console.log('Showing results');
      showResults();
    }
  }, 10);
});

function showAnswerFeedback() {
  // Show which answer was correct and mark selected answer as right/wrong
  Array.from(answersContainer.children).forEach(btn => {
    const answerText = btn.querySelector('.answer-text').innerText;
    const isCorrect = questions[currentQuestionIndex].answers.find(a => a.text === answerText).correct;
    const isSelected = btn.classList.contains("selected");
    
    if (isCorrect) {
      btn.classList.add("correct");
    } else if (isSelected) {
      btn.classList.add("wrong");
    }
  });
}

// Results functions
function displayResults() {
  // Calculate final score based on user answers
  let finalScore = 0;
  for (let i = 0; i < userAnswers.length; i++) {
    if (userAnswers[i] === true) {
      finalScore++;
    }
  }
  
  const percentage = Math.round((finalScore / questions.length) * 100);
  let message = `You scored ${finalScore} out of ${questions.length} (${percentage}%)!`;
  
  if (percentage >= 90) {
    message += "<br><br>🏆 Excellent! You're a true DELMIA IPC team expert!";
  } else if (percentage >= 70) {
    message += "<br><br>👍 Great job! You know your team members well!";
  } else if (percentage >= 50) {
    message += "<br><br>📚 Good effort! Keep learning about your team!";
  } else {
    message += "<br><br>💪 Don't give up! There's always more to learn about your team!";
  }
  
  // Save results
  saveResult(currentPlayer, finalScore, percentage);
  
  // Add recap of all questions with correct answers
  message += "<br><br><h3>📋 Quiz Recap - Correct Answers:</h3>";
  message += "<div class='recap-container'>";
  
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    const correctAnswer = question.answers.find(answer => answer.correct);
    const userWasCorrect = userAnswers[i] === true;
    
    message += `<div class='recap-item ${userWasCorrect ? 'correct-recap' : 'incorrect-recap'}'>`;
    message += `<div class='recap-question'><strong>Question ${i + 1}:</strong> `;
    
    if (question.fact === "") {
      message += `<em>Fact will be added here...</em>`;
    } else {
      message += question.fact;
    }
    
    message += `</div>`;
    message += `<div class='recap-answer'>`;
    message += `<img src="${correctAnswer.image}" alt="${correctAnswer.text}" class="recap-image">`;
    message += `<span class="recap-name">${correctAnswer.text}</span>`;
    message += `</div>`;
    message += `<div class='recap-status'>${userWasCorrect ? '✅ Correct' : '❌ Incorrect'}</div>`;
    message += `</div>`;
  }
  
  message += "</div>";
  
  resultContainer.innerHTML = message;
  resultContainer.classList.remove("hidden");
  nextButton.innerText = "Play Again";
  nextButton.style.display = "block";
  nextButton.onclick = () => {
    currentQuestionIndex = 0;
    showQuiz();
  };
}

// Storage functions
function saveResult(playerName, score, percentage) {
  const results = getAllResults();
  const timestamp = new Date().toISOString();
  
  results.push({
    player: playerName,
    score: score,
    percentage: percentage,
    timestamp: timestamp
  });
  
  localStorage.setItem('quizResults', JSON.stringify(results));
}

function getAllResults() {
  const results = localStorage.getItem('quizResults');
  return results ? JSON.parse(results) : [];
}

function displayAllResults() {
  const results = getAllResults();
  
  if (results.length === 0) {
    resultsTable.innerHTML = "<p>No results yet. Players need to complete the quiz first.</p>";
    return;
  }
  
  // Sort by score (highest first)
  results.sort((a, b) => b.score - a.score);
  
  let tableHTML = `
    <table class="results-table">
      <thead>
        <tr>
          <th>Rank</th>
          <th>Player</th>
          <th>Score</th>
          <th>Percentage</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  results.forEach((result, index) => {
    const rank = index + 1;
    const date = new Date(result.timestamp).toLocaleDateString();
    const scoreClass = getScoreClass(result.percentage);
    
    tableHTML += `
      <tr>
        <td>${rank}</td>
        <td>${result.player}</td>
        <td class="score-cell ${scoreClass}">${result.score}/${questions.length}</td>
        <td class="score-cell ${scoreClass}">${result.percentage}%</td>
        <td>${date}</td>
      </tr>
    `;
  });
  
  tableHTML += `
      </tbody>
    </table>
  `;
  
  resultsTable.innerHTML = tableHTML;
}

function getScoreClass(percentage) {
  if (percentage >= 90) return 'score-excellent';
  if (percentage >= 70) return 'score-good';
  if (percentage >= 50) return 'score-fair';
  return 'score-poor';
}

// Initialize the game when page loads
initGame();