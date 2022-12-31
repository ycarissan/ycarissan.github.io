const cases = document.querySelectorAll('.case');
const ncases = cases.length;
var idx = 0;
var atrouver=1000;

const coords = ["a8", "b8", "c8", "d8", "e8", "f8", "g8", "h8",
                "a7", "b7", "c7", "d7", "e7", "f7", "g7", "h7",
                "a6", "b6", "c6", "d6", "e6", "f6", "g6", "h6",
                "a5", "b5", "c5", "d5", "e5", "f5", "g5", "h5",
                "a4", "b4", "c4", "d4", "e4", "f4", "g4", "h4",
                "a3", "b3", "c3", "d3", "e3", "f3", "g3", "h3",
                "a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2",
                "a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1"
];
var targets = coords.slice()
targets = shuffle(targets)
console.log(targets)

var target = "i0";

function shuffle(array) {
//from https://bost.ocks.org/mike/shuffle/
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

function setTarget(t) {
	target=t;
	document.getElementById("target").innerHTML=t;
}

function checkForMatch() {

	//first click
	if (target=="i0") {
		setTarget(this.getAttribute('data-target'));
		return;
	}

	//succesful click
	console.log(target)
	console.log(this.innerHTML)
	console.log(target==this.innerHTML)
	if (target==this.innerHTML) {
		setTarget(this.getAttribute('data-target'));
		this.classList.toggle("trouvee");
	}

	atrouver = document.getElementsByClassName("trouvee").length - ncases
	if (atrouver==0) {
		console.log("termine!!!")
	}


}

cases.forEach(unecase => unecase.innerHTML=coords[idx++]);
idx=0;
cases.forEach(unecase => unecase.dataset.target=targets[idx++]);
cases.forEach(unecase => unecase.addEventListener('click', checkForMatch));
cases.forEach(unecase => unecase.addEventListener('touchstart', checkForMatch));
