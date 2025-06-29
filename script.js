// Log a message to confirm the JS is linked
console.log('JavaScript file is linked correctly.');

// DOM element selections
const board = document.getElementById('game-board');
const keys = document.querySelectorAll('.key');
const enterKey = document.getElementById('enter-key');
const deleteKey = document.getElementById('delete-key');
const boardRows = document.querySelectorAll('.board-row');

// Game config
let difficulty = localStorage.getItem('difficulty') || 'normal';
document.getElementById('difficulty').value = difficulty;
document.getElementById('difficulty').addEventListener('change', function () {
  difficulty = this.value;
  localStorage.setItem('difficulty', difficulty);
  location.reload();
});

let NUM_ROWS = (difficulty === 'hard') ? 4 : 6;
const NUM_COLS = 5;
let currentRow = 0;
let currentGuess = [];
let guesses = [];

// Array of 5 water-related 5-letter words
const wordList = ['WATER', 'RIVER', 'OCEAN', 'WELLS', 'DROPS'];

// Pick a random word from the list for this game
const correctWord = wordList[Math.floor(Math.random() * wordList.length)];

let gameOver = false;

const waterFacts = [
  'Did you know? Only 3% of the world\'s water is fresh water.',
  'Unsafe water kills more people each year than all forms of violence, including war.',
  'Women and girls spend 200 million hours every day collecting water.',
  '1 in 10 people lack access to clean water.',
  'Access to clean water can improve health, education, and income.'
];

const waterStory = `
  <strong>Meet Amina:</strong> Amina used to walk hours each day to collect water for her family. 
  After her village received a clean water well, she could go to school and spend more time with friends. 
  Clean water changed her life!
`;

function applyEasyHints() {
  const hintIndices = [0, 2];
  const firstRowCells = boardRows[0].querySelectorAll('.board-cell');
  hintIndices.forEach(i => {
    const letter = correctWord[i];
    currentGuess[i] = letter;
    firstRowCells[i].textContent = letter;
    firstRowCells[i].classList.add('correct');
  });
}

function getRequiredLetters() {
  if (currentRow === 0) return [];
  const prevGuess = guesses[currentRow - 1];
  const prevCells = boardRows[currentRow - 1].querySelectorAll('.board-cell');
  let required = [];
  for (let i = 0; i < NUM_COLS; i++) {
    if (
      prevCells[i].classList.contains('correct') ||
      prevCells[i].classList.contains('present')
    ) {
      required.push(prevGuess[i]);
    }
  }
  return required;
}

function updateBoard() {
  const cells = boardRows[currentRow].querySelectorAll('.board-cell');
  for (let i = 0; i < NUM_COLS; i++) {
    if (!(difficulty === 'easy' && currentRow === 0 && (i === 0 || i === 2))) {
      cells[i].textContent = currentGuess[i] || '';
      cells[i].classList.remove('correct', 'present', 'absent');
    }
  }
}

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

function checkGuess() {
  const guess = currentGuess.join('');
  const guessUpper = guess.toUpperCase();
  const correctUpper = correctWord.toUpperCase();
  const cells = boardRows[currentRow].querySelectorAll('.board-cell');
  let correctCount = 0;

  let correctLetters = correctUpper.split('');
  let guessLetters = guessUpper.split('');
  let letterResults = Array(NUM_COLS).fill('absent');

  for (let i = 0; i < NUM_COLS; i++) {
    if (guessLetters[i] === correctLetters[i]) {
      letterResults[i] = 'correct';
      correctLetters[i] = null;
      correctCount++;
    }
  }

  for (let i = 0; i < NUM_COLS; i++) {
    if (letterResults[i] === 'correct') continue;
    const idx = correctLetters.indexOf(guessLetters[i]);
    if (idx !== -1 && guessLetters[i] !== correctWord[i]) {
      letterResults[i] = 'present';
      correctLetters[idx] = null;
    }
  }

  for (let i = 0; i < NUM_COLS; i++) {
    cells[i].classList.add(letterResults[i]);
    colorKey(guessLetters[i], letterResults[i]);
  }

  return correctCount === NUM_COLS;
}

