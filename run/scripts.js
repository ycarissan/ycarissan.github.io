// ─────────────────────────────────────────────────────────
//  Chess helper functions
// ─────────────────────────────────────────────────────────

const PIECE_IMG_PATH = '../vision/img/';
const PENALTY_MS = 5000; // penalty per extra move

function sqToRC(sq) {
  return { col: sq.charCodeAt(0) - 96, row: parseInt(sq[1]) };
}

function rcToSq(row, col) {
  if (row < 1 || row > 8 || col < 1 || col > 8) return null;
  return String.fromCharCode(96 + col) + row;
}

// Legal destinations for a piece (chess rules, no attack check)
// board: { sq: { type, color, isPlayer, isEnemy, isFriendly } }
function getPieceMoves(type, color, square, board) {
  const { row, col } = sqToRC(square);
  const moves = [];
  const isWhite = color === 'l';

  function canLandOn(sq) {
    if (!sq) return false;
    const p = board[sq];
    if (!p) return true;
    if (p.isPlayer || p.isFriendly) return false; // own pieces block
    return true; // can capture enemy
  }

  if (type === 'p') {
    const dir = isWhite ? 1 : -1;
    const startRank = isWhite ? 2 : 7;
    const fwd1 = rcToSq(row + dir, col);
    if (fwd1 && !board[fwd1]) {
      moves.push(fwd1);
      if (row === startRank) {
        const fwd2 = rcToSq(row + 2 * dir, col);
        if (fwd2 && !board[fwd2]) moves.push(fwd2);
      }
    }
    [-1, 1].forEach(dc => {
      const diag = rcToSq(row + dir, col + dc);
      if (diag && board[diag] && board[diag].isEnemy) moves.push(diag);
    });
    return moves;
  }

  if (type === 'n') {
    [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]].forEach(([dr, dc]) => {
      const sq = rcToSq(row + dr, col + dc);
      if (canLandOn(sq)) moves.push(sq);
    });
    return moves;
  }

  const dirs = {
    b: [[1,1],[1,-1],[-1,1],[-1,-1]],
    r: [[1,0],[-1,0],[0,1],[0,-1]],
    q: [[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]],
    k: [[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]],
  };
  const sliding = type !== 'k';
  (dirs[type] || []).forEach(([dr, dc]) => {
    let r = row + dr, c = col + dc;
    while (true) {
      const sq = rcToSq(r, c);
      if (!sq) break;
      const p = board[sq];
      if (p) {
        if (!p.isPlayer && !p.isFriendly) moves.push(sq); // capture enemy
        break;
      }
      moves.push(sq);
      if (!sliding) break;
      r += dr; c += dc;
    }
  });
  return moves;
}

// Squares attacked/controlled by a piece (for danger detection)
// Differs from legal moves: pawns attack diagonals even when empty
function getPieceAttacks(type, color, square, board) {
  const { row, col } = sqToRC(square);
  const attacks = [];
  const isWhite = color === 'l';

  if (type === 'p') {
    const dir = isWhite ? 1 : -1;
    [-1, 1].forEach(dc => {
      const sq = rcToSq(row + dir, col + dc);
      if (sq) attacks.push(sq);
    });
    return attacks;
  }

  if (type === 'n') {
    [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]].forEach(([dr, dc]) => {
      const sq = rcToSq(row + dr, col + dc);
      if (sq) attacks.push(sq);
    });
    return attacks;
  }

  const dirs = {
    b: [[1,1],[1,-1],[-1,1],[-1,-1]],
    r: [[1,0],[-1,0],[0,1],[0,-1]],
    q: [[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]],
    k: [[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]],
  };
  const sliding = type !== 'k';
  (dirs[type] || []).forEach(([dr, dc]) => {
    let r = row + dr, c = col + dc;
    while (true) {
      const sq = rcToSq(r, c);
      if (!sq) break;
      attacks.push(sq);
      if (board[sq]) break; // ray blocked by any piece
      if (!sliding) break;
      r += dr; c += dc;
    }
  });
  return attacks;
}

// Check if dest is attacked by any enemy after player moves from src to dest
function isDestAttacked(src, dest, board) {
  // Build simulated board: player moves from src to dest
  const simBoard = {};
  for (const [sq, p] of Object.entries(board)) {
    if (sq === src) continue;      // player left this square
    if (sq === dest) continue;     // any piece on dest is captured
    simBoard[sq] = p;
  }
  simBoard[dest] = board[src];     // player arrives at dest

  // Check all enemy pieces
  for (const [sq, p] of Object.entries(simBoard)) {
    if (!p.isEnemy) continue;
    const attacked = getPieceAttacks(p.type, p.color, sq, simBoard);
    if (attacked.includes(dest)) return true;
  }
  return false;
}

