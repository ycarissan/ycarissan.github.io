const npaires = 6;
const ncards = npaires*2;
var timeFlip=500;
var timeWait=500

var images = [
'rdt45.svg', 'rlt45.svg', // tour
'ndt45.svg', 'nlt45.svg', // cavalier
'bdt45.svg', 'blt45.svg', // fou
'qdt45.svg', 'qlt45.svg', // dame
'kdt45.svg', 'klt45.svg', // roi
'pdt45.svg', 'plt45.svg', // pion
'mdt45.svg', 'mlt45.svg', 
'Mdt45.svg', 'Mlt45.svg', 
'edt45.svg', 'elt45.svg', 
'fdt45.svg', 'flt45.svg', 
'gdt45.svg', 'glt45.svg', 
'hdt45.svg', 'hlt45.svg', 
'Gdt45.svg', 'Glt45.svg', 
'Bdt45.svg', 'Blt45.svg', 
'Udt45.svg', 'Ult45.svg', 
'Zdt45.svg', 'Zlt45.svg'
]
document.addEventListener('DOMContentLoaded', function() {
	var i;
	document.getElementById('timerContainer').classList.add('start');
	for (i = 0; i < npaires; i++) {
		var j;
		for (j=0; j<2; j++) {
			var mem_game = document.getElementById('memory-game');
			var mem_card = document.createElement('div');
			var verso_img = document.createElement("img");
			var recto_img = document.createElement("img");
			mem_card.className = 'memory-card';
  			mem_card.dataset.framework=images[i];
			recto_img.className="front-face";
			recto_img.src="img/"+images[i];
			recto_img.setAttribute('draggable', false);
			verso_img.className="back-face";
			verso_img.src="img/logo_me.svg";
			verso_img.setAttribute('draggable', false);
			mem_card.appendChild(recto_img);
			mem_card.appendChild(verso_img);

			let randomPos = Math.floor(Math.random() * 12);
			mem_card.style.order = randomPos;
			mem_card.addEventListener('click', flipCard);
			mem_game.appendChild(mem_card);
		}
	}
	document.getElementById('modeSelector').appendChild(menuModeFactory());
	document.getElementById('modeSelector').appendChild(buttonValidModeFactory());
}, false);

let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;

function flipCard() {
  if (!running) {
    startTimer()
	  document.getElementById('timerContainer').classList.remove('start');
  }
  if (lockBoard) return;
  if (this === firstCard) return;

  this.classList.add('flip');

  if (!hasFlippedCard) {
    // first click
    hasFlippedCard = true;
    firstCard = this;

    return;
  }

  // second click
  secondCard = this;

  checkForMatch();
}

function checkForMatch() {
  let isMatch = firstCard.dataset.framework === secondCard.dataset.framework;

  isMatch ? disableCards() : unflipCards();
}

function disableCards() {
  firstCard.removeEventListener('click', flipCard);
  secondCard.removeEventListener('click', flipCard);
  firstCard.classList.add('found');
  secondCard.classList.add('found');
  const nfound=document.querySelectorAll('.memory-card.found').length
  console.log(nfound);
  if (nfound == ncards) {
    pauseTimer();
    sauveMeilleurTemps();
    party.confetti(secondCard);
  }
  resetBoard();
}

function unflipCards() {
	timeout=timeFlip*2+timeWait;
  lockBoard = true;

  setTimeout(() => {
    firstCard.classList.remove('flip');
    secondCard.classList.remove('flip');

    resetBoard();
  }, timeout);
}

function resetBoard() {
  [hasFlippedCard, lockBoard] = [false, false];
  [firstCard, secondCard] = [null, null];
}
