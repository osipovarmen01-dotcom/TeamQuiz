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
  
  // Show welcome message for administrator
  showAdminWelcomeMessage();
  
  // Start polling for new players
  startAdminPolling();
  
  // Add debug info
  console.log('Admin dashboard opened. Current registered players:', getRegisteredPlayers());
}

// Show welcome message for administrator
function showAdminWelcomeMessage() {
  // Remove any existing welcome message
  const existingWelcome = document.getElementById("admin-welcome");
  if (existingWelcome) {
    existingWelcome.remove();
  }
  
  // Create welcome message
  const welcomeDiv = document.createElement("div");
  welcomeDiv.id = "admin-welcome";
  welcomeDiv.style.cssText = `
    background: #d1ecf1;
    color: #0c5460;
    border: 1px solid #bee5eb;
    border-radius: 8px;
    padding: 15px;
    margin: 15px 0;
    font-size: 0.9rem;
    text-align: center;
    animation: fadeIn 0.3s ease-in;
  `;
  welcomeDiv.innerHTML = `
    <strong>🔧 Administrator Access Granted</strong><br>
    Welcome, ${currentPlayer}! You can now manage the quiz session.
    <br><br>
    <button onclick="clearAllPlayers()" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; margin-right: 5px;">Clear All Players</button>
    <button onclick="resetGame()" style="background: #ffc107; color: black; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; margin-right: 5px;">Reset Game</button>
    <button onclick="debugLocalStorage()" style="background: #6c757d; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">Debug Data</button>
  `;
  
  // Insert at the top of admin dashboard
  const adminStats = document.getElementById("admin-stats");
  adminStats.parentNode.insertBefore(welcomeDiv, adminStats);
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (welcomeDiv.parentNode) {
      welcomeDiv.remove();
    }
  }, 10000);
}

// Clear all registered players (for testing)
function clearAllPlayers() {
  localStorage.removeItem('registeredPlayers');
  registeredPlayers = [];
  updatePlayersList();
  console.log('All players cleared');
}

// Reset game for new round
function resetGame() {
  // Clear game state
  gameStarted = false;
  localStorage.removeItem('gameStarted');
  localStorage.removeItem('gameFinished');
  localStorage.removeItem('gameStartTime');
  localStorage.removeItem('gameFinishedTime');
  
  // Reset all players to waiting status
  const players = getRegisteredPlayers();
  players.forEach(player => {
    player.status = 'waiting';
    player.score = 0;
    player.currentQuestion = 0;
    player.completedAt = null;
  });
  localStorage.setItem('registeredPlayers', JSON.stringify(players));
  
  // Update admin dashboard
  if (isAdministrator) {
    updateAdminStats();
    updatePlayersList();
    showWaitingView();
  }
  
  console.log('Game reset for new round');
}

// Debug function to show localStorage data
function debugLocalStorage() {
  console.log('=== LocalStorage Debug ===');
  console.log('registeredPlayers:', localStorage.getItem('registeredPlayers'));
  console.log('currentPlayer:', localStorage.getItem('currentPlayer'));
  console.log('gameStarted:', localStorage.getItem('gameStarted'));
  console.log('quizResults:', localStorage.getItem('quizResults'));
  console.log('========================');
}

// Update player status
function updatePlayerStatus(playerName, newStatus, additionalData = {}) {
  const players = getRegisteredPlayers();
  const playerIndex = players.findIndex(p => p.name === playerName);
  
  if (playerIndex !== -1) {
    players[playerIndex].status = newStatus;
    players[playerIndex].lastUpdate = new Date().toISOString();
    
    // Add any additional data (like score, current question, etc.)
    Object.assign(players[playerIndex], additionalData);
    
    localStorage.setItem('registeredPlayers', JSON.stringify(players));
    console.log(`Player ${playerName} status updated to ${newStatus}:`, players[playerIndex]);
    
    // Update admin dashboard if we're in admin mode
    if (isAdministrator) {
      updatePlayersList();
    }
    
    // Check if all players are finished
    if (newStatus === 'finished') {
      checkAllPlayersFinished();
    }
  } else {
    console.log(`Player ${playerName} not found for status update`);
  }
}

