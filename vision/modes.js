var modes=["Mini", "Espoir", "Top"]
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

function getMode() {
	return select.value;
}

function modeMAJ(val){
	console.log(val);
	sauveMode(val);
}
