var currentSizeKey = '4x4';
var meilleurTemps = 11000002;

// Supabase configuration
const ENABLE_SUPABASE = true;
const SUPABASE_URL = 'https://eetumbczoiqahhytetys.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVldHVtYmN6b2lxYWhoeXRldHlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMjMwNDksImV4cCI6MjA5MDY5OTA0OX0.PLVoHK9mpNCOV45lBKCEIMKuVwR5oJsc7HLawemzk8E';
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

async function sauveMeilleurTemps() {
  if (savedTime < meilleurTemps) {
    party.sparkles(document.getElementById("tempsABattre"));
    meilleurTemps = savedTime;
    localStorage.setItem('meilleurTemps_' + currentSizeKey, meilleurTemps);
    montreMeilleurTemps();
    const username = await askPlayerName();
    try { localStorage.setItem('lastPlayerName', username); } catch (e) {}
    if (ENABLE_SUPABASE) {
      saveScoreToSupabase(username, savedTime).catch(e => console.error(e));
    } else {
      showLeaderboardStatus('Score enregistré localement pour ' + username);
    }
  }
}

function razMeilleurTemps() {
  meilleurTemps = 11000002;
  localStorage.setItem('meilleurTemps_' + currentSizeKey, meilleurTemps);
  montreMeilleurTemps();
}

// --- Player name modal ---
let _nameResolve = null;

function askPlayerName() {
  return new Promise((resolve) => {
    _nameResolve = resolve;
    const stored = localStorage.getItem('lastPlayerName') || '';
    const input = document.getElementById('nameInput');
    if (input) input.value = stored;
    document.getElementById('nameModal').classList.add('open');
    setTimeout(() => { if (input) input.focus(); }, 50);
  });
}

function submitPlayerName(override) {
  const modal = document.getElementById('nameModal');
  if (modal) modal.classList.remove('open');
  const val = (override === null)
    ? 'Anonymous'
    : (document.getElementById('nameInput').value.trim() || 'Anonymous');
  if (_nameResolve) { _nameResolve(val); _nameResolve = null; }
}

// Allow Enter key to submit
document.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' && document.getElementById('nameModal').classList.contains('open')) {
    submitPlayerName();
  }
});

// --- Supabase helpers ---
async function saveScoreToSupabase(username, score) {
  if (!ENABLE_SUPABASE || !supabaseClient) return null;
  try {
    const payload = { username: username || 'Anonymous', score: Math.floor(score), size: currentSizeKey };
    const res = await supabaseClient.from('scores').insert([payload]).select();
    if (res.error) {
      console.error('Supabase insert error', res.error);
      showLeaderboardStatus('Erreur: ' + (res.error.message || res.error));
      return { error: res.error };
    }
    try { refreshLeaderboard(); } catch (e) {}
    showLeaderboardStatus('Score enregistré !');
    return { data: res.data };
  } catch (err) {
    console.error('saveScoreToSupabase exception', err);
    showLeaderboardStatus('Erreur réseau: ' + err.message);
    return { error: err };
  }
}

async function getMonthlyTopScores(limit = 3, size = currentSizeKey) {
  if (!ENABLE_SUPABASE || !supabaseClient) return [];
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  try {
    const { data, error } = await supabaseClient
      .from('scores')
      .select('username,score,timestamp')
      .eq('size', size)
      .gte('timestamp', firstDay)
      .order('score', { ascending: true })
      .limit(limit);
    if (error) { console.error('Supabase monthly scores error', error); return []; }
    return data;
  } catch (err) { console.error(err); return []; }
}

async function getAllTimeTopScore(size = currentSizeKey) {
  if (!ENABLE_SUPABASE || !supabaseClient) return null;
  try {
    const { data, error } = await supabaseClient
      .from('scores')
      .select('username,score')
      .eq('size', size)
      .order('score', { ascending: true })
      .limit(1);
    if (error || !data || data.length === 0) return null;
    return data[0];
  } catch (err) { console.error(err); return null; }
}