// Get player status
function getPlayerStatus(playerName) {
  const players = getRegisteredPlayers();
  const player = players.find(p => p.name === playerName);
  return player ? player.status : null;
}

// Check if all players are finished
function checkAllPlayersFinished() {
  const players = getRegisteredPlayers();
  const allFinished = players.length > 0 && players.every(player => player.status === 'finished');
  
  if (allFinished) {
    console.log('All players have finished the game!');
    // Update game status to finished
    gameStarted = false;
    localStorage.setItem('gameStarted', 'false');
    localStorage.setItem('gameFinished', 'true');
    localStorage.setItem('gameFinishedTime', new Date().toISOString());
    
    // Update admin dashboard if we're in admin mode
    if (isAdministrator) {
      updateAdminStats();
      updatePlayersList();
    }
  }
  
  return allFinished;
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
  console.log('Registering player:', playerName, 'Existing players:', existingPlayers);
  
  if (!existingPlayers.find(p => p.name === playerName)) {
    existingPlayers.push({
      name: playerName,
      status: 'waiting', // Changed from 'ready' to 'waiting'
      timestamp: new Date().toISOString(),
      score: 0,
      currentQuestion: 0
    });
    localStorage.setItem('registeredPlayers', JSON.stringify(existingPlayers));
    registeredPlayers = existingPlayers;
    console.log('Player registered successfully. Updated list:', existingPlayers);
  } else {
    console.log('Player already exists:', playerName);
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
  
  console.log('Admin dashboard - updating players list:', players);
  
  if (players.length === 0) {
    playersList.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">No players registered yet...</p>';
    startGameAdminBtn.classList.add("hidden");
    waitingMessage.textContent = "Waiting for players to register...";
  } else {
    playersList.innerHTML = "";
    players.forEach(player => {
      const playerDiv = document.createElement("div");
      playerDiv.classList.add("player-item");
      
      // Get status display and class
      const statusInfo = getStatusDisplay(player.status);
      
      playerDiv.innerHTML = `
        <span class="player-name">${player.name}</span>
        <span class="player-status ${statusInfo.class}">${statusInfo.display}</span>
        ${player.score !== undefined ? `<span class="player-score">Score: ${player.score}</span>` : ''}
      `;
      playersList.appendChild(playerDiv);
    });
    
    // Update button visibility based on game state
    if (gameStarted) {
      startGameAdminBtn.classList.add("hidden");
      waitingMessage.textContent = `Game in progress - ${players.length} player(s) registered`;
    } else {
      startGameAdminBtn.classList.remove("hidden");
      waitingMessage.textContent = `${players.length} player(s) waiting. Click "Start Game" to begin.`;
    }
  }
}

// Get status display information
function getStatusDisplay(status) {
  const statusMap = {
    'waiting': { display: '⏳ Waiting', class: 'status-waiting' },
    'ready': { display: '✅ Ready', class: 'status-ready' },
    'playing': { display: '🎮 Playing', class: 'status-playing' },
    'finished': { display: '🏁 Finished', class: 'status-finished' }
  };
  
  return statusMap[status] || { display: '❓ Unknown', class: 'status-unknown' };
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
  
  // Update all players from 'waiting' to 'ready'
  const players = getRegisteredPlayers();
  players.forEach(player => {
    if (player.status === 'waiting') {
      player.status = 'ready';
    }
  });
  localStorage.setItem('registeredPlayers', JSON.stringify(players));
  
  showGameProgressView();
  updateAdminStats();
  updatePlayersList();
  
  // Notify all players that game has started
  localStorage.setItem('gameStartTime', new Date().toISOString());
  
  console.log('Game started! All players status updated to ready:', players);
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

// Show error message
function showErrorMessage(message) {
  // Remove any existing error message
  const existingError = document.getElementById("error-message");
  if (existingError) {
    existingError.remove();
  }
  
  // Create error message element
  const errorDiv = document.createElement("div");
  errorDiv.id = "error-message";
  errorDiv.style.cssText = `
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
    border-radius: 8px;
    padding: 12px;
    margin: 10px 0;
    font-size: 0.9rem;
    text-align: center;
    animation: fadeIn 0.3s ease-in;
  `;
  errorDiv.textContent = message;
  
  // Insert after the input field
  const inputField = document.getElementById("player-name");
  inputField.parentNode.insertBefore(errorDiv, inputField.nextSibling);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.remove();
    }
  }, 5000);
  
  // Focus back on input
  inputField.focus();
  inputField.select();
}

