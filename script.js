// Log a message to confirm the JS is linked
console.log('JavaScript file is linked correctly.');

// DOM element selections
const board = document.getElementById('game-board');
const keys = document.querySelectorAll('.key');
const enterKey = document.getElementById('enter-key');
const deleteKey = document.getElementById('delete-key');
const boardRows = document.querySelectorAll('.board-row');

// Game config
const NUM_ROWS = 6;
const NUM_COLS = 5;
const correctWord = 'WATER';
let currentRow = 0;
let currentGuess = [];
let guesses = [];
let gameOver = false;

// Water facts for modal
const waterFacts = [
  'Did you know? Only 3% of the world\'s water is fresh water.',
  'Unsafe water kills more people each year than all forms of violence, including war.',
  'Women and girls spend 200 million hours every day collecting water.',
  '1 in 10 people lack access to clean water.',
  'Access to clean water can improve health, education, and income.'
];

// Update the board with current guess
function updateBoard() {
  const cells = boardRows[currentRow].querySelectorAll('.board-cell');
  for (let i = 0; i < NUM_COLS; i++) {
    cells[i].textContent = currentGuess[i] || '';
    cells[i].classList.remove('correct', 'present', 'absent');
  }
}

// Color the keyboard keys
function colorKey(letter, result) {
  keys.forEach(key => {
    if (key.textContent === letter) {
      const classList = key.classList;
      if (
        classList.contains('correct') ||
        (classList.contains('present') && result === 'absent')
      ) {
        return;
      }
      classList.remove('correct', 'present', 'absent');
      classList.add(result);
    }
  });
}

// Check the current guess
function checkGuess() {
  const guess = currentGuess.join('');
  const guessUpper = guess.toUpperCase();
  const correctUpper = correctWord.toUpperCase();
  const cells = boardRows[currentRow].querySelectorAll('.board-cell');
  let correctCount = 0;

  let correctLetters = correctUpper.split('');
  let guessLetters = guessUpper.split('');
  let letterResults = Array(NUM_COLS).fill('absent');

  // First pass: exact matches
  for (let i = 0; i < NUM_COLS; i++) {
    if (guessLetters[i] === correctLetters[i]) {
      letterResults[i] = 'correct';
      correctLetters[i] = null;
      correctCount++;
    }
  }

  // Second pass: present letters
  for (let i = 0; i < NUM_COLS; i++) {
    if (letterResults[i] === 'correct') continue;
    const idx = correctLetters.indexOf(guessLetters[i]);
    if (idx !== -1 && guessLetters[i] !== correctWord[i]) {
      letterResults[i] = 'present';
      correctLetters[idx] = null;
    }
  }

  // Apply results to tiles and keys
  for (let i = 0; i < NUM_COLS; i++) {
    cells[i].classList.add(letterResults[i]);
    colorKey(guessLetters[i], letterResults[i]);
  }

  return correctCount === NUM_COLS;
}

// Show the modal
function showStatusModal(message) {
  const modal = document.getElementById('modal');
  const modalMessage = document.getElementById('modal-message');
  const waterFact = document.getElementById('water-fact');
  const fact = waterFacts[Math.floor(Math.random() * waterFacts.length)];

  modalMessage.textContent = message;
  waterFact.innerHTML = `${fact} <br><a href="https://www.charitywater.org/" target="_blank">Learn more at charity: water</a>`;
  modal.classList.remove('hidden');
}

// Add modal buttons
const modalContent = document.getElementById('modal-content');
if (modalContent) {
  const playAgainBtn = document.createElement('button');
  playAgainBtn.textContent = 'Play Again Tomorrow';
  playAgainBtn.id = 'play-again';
  playAgainBtn.className = 'modal-btn';
  playAgainBtn.onclick = () => {
    document.getElementById('modal').classList.add('hidden');
  };

  const shareBtn = document.createElement('button');
  shareBtn.textContent = 'Share';
  shareBtn.id = 'share-btn';
  shareBtn.className = 'modal-btn';
  shareBtn.onclick = () => {
    navigator.clipboard.writeText('I played Water Word! Try it at charitywater.org');
    shareBtn.textContent = 'Copied!';
    setTimeout(() => { shareBtn.textContent = 'Share'; }, 1500);
  };

  // Add buttons if not already present
  if (!document.getElementById('play-again')) {
    const btnWrapper = document.createElement('div');
    btnWrapper.className = 'modal-button-group';
    btnWrapper.appendChild(playAgainBtn);
    btnWrapper.appendChild(shareBtn);
    modalContent.appendChild(btnWrapper);
  }
}

// Close modal
const closeModalBtn = document.getElementById('close-modal');
if (closeModalBtn) {
  closeModalBtn.onclick = () => {
    document.getElementById('modal').classList.add('hidden');
  };
}

// Handle pressing Enter
function handleEnter() {
  if (currentGuess.length === NUM_COLS && !gameOver) {
    guesses.push(currentGuess.join(''));
    const isCorrect = checkGuess();

    if (isCorrect) {
      gameOver = true;
      showStatusModal('You got it! 🎉');

      // 🎉 Confetti trigger on win
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#2E9DF7', '#FFC907', '#8BD1CB']
        });
      }
    } else if (currentRow === NUM_ROWS - 1) {
      gameOver = true;
      showStatusModal(`The word was: ${correctWord}`);
    } else {
      currentRow++;
      currentGuess = [];
      updateBoard();
    }
  }
}

// Handle typing letters
function handleLetter(letter) {
  if (currentGuess.length < NUM_COLS) {
    currentGuess.push(letter);
    updateBoard();
  }
}

// Handle delete
function handleDelete() {
  if (currentGuess.length > 0) {
    currentGuess.pop();
    updateBoard();
  }
}

// Key event listeners
keys.forEach(key => {
  key.addEventListener('click', function () {
    if (gameOver) return;
    const value = key.textContent;
    if (value === 'Enter') {
      handleEnter();
    } else if (value === 'Delete') {
      handleDelete();
    } else {
      if (currentGuess.length < NUM_COLS && currentRow < NUM_ROWS) {
        handleLetter(value);
      }
    }
  });
});