function showStatusModal(message) {
  const modal = document.getElementById('modal');
  const modalMessage = document.getElementById('modal-message');
  const waterFact = document.getElementById('water-fact');
  const fact = waterFacts[Math.floor(Math.random() * waterFacts.length)];

  modalMessage.textContent = message;
  waterFact.textContent = fact;

  const expandedFact = document.getElementById('expanded-fact');
  const toggleStoryBtn = document.getElementById('toggle-story');
  if (expandedFact && toggleStoryBtn) {
    expandedFact.classList.remove('visible');
    toggleStoryBtn.textContent = 'Learn more';
    toggleStoryBtn.onclick = function () {
      if (expandedFact.classList.contains('visible')) {
        expandedFact.classList.remove('visible');
        toggleStoryBtn.textContent = 'Learn more';
      } else {
        expandedFact.classList.add('visible');
        toggleStoryBtn.textContent = 'Hide story';
      }
    };
  }

  modal.classList.remove('hidden');
}

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

  if (!document.getElementById('play-again')) {
    const btnWrapper = document.createElement('div');
    btnWrapper.className = 'modal-button-group';
    btnWrapper.appendChild(playAgainBtn);
    btnWrapper.appendChild(shareBtn);
    modalContent.appendChild(btnWrapper);
  }
}

const closeModalBtn = document.getElementById('close-modal');
if (closeModalBtn) {
  closeModalBtn.onclick = () => {
    document.getElementById('modal').classList.add('hidden');
  };
}

function handleEnter() {
  if (difficulty === 'hard' && guesses.length > 0) {
    const prevGuess = guesses[guesses.length - 1];
    const prevCells = boardRows[currentRow - 1].querySelectorAll('.board-cell');

    for (let i = 0; i < NUM_COLS; i++) {
      const prevLetter = prevGuess[i];
      const wasHint = prevCells[i].classList.contains('correct') || prevCells[i].classList.contains('present');
      if (wasHint && !currentGuess.includes(prevLetter)) {
        alert(`Hard mode: you must reuse letter "${prevLetter}"`);
        return;
      }
    }
  }

  if (currentGuess.length === NUM_COLS && !gameOver) {
    guesses.push(currentGuess.join(''));
    const isCorrect = checkGuess();

    if (isCorrect) {
      gameOver = true;
      showStatusModal('You got it! 🎉');
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

function handleLetter(letter) {
  if (gameOver || currentGuess.length >= NUM_COLS) return;

  if (difficulty === 'easy' && currentRow === 0) {
    const hintIndices = [0, 2];
    let nextIndex = currentGuess.findIndex((val, i) => !val && !hintIndices.includes(i));
    if (nextIndex === -1) {
      for (let i = 0; i < NUM_COLS; i++) {
        if (!currentGuess[i] && !hintIndices.includes(i)) {
          nextIndex = i;
          break;
        }
      }
    }
    if (nextIndex !== -1) {
      currentGuess[nextIndex] = letter;
      updateBoard();
    }
  } else {
    for (let i = 0; i < NUM_COLS; i++) {
      if (!currentGuess[i]) {
        currentGuess[i] = letter;
        updateBoard();
        break;
      }
    }
  }
}

function handleDelete() {
  for (let i = NUM_COLS - 1; i >= 0; i--) {
    if (currentGuess[i] && !(difficulty === 'easy' && currentRow === 0 && (i === 0 || i === 2))) {
      currentGuess[i] = undefined;
      updateBoard();
      break;
    }
  }
}

keys.forEach(key => {
  key.addEventListener('click', function () {
    if (gameOver) return;
    const value = key.textContent;
    if (value === 'Enter') {
      handleEnter();
    } else if (value === 'Delete') {
      handleDelete();
    } else {
      if (currentRow < NUM_ROWS) {
        handleLetter(value);
      }
    }
  });
});

// Apply easy mode hints after page reload if in easy mode
if (difficulty === 'easy') {
  applyEasyHints();
  updateBoard();
}
