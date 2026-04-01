const allImages = [
  'bdt45', 'Bdt45', 'blt45', 'Blt45',
  'edt45', 'elt45', 'fdt45', 'flt45',
  'gdt45', 'Gdt45', 'glt45', 'Glt45',
  'hdt45', 'hlt45', 'kdt45', 'klt45',
  'mdt45', 'Mdt45', 'mlt45', 'Mlt45',
  'ndt45', 'nlt45', 'pdt45', 'plt45',
  'qdt45', 'qlt45', 'rdt45', 'rlt45',
  'Udt45', 'Ult45', 'Zdt45', 'Zlt45'
];

let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;
let ncards = 0;
let currentCols = 4;
let currentRows = 4;
let flipDuration = 0.3;
let unflipDelay = 800;

function restartGame() {
  initGame(currentCols, currentRows);
}

function initGame(cols, rows) {
  currentCols = cols;
  currentRows = rows;
  const gameEl = document.querySelector('.memory-game');
  gameEl.innerHTML = '';
  gameEl.style.setProperty('--cols', cols);
  gameEl.style.setProperty('--rows', rows);
  gameEl.style.setProperty('--flip-duration', flipDuration + 's');

  const numPairs = (cols * rows) / 2;
  const shuffled = [...allImages].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, numPairs);
  const cardData = [...selected, ...selected].sort(() => Math.random() - 0.5);

  cardData.forEach(name => {
    const div = document.createElement('div');
    div.classList.add('memory-card');
    div.dataset.framework = name;
    div.innerHTML = `
      <img class="front-face" src="img/${name}.svg" alt="${name}" />
      <img class="back-face" src="img/logo_me.svg" alt="back" />
    `;
    gameEl.appendChild(div);
  });

  ncards = cols * rows;
  hasFlippedCard = false;
  lockBoard = false;
  firstCard = null;
  secondCard = null;

  currentSizeKey = cols + 'x' + rows;
  loadMeilleurTemps();
  resetTimer();
  montreMeilleurTemps();

  document.querySelectorAll('.memory-card').forEach(card => card.addEventListener('click', flipCard));
}

function flipCard() {
  if (!running) startTimer();
  if (lockBoard) return;
  if (this === firstCard) return;

  this.classList.add('flip');

  if (!hasFlippedCard) {
    hasFlippedCard = true;
    firstCard = this;
    return;
  }

  secondCard = this;
  checkForMatch();
}

function checkForMatch() {
  const isMatch = firstCard.dataset.framework === secondCard.dataset.framework;
  isMatch ? disableCards() : unflipCards();
}

function disableCards() {
  firstCard.removeEventListener('click', flipCard);
  secondCard.removeEventListener('click', flipCard);
  firstCard.classList.add('found');
  secondCard.classList.add('found');
  const nfound = document.querySelectorAll('.memory-card.found').length;
  if (nfound === ncards) {
    pauseTimer();
    sauveMeilleurTemps();
    party.confetti(secondCard);
  }
  resetBoard();
}

function unflipCards() {
  lockBoard = true;
  setTimeout(() => {
    firstCard.classList.remove('flip');
    secondCard.classList.remove('flip');
    resetBoard();
  }, unflipDelay);
}

function resetBoard() {
  [hasFlippedCard, lockBoard] = [false, false];
  [firstCard, secondCard] = [null, null];
}

function openConfig() {
  document.getElementById('configModal').classList.add('open');
}

function updateFlipDuration(val) {
  flipDuration = parseFloat(val);
  document.getElementById('flipDurationVal').textContent = parseFloat(val).toFixed(2) + 's';
  document.querySelector('.memory-game').style.setProperty('--flip-duration', flipDuration + 's');
}

function updateUnflipDelay(val) {
  unflipDelay = parseInt(val);
  document.getElementById('unflipDelayVal').textContent = val + 'ms';
}

function selectSize(cols, rows) {
  document.getElementById('configModal').classList.remove('open');
  document.querySelectorAll('.config-buttons button').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('btn-' + cols + 'x' + rows);
  if (btn) btn.classList.add('active');
  initGame(cols, rows);
}

initGame(4, 4);