// --- Leaderboard UI ---
function renderLeaderboard(monthly, alltime) {
  // Update size tag
  const sizeTag = document.getElementById('lbSizeTag');
  if (sizeTag) sizeTag.textContent = currentSizeKey.replace('x', '×');

  // All-time best
  const atEl = document.getElementById('allTimeScore');
  if (atEl) {
    if (alltime) {
      atEl.textContent = '\u2605 ' + (alltime.username || 'Anonymous') + ' \u2014 ' + formatTime(Number(alltime.score));
    } else {
      atEl.textContent = '—';
    }
  }

  // Monthly top 3
  const ol = document.getElementById('leaderboardList');
  if (!ol) return;
  ol.innerHTML = '';
  const medals = ['\uD83E\uDD47', '\uD83E\uDD48', '\uD83E\uDD49'];
  if (!monthly || monthly.length === 0) {
    const li = document.createElement('li');
    li.className = 'lb-loading';
    li.textContent = 'Pas de scores ce mois';
    ol.appendChild(li);
    return;
  }
  monthly.forEach((row, i) => {
    const li = document.createElement('li');
    li.className = 'lb-row';
    const medal = medals[i] !== undefined ? medals[i] : String(i + 1);
    li.innerHTML =
      '<span class="lb-medal">' + medal + '</span>' +
      '<span class="lb-name">' + (row.username || 'Anonymous') + '</span>' +
      '<span class="lb-time">' + formatTime(Number(row.score)) + '</span>';
    ol.appendChild(li);
  });
}

function showLeaderboardStatus(msg) {
  const el = document.getElementById('leaderboardStatus');
  if (el) {
    el.textContent = msg;
    setTimeout(() => { el.textContent = ''; }, 5000);
  } else {
    console.log('Leaderboard status:', msg);
  }
}

async function refreshLeaderboard() {
  if (ENABLE_SUPABASE && supabaseClient) {
    const [monthly, alltime] = await Promise.all([
      getMonthlyTopScores(3),
      getAllTimeTopScore()
    ]);
    if (!monthly || monthly.length === 0) showLeaderboardStatus('Aucun score ce mois');
    renderLeaderboard(monthly, alltime);
  } else {
    const local = localStorage.getItem('meilleurTemps_' + currentSizeKey);
    const list = local ? [{ username: 'Local', score: Number(local) }] : [];
    renderLeaderboard(list, list[0] || null);
  }
}

// Refresh leaderboard on page load
document.addEventListener('DOMContentLoaded', function () {
  try { refreshLeaderboard(); } catch (e) { console.error(e); }
});

// --- Debug helper ---
async function testSupabaseConnection() {
  if (!ENABLE_SUPABASE || !supabaseClient) {
    alert('Supabase désactivé ou client non initialisé.');
    return;
  }
  try {
    const { data, error } = await supabaseClient.from('scores').select('id').limit(1);
    if (error) {
      alert('Erreur Supabase: ' + (error.message || JSON.stringify(error)));
      console.error(error);
      return;
    }
    alert('Connexion Supabase OK. Exemple: ' + (data && data.length ? JSON.stringify(data[0]) : 'aucune ligne'));
  } catch (err) {
    alert('Exception: ' + err.message);
    console.error(err);
  }
}

// --- Formatting helper ---
function formatTime(ms) {
  if (isNaN(ms)) return String(ms);
  const total = Math.max(0, Math.floor(ms));
  const hours = Math.floor(total / (1000 * 60 * 60));
  const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((total % (1000 * 60)) / 1000);
  const milliseconds = total % 1000;
  const hh = hours > 0 ? (hours < 10 ? '0' + hours : hours) + ':' : '';
  const mm = (minutes < 10 ? '0' + minutes : minutes) + ':';
  const ss = (seconds < 10 ? '0' + seconds : seconds) + ':';
  const msStr = milliseconds < 100 ? (milliseconds < 10 ? '00' + milliseconds : '0' + milliseconds) : milliseconds;
  return hh + mm + ss + msStr;
}
