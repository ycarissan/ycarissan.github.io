var meilleurTemps;

console.log(localStorage);
if(localStorage.getItem("meilleurTemps")) {
	meilleurTemps = localStorage.getItem("meilleurTemps");
} else {
	razMeilleurTemps();
}
montreMeilleurTemps();
console.log(meilleurTemps);

function sauveMeilleurTemps() {
	if (savedTime < meilleurTemps) {
		meilleurTemps = savedTime;
		localStorage.setItem("meilleurTemps", meilleurTemps);
		montreMeilleurTemps(meilleurTemps);
	}
}

function montreMeilleurTemps(){
	var hours = Math.floor((meilleurTemps % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	var minutes = Math.floor((meilleurTemps % (1000 * 60 * 60)) / (1000 * 60));
	var seconds = Math.floor((meilleurTemps % (1000 * 60)) / 1000);
//	var milliseconds = Math.floor((meilleurTemps % (1000 * 60)) / 100);hours = (hours < 10) ? "0" + hours : hours;
	var milliseconds = meilleurTemps - (seconds + minutes * 60 + hours * 3600 ) * 1000;
	hours = (hours < 10) ? "0" + hours : hours;
	minutes = (minutes < 10) ? "0" + minutes : minutes;
	seconds = (seconds < 10) ? "0" + seconds : seconds;
	milliseconds = (milliseconds < 100) ? (milliseconds < 10) ? "00" + milliseconds : "0" + milliseconds : milliseconds;
	console.log("hours"+hours);
	document.getElementById("tempsABattre").innerHTML = "Meilleur temps :" + hours + ':' + minutes + ':' + seconds + ':' + milliseconds;
}

function razMeilleurTemps() {
	meilleurTemps = 11000002;
	localStorage.setItem("meilleurTemps", meilleurTemps);
	montreMeilleurTemps();
}