// Start game button handler
startGameBtn.addEventListener("click", () => {
  const playerName = playerNameInput.value.trim();
  
  // Validate input
  if (!playerName) {
    showErrorMessage("Please enter your name");
    return;
  }
  
  if (playerName.length < 2) {
    showErrorMessage("Name must be at least 2 characters long");
    return;
  }
  
  if (playerName.length > 20) {
    showErrorMessage("Name must be 20 characters or less");
    return;
  }
  
  // Check for invalid characters
  if (!/^[a-zA-Z0-9\s\-_]+$/.test(playerName)) {
    showErrorMessage("Name can only contain letters, numbers, spaces, hyphens, and underscores");
    return;
  }
  
  currentPlayer = playerName;
  localStorage.setItem('currentPlayer', currentPlayer);
  
  // Check for administrator access (case-insensitive)
  if (playerName.toLowerCase() === 'administrator') {
    // Clear any existing error styling
    playerNameInput.classList.remove("error", "success");
    showAdministratorDashboard();
  } else {
    // Register player and wait for administrator to start game
    registerPlayer(playerName);
    showWaitingForGame();
  }
});

// Administrator start game button
startGameAdminBtn.addEventListener("click", () => {
  startGameForAllPlayers();
});

// Refresh players list button
document.getElementById("refresh-players-btn").addEventListener("click", () => {
  updatePlayersList();
  updateAdminStats();
  console.log('Players list refreshed manually');
});

// Enter key handler for name input
playerNameInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    startGameBtn.click();
  }
});

// Real-time input validation
playerNameInput.addEventListener("input", (e) => {
  const value = e.target.value.trim();
  
  // Remove any existing error styling
  playerNameInput.classList.remove("error", "success");
  
  // Remove any existing error message
  const existingError = document.getElementById("error-message");
  if (existingError) {
    existingError.remove();
  }
  
  if (value.length > 0) {
    // Basic validation feedback
    if (value.length < 2) {
      playerNameInput.classList.add("error");
    } else if (value.length >= 2 && value.length <= 20 && /^[a-zA-Z0-9\s\-_]+$/.test(value)) {
      playerNameInput.classList.add("success");
    } else {
      playerNameInput.classList.add("error");
    }
  }
});

// Clear validation on focus
playerNameInput.addEventListener("focus", () => {
  playerNameInput.classList.remove("error", "success");
  const existingError = document.getElementById("error-message");
  if (existingError) {
    existingError.remove();
  }
});

// Administrator dashboard functions
function updateAdminStats() {
  const allResults = getAllResults();
  const players = getRegisteredPlayers();
  
  totalParticipantsSpan.textContent = players.length;
  readyParticipantsSpan.textContent = players.length;
  
  // Update game status
  const gameFinished = localStorage.getItem('gameFinished') === 'true';
  
  if (gameFinished) {
    gameStatusSpan.textContent = "Game Finished";
    gameStatusSpan.className = "status-game-finished";
  } else if (gameStarted) {
    gameStatusSpan.textContent = "Game in Progress";
    gameStatusSpan.className = "status-game-started";
  } else {
    gameStatusSpan.textContent = "Waiting for Players";
    gameStatusSpan.className = "status-waiting-players";
  }
  
  console.log('Admin stats updated:', {
    totalPlayers: players.length,
    gameStarted: gameStarted,
    players: players
  });
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
  
  // Update player status to playing
  updatePlayerStatus(currentPlayer, 'playing', { currentQuestion: 0 });
  
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
  
  // Update player status to finished
  updatePlayerStatus(currentPlayer, 'finished', { 
    score: finalScore, 
    percentage: percentage,
    completedAt: new Date().toISOString()
  });
  
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