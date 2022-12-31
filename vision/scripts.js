window.onload = function (){
	const cases = document.querySelectorAll('.case');
	const ncases = cases.length;
	var idx = 0;
	var combo = -1;
	var ok = -1;
	var notok = -1;

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


	function add_notok() {
		notok = notok + 1;
		document.getElementById("notok").innerHTML=notok;
	}

	function add_ok() {
		ok = ok + 1;
		document.getElementById("ok").innerHTML=ok;
	}

	function add_combo() {
		combo = combo + 1;
		document.getElementById("combo").innerHTML=combo;
		if (combo==2) {
			console.log('combo!!');
			anime({
				target: cases,
				duration: 5000,
				rotate: '2turn',
				easing: 'easeInOutQuad',
			});
		}
	}

	function setTarget(t) {
		cible=t;
		document.getElementById("cible").innerHTML=t;
	}

	function do_combo(element) {
		soundok.play();
		add_combo();
		console.log(Math.floor(combo/8));
		party.confetti(element, {shapes: pieces[Math.floor(combo/8)], count: combo, size: 1});
		anime({
			targets: element,
			rotate: '1turn',
			duration: 2000
		});
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

	function init() {
		party.resolvableShapes["pion"] = `<img src="/img/plt45.png"/>`;
		party.resolvableShapes["cavalier"] = `<img src="/img/ndt45.png"/>`;
		party.resolvableShapes["fou"] = `<img src="/img/blt45.png"/>`;
		party.resolvableShapes["tour"] = `<img src="/img/rdt45.png"/>`;
		party.resolvableShapes["dame"] = `<img src="/img/qlt45.png"/>`;
		party.resolvableShapes["roi"] = `<img src="/img/kdt45.png"/>`;
		add_ok();
		add_notok();
		add_combo();
	}

	function checkForMatch() {

		if (!running) {
			startTimer();
		}

		cachees = document.getElementsByClassName("cachee");

		//succesful click
		if (cible==this.innerHTML) {
			this.classList.toggle("trouvee");
			this.classList.toggle("cachee");
			add_ok();
			do_combo(this);
			// remove the square found from the square to be found
			cachees = document.getElementsByClassName("cachee");
			if (cachees.length!=0) {
				setTarget(cachees[Math.floor(Math.random()*cachees.length)].textContent);
			}
		} else {
			add_notok();
			combo=0;
			soundfail.play();
		}


		if (cachees.length==0) {
			console.log("termine!!!");
			party.confetti(this);

		}


	}

	cases.forEach(unecase => unecase.innerHTML=coords[idx++]);
	cachees = document.getElementsByClassName("cachee");
	var cible = cachees[Math.floor(Math.random()*cachees.length)].textContent;
	setTarget(cible)
	idx=0;
	cases.forEach(unecase => unecase.addEventListener('click', checkForMatch));
	cases.forEach(unecase => unecase.addEventListener('touchstart', checkForMatch));
	var soundok = new Howl({
		src: ['GameBurp/success_pickup.ogg'],
	});
	var soundfail = new Howl({
		src: ['mixit/mixkit-wrong-answer-bass-buzzer-948.wav'],
	});
	var soundup = new Howl({
		src: ['mixit/mixkit-melodic-bonus-collect-1938.wav'],
	});
	var music = new Howl({
		src: ['music/SkyeJordan_-_Good_(Blissful)_Morning_Alice_1.mp3'],
		autoplay: true,
		loop: true,
		volume: 0.5,
	});music.play()
	init();
}