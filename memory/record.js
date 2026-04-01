var currentSizeKey = '4x4';
var meilleurTemps = 11000002;

function loadMeilleurTemps() {
  const stored = localStorage.getItem('meilleurTemps_' + currentSizeKey);
  meilleurTemps = stored ? parseInt(stored) : 11000002;
}

function montreMeilleurTemps() {
  var hours = Math.floor((meilleurTemps % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((meilleurTemps % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((meilleurTemps % (1000 * 60)) / 1000);
  var milliseconds = meilleurTemps - (seconds + minutes * 60 + hours * 3600) * 1000;
  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;
  milliseconds = (milliseconds < 100) ? (milliseconds < 10) ? "00" + milliseconds : "0" + milliseconds : milliseconds;
  document.getElementById("tempsABattre").innerHTML =
    "Meilleur (" + currentSizeKey + ") : " + hours + ':' + minutes + ':' + seconds + ':' + milliseconds;
}

function sauveMeilleurTemps() {
  if (savedTime < meilleurTemps) {
    party.sparkles(document.getElementById("tempsABattre"));
    meilleurTemps = savedTime;
    localStorage.setItem('meilleurTemps_' + currentSizeKey, meilleurTemps);
    montreMeilleurTemps();
  }
}

function razMeilleurTemps() {
  meilleurTemps = 11000002;
  localStorage.setItem('meilleurTemps_' + currentSizeKey, meilleurTemps);
  montreMeilleurTemps();
}
