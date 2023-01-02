var modes=["Mini", "PoleEspoir", "Nationale", "TopJeune"]
var select = document.createElement('select');

function menuModeFactory() {
	for(var i = 0; i < modes.length; i++) {
		var opt = modes[i];
		var el = document.createElement("option");
		el.textContent = opt;
		el.value = opt;
		select.appendChild(el);
	}
	console.log(select);
	return select;
}

function buttonValidModeFactory() {
	var button=document.createElement("button");
	button.innerHTML="ok";
	button.addEventListener("click", function() {
		console.log('select: '+select.value);
		modeMAJ(select.value);
	}
	)
	return button;
}

function modeMAJ(val){
	console.log(val);
	sauveMode(val);
	switch(val){
		case 'TopJeune':
			timeFlip=0;
			timeWait=100;
			break;
		case 'Nationale':
			timeFlip=50;
			timeWait=100;
			break;
		case 'PoleEspoir':
			timeFlip=100;
			timeWait=100;
			break;
		case 'Mini':
		default:
			timeFlip=500;
			timeWait=500;
			break;

	}
	const cards = document.querySelectorAll(".memory-card");
	cards.forEach(card => {
		card.style.transitionDuration = (timeFlip/1000) + "s";
	});
}
