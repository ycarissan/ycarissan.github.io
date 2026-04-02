var currentSizeKey = '4x4';
var meilleurTemps = 11000002;

// Supabase configuration — replace values and set ENABLE_SUPABASE to true
const ENABLE_SUPABASE = false; // set to true to enable remote save
const SUPABASE_URL = 'https://YOUR_SUPABASE_URL.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
let supabaseClient = null;
if (ENABLE_SUPABASE && typeof supabase !== 'undefined') {
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

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
    // Optionnel: envoyer le score vers Supabase si activé
    if (ENABLE_SUPABASE) {
      try {
        const username = prompt('Entrez votre nom pour enregistrer le score (facultatif)') || 'Anonymous';
        // ne pas bloquer l'UI
        saveScoreToSupabase(username, savedTime);
      } catch (e) {
        console.error('Erreur en tentant d\'enregistrer le score remotely', e);
      }
    }
  }
}

function razMeilleurTemps() {
  meilleurTemps = 11000002;
  localStorage.setItem('meilleurTemps_' + currentSizeKey, meilleurTemps);
  montreMeilleurTemps();
}

// --- Supabase helper functions ---
async function saveScoreToSupabase(username, score, meta) {
  if (!ENABLE_SUPABASE || !supabaseClient) return null;
  try {
    const payload = { username: username || 'Anonymous', score: Math.floor(score), meta: meta || {} };
    const { data, error } = await supabaseClient.from('scores').insert([payload]).select();
    if (error) {
      console.error('Supabase insert error', error);
      return { error };
    }
    return { data };
  } catch (err) {
    console.error('saveScoreToSupabase exception', err);
    return { error: err };
  }
}

async function getTopScoresFromSupabase(limit = 10) {
  if (!ENABLE_SUPABASE || !supabaseClient) return [];
  try {
    const { data, error } = await supabaseClient
      .from('scores')
      .select('username,score,timestamp')
      .order('score', { ascending: false })
      .limit(limit);
    if (error) {
      console.error('Supabase select error', error);
      return [];
    }
    return data;
  } catch (err) {
    console.error('getTopScoresFromSupabase exception', err);
    return [];
  }
}