// Compute all enemy-attacked squares on current board (for reveal at game end)
function computeAllAttackedSquares(board) {
  const attacked = new Set();
  for (const [sq, p] of Object.entries(board)) {
    if (!p.isEnemy) continue;
    getPieceAttacks(p.type, p.color, sq, board).forEach(s => attacked.add(s));
  }
  return attacked;
}

// ─────────────────────────────────────────────────────────
//  Game state
// ─────────────────────────────────────────────────────────

let board = {};
let playerSquare = null;
let treasureSquare = null;
let currentPuzzle = null;
let moveCount = 0;
let gameStarted = false;
let gameOver = false;

// ─────────────────────────────────────────────────────────
//  Board rendering
// ─────────────────────────────────────────────────────────

function buildBoard() {
  const boardEl = document.getElementById('board');
  boardEl.innerHTML = '';
  const files = ['a','b','c','d','e','f','g','h'];
  const ranks = [8,7,6,5,4,3,2,1];
  ranks.forEach(rank => {
    files.forEach((file, fi) => {
      const sq = file + rank;
      const col = fi + 1;
      const div = document.createElement('div');
      div.className = 'square ' + ((col + rank) % 2 === 0 ? 'sq-dark' : 'sq-light');
      div.dataset.square = sq;
      div.addEventListener('click', () => handleSquareClick(sq));
      boardEl.appendChild(div);
    });
  });

  buildLabels();
  updateBoardSize();
}

function buildLabels() {
  const filesEl = document.getElementById('filesLabel');
  filesEl.innerHTML = '';
  ['a','b','c','d','e','f','g','h'].forEach(f => {
    const span = document.createElement('span');
    span.textContent = f;
    filesEl.appendChild(span);
  });
  const ranksEl = document.getElementById('ranksLabel');
  ranksEl.innerHTML = '';
  [8,7,6,5,4,3,2,1].forEach(r => {
    const span = document.createElement('span');
    span.textContent = r;
    ranksEl.appendChild(span);
  });
}

function updateBoardSize() {
  const header = document.getElementById('timerContainer');
  const headerH = header ? header.offsetHeight : 0;
  const available = Math.min(window.innerWidth, window.innerHeight - headerH, 720);
  const caseSize = Math.floor(available / 8);
  document.documentElement.style.setProperty('--case-size', caseSize + 'px');
}
window.addEventListener('resize', updateBoardSize);

function renderBoard() {
  document.querySelectorAll('.square').forEach(el => {
    const sq = el.dataset.square;
    // Reset
    el.classList.remove('player-piece', 'treasure', 'legal-dest', 'attacked', 'shake');
    el.style.backgroundImage = '';
    el.style.backgroundSize = '';
    el.style.backgroundRepeat = '';
    el.style.backgroundPosition = '';
    el.innerHTML = '';

    const piece = board[sq];
    if (piece) {
      el.style.backgroundImage = `url('${PIECE_IMG_PATH}${piece.type}${piece.color}t45.svg')`;
      el.style.backgroundSize = '75%';
      el.style.backgroundRepeat = 'no-repeat';
      el.style.backgroundPosition = 'center';
    }

    if (sq === playerSquare) el.classList.add('player-piece');
    if (sq === treasureSquare) {
      el.classList.add('treasure');
      const gem = document.createElement('div');
      gem.className = 'treasure-gem';
      gem.textContent = '💎';
      el.appendChild(gem);
    }
  });

  showLegalMoveDots();
  updateMoveCounter();
}

function showLegalMoveDots() {
  const playerPiece = board[playerSquare];
  if (!playerPiece) return;
  const legalMoves = getPieceMoves(playerPiece.type, playerPiece.color, playerSquare, board);
  legalMoves.forEach(sq => {
    const el = document.querySelector(`[data-square="${sq}"]`);
    if (!el) return;
    el.classList.add('legal-dest');
    const dot = document.createElement('div');
    dot.className = 'move-dot' + (board[sq] ? ' capture-dot' : '');
    el.appendChild(dot);
  });
}

