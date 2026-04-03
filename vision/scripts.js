var musiquefond;
window.onload = function (){
	const cases = document.querySelectorAll('.case');
	const ncases = cases.length;
	var idx = 0;
	var combo = -1;
	var ok = -1;
	var notok = -1;
	var gameOver = false;

	const coords = ["a8", "b8", "c8", "d8", "e8", "f8", "g8", "h8",
		"a7", "b7", "c7", "d7", "e7", "f7", "g7", "h7",
		"a6", "b6", "c6", "d6", "e6", "f6", "g6", "h6",
		"a5", "b5", "c5", "d5", "e5", "f5", "g5", "h5",
                "a4", "b4", "c4", "d4", "e4", "f4", "g4", "h4",
                "a3", "b3", "c3", "d3", "e3", "f3", "g3", "h3",
                "a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2",
                "a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1"
	];
	const pieces = ["pion", "cavalier", "fou", "tour", "dame", "roi"];

	function getTargetCount() {
		const mode = lireMode();
		if (mode === 'Mini')   return 10;
		if (mode === 'Espoir') return 32;
		return 64; // Top
	}

	function update_score() {
		strok=ok;
		strnotok=notok;
		strcombo=combo;
		if (ok<10) {
			strok="  "+ok;
		}
		if (notok<10) {
			strnotok="  "+notok;
		}
		if (combo<10) {
			strcombo="  "+combo;
		}
		const target = getTargetCount();
		document.getElementById("score").innerHTML="&#x2705; "+strok+"  &#x274E; "+strnotok +"  &#x1F31F; "+strcombo+"/"+target;
	}

	function add_notok() {
		notok = notok + 1;
		update_score();
	}

	function add_ok() {
		ok = ok + 1;
		update_score();
	}

	function add_combo() {
		combo = combo + 1;
		update_score();
	}

	function setTarget(t) {
		cible=t;
		document.getElementById("affichage_cible").innerHTML=t;
		cases.forEach(unecase => {
			if (unecase.innerHTML==cible){
				unecase.classList.toggle("cible");
			}
		});
	}

	function do_combo(element) {
		soundok.play();
		add_combo();
		console.log(Math.floor(combo/8));
		party.confetti(element, {
			shapes: pieces[Math.floor(combo/8)],
			count: combo,
			size: party.variation.range(0.5, 2.0),
		});
		element.classList.toggle("tourne1");
		if (combo%8 == 0) {
			trouvees = document.getElementsByClassName("trouvee");
			anime.remove(trouvees);
			soundok.once('end', function(){
				soundup.play();
				coolanime = anime({
					targets: trouvees,
					rotate: '2turn',
					duration: 1000
				});
			});
		}

	}

	const startPos = {
		'a8':'rdt45.svg','b8':'ndt45.svg','c8':'bdt45.svg','d8':'qdt45.svg','e8':'kdt45.svg','f8':'bdt45.svg','g8':'ndt45.svg','h8':'rdt45.svg',
		'a7':'pdt45.svg','b7':'pdt45.svg','c7':'pdt45.svg','d7':'pdt45.svg','e7':'pdt45.svg','f7':'pdt45.svg','g7':'pdt45.svg','h7':'pdt45.svg',
		'a2':'plt45.svg','b2':'plt45.svg','c2':'plt45.svg','d2':'plt45.svg','e2':'plt45.svg','f2':'plt45.svg','g2':'plt45.svg','h2':'plt45.svg',
		'a1':'rlt45.svg','b1':'nlt45.svg','c1':'blt45.svg','d1':'qlt45.svg','e1':'klt45.svg','f1':'blt45.svg','g1':'nlt45.svg','h1':'rlt45.svg',
	};

	function buildBoardLabels() {
		const wrapper = document.querySelector('.board-wrapper');
		const files = ['a','b','c','d','e','f','g','h'];
		const ranks = ['8','7','6','5','4','3','2','1'];

		const rowBottom = document.createElement('div');
		rowBottom.className = 'board-labels files bottom';
		files.forEach(f => {
			const el = document.createElement('span');
			el.textContent = f;
			rowBottom.appendChild(el);
		});
		wrapper.appendChild(rowBottom);

		const colLeft = document.createElement('div');
		colLeft.className = 'board-labels ranks left';
		ranks.forEach(r => {
			const el = document.createElement('span');
			el.textContent = r;
			colLeft.appendChild(el);
		});
		wrapper.appendChild(colLeft);
	}

	function placePieces() {
		const mode = lireMode();
		cases.forEach(unecase => {
			const coord = unecase.innerHTML;
			if (mode === 'Mini' && startPos[coord]) {
				unecase.style.backgroundImage = `url('../memory/img/${startPos[coord]}')`;
				unecase.style.backgroundSize = '75%';
				unecase.style.backgroundRepeat = 'no-repeat';
				unecase.style.backgroundPosition = 'center';
			} else {
				unecase.style.backgroundImage = '';
			}
		});
		const wrapper = document.querySelector('.board-wrapper');
		if (mode === 'Mini' || mode === 'Espoir') {
			wrapper.classList.add('show-coords');
		} else {
			wrapper.classList.remove('show-coords');
		}
	}
	window.placePieces = placePieces;

	function updateCaseSize() {
		const headerHeight = document.getElementById('timerContainer').offsetHeight;
		const availableH = window.innerHeight - headerHeight;
		const availableW = window.innerWidth;
		const boardSize = Math.min(availableW, availableH, 800);
		const caseSize = Math.floor(boardSize / 8);
		document.documentElement.style.setProperty('--case-size', caseSize + 'px');
	}
	window.addEventListener('resize', updateCaseSize);

	function init() {
		party.resolvableShapes["pion"] = `<img src="img/plt45.png"/>`;
		party.resolvableShapes["cavalier"] = `<img src="img/ndt45.png"/>`;
		party.resolvableShapes["fou"] = `<img src="img/blt45.png"/>`;
		party.resolvableShapes["tour"] = `<img src="img/rdt45.png"/>`;
		party.resolvableShapes["dame"] = `<img src="img/qlt45.png"/>`;
		party.resolvableShapes["roi"] = `<img src="img/kdt45.png"/>`;
		document.getElementById('modeSelector').appendChild(menuModeFactory());
		document.getElementById('modeSelector').appendChild(buttonValidModeFactory());
		add_ok();
		add_notok();
		add_combo();
		var tinterval=10;
		cases.forEach(unecase => setTimeout(() => unecase.classList.toggle('tourne1'),tinterval+=10));
		tinterval=10;
		cases.forEach(unecase => setTimeout(() => unecase.classList.toggle('tourne1'),tinterval+=10));
//		cases.forEach(unecase => {
//			var tinterval=1000;
//			setInterval(() => unecase.classList.toggle('tourne1'),tinterval+=100)
//		});
		buildBoardLabels();
		placePieces();
		updateCaseSize();
	}

	function checkForMatch() {
		if (gameOver) return;
		console.log(lireMode());

		//first click
		if (!running) {
			startTimer();
			hideLeaderboard();
			select.disabled = true;
			if (lireMode()=="Top") {
				element = document.getElementsByClassName("coords-game").item(0);
				console.log(element);
				setInterval(() => element.classList.toggle('tourne1_2'),10100);
				setInterval(() => {
					caseSurprise = cases[Math.floor(Math.random()*cachees.length)];
					caseSurprise.classList.toggle("surprise");
				},800);
			}
		}

		cachees = document.getElementsByClassName("cachee");

		//succesful click
		if (cible==this.innerHTML) {
			this.classList.toggle("trouvee");
			this.classList.toggle("cible");
			this.classList.toggle("cachee");
			add_ok();
			do_combo(this);
			this.classList.toggle("inactive");
			// remove the square found from the square to be found
			cachees = document.getElementsByClassName("cachee");
			if (cachees.length!=0) {
				setTarget(cachees[Math.floor(Math.random()*cachees.length)].textContent);
			}
		} else {
			add_notok();
			combo=0;
			soundfail.play();
			// Remettre toutes les cases trouvées dans le pool
			document.querySelectorAll('.trouvee').forEach(c => {
				c.classList.remove('trouvee', 'inactive');
				c.classList.add('cachee');
			});
			cachees = document.getElementsByClassName("cachee");
			setTarget(cachees[Math.floor(Math.random()*cachees.length)].textContent);
		}

		if (combo >= getTargetCount()) {
			gameOver = true;
			document.getElementById("affichage_cible").innerHTML = '';
			cases.forEach(c => c.classList.remove('cible', 'clignote'));
			pauseTimer();
			sauveMeilleurTemps();
			showLeaderboard();
			console.log("termine!!!");
			soundfinal.play();
			party.confetti(this);
			select.disabled = false;
		}


	}

	cases.forEach(unecase => unecase.innerHTML=coords[idx++]);
	cachees = document.getElementsByClassName("cachee");
	var cible = cachees[Math.floor(Math.random()*cachees.length)].textContent;
	setTarget(cible)
	idx=0;
	cases.forEach(unecase => unecase.addEventListener('click', checkForMatch));
	var soundok = new Howl({
		src: ['GameBurp/success_pickup.ogg'],
	});
	var soundfail = new Howl({
		src: ['mixit/mixkit-wrong-answer-bass-buzzer-948.wav'],
	});
	var soundup = new Howl({
		src: ['mixit/mixkit-melodic-bonus-collect-1938.wav'],
	});
	var soundfinal = new Howl({
		src: ['mixit/mixkit-medieval-show-fanfare-announcement-226.wav'],
	});
	var music = new Howl({
		src: ['music/SkyeJordan_-_Good_(Blissful)_Morning_Alice_1.mp3'],
		autoplay: true,
		loop: true,
		volume: 0.5,
	});
	music.play()
	musiquefond = music;
	init();
}