function updateMoveCounter() {
  const el = document.getElementById('moveCounter');
  if (!el || !currentPuzzle) return;
  el.textContent = 'Coups : ' + moveCount + ' / ' + currentPuzzle.minMoves + ' min';
}

// ─────────────────────────────────────────────────────────
//  Puzzle loading
// ─────────────────────────────────────────────────────────

function loadRandomPuzzle() {
  const level = lireLevel();
  const pool = PUZZLES[level];
  if (!pool || pool.length === 0) return;
  const puzzle = pool[Math.floor(Math.random() * pool.length)];
  loadPuzzle(puzzle);
}

function loadPuzzle(puzzle) {
  currentPuzzle = puzzle;
  board = {};
  moveCount = 0;
  gameStarted = false;
  gameOver = false;

  // Reset timer display
  savedTime = 0;
  difference = 0;
  paused = 0;
  running = 0;
  clearInterval(tInterval);
  const timerEl = document.querySelector('.timer');
  if (timerEl) timerEl.innerHTML = 'Prêt — cliquer pour jouer';

  const p = puzzle.playerPiece;
  board[p.square] = { type: p.type, color: p.color, isPlayer: true };
  playerSquare = p.square;

  puzzle.enemies.forEach(e => {
    board[e.square] = { type: e.type, color: e.color, isEnemy: true };
  });
  (puzzle.friendly || []).forEach(f => {
    board[f.square] = { type: f.type, color: f.color, isFriendly: true };
  });

  treasureSquare = puzzle.treasure;

  renderBoard();
}

// ─────────────────────────────────────────────────────────
//  Game interaction
// ─────────────────────────────────────────────────────────

function handleSquareClick(sq) {
  if (gameOver) return;

  const el = document.querySelector(`[data-square="${sq}"]`);
  if (!el || !el.classList.contains('legal-dest')) return;

  // Start timer on first move
  if (!gameStarted) {
    startTimer();
    gameStarted = true;
    hideLeaderboard();
  }

  // Check if destination is attacked
  if (isDestAttacked(playerSquare, sq, board)) {
    shakeSquare(playerSquare);
    flashDanger(sq);
    return;
  }

  // Execute move
  moveCount++;
  const playerPiece = board[playerSquare];
  delete board[playerSquare];
  board[sq] = playerPiece;
  playerSquare = sq;

  renderBoard();

  if (sq === treasureSquare) {
    handleWin();
  }
}

function shakeSquare(sq) {
  const el = document.querySelector(`[data-square="${sq}"]`);
  if (!el) return;
  el.classList.remove('shake');
  void el.offsetWidth;
  el.classList.add('shake');
  el.addEventListener('animationend', () => el.classList.remove('shake'), { once: true });
}

function flashDanger(sq) {
  const el = document.querySelector(`[data-square="${sq}"]`);
  if (!el) return;
  el.classList.add('flash-danger');
  setTimeout(() => el.classList.remove('flash-danger'), 600);
}

// ─────────────────────────────────────────────────────────
//  Win
// ─────────────────────────────────────────────────────────

function handleWin() {
  gameOver = true;
  pauseTimer();

  // Apply time penalty for extra moves
  const extraMoves = Math.max(0, moveCount - currentPuzzle.minMoves);
  savedTime = (savedTime || difference) + extraMoves * PENALTY_MS;

  if (typeof party !== 'undefined') {
    const gem = document.querySelector('.treasure-gem');
    if (gem) party.confetti(gem, { count: party.variation.range(20, 40) });
  }

  // Show attacked squares after short delay, then save score
  setTimeout(() => {
    revealAttackedSquares();
    setTimeout(async () => {
      await sauveMeilleurTemps();
      showLeaderboard();
    }, 1000);
  }, 500);
}

function revealAttackedSquares() {
  const attacked = computeAllAttackedSquares(board);
  attacked.forEach(sq => {
    const el = document.querySelector(`[data-square="${sq}"]`);
    if (el) el.classList.add('attacked');
  });
}

// ─────────────────────────────────────────────────────────
//  Level change hook
// ─────────────────────────────────────────────────────────

window.onLevelChange = function(level) {
  loadRandomPuzzle();
};

// ─────────────────────────────────────────────────────────
//  Init
// ─────────────────────────────────────────────────────────

window.addEventListener('load', function() {
  buildBoard();

  // Inject level selector
  const container = document.getElementById('levelSelector');
  if (container) container.appendChild(menuLevelFactory());

  loadRandomPuzzle();
  updateBoardSize();
});
