var meilleurTemps = 11000002;
let currentMode = 'Mini';

// Supabase configuration
const ENABLE_SUPABASE = true;
const SUPABASE_URL = 'https://eetumbczoiqahhytetys.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVldHVtYmN6b2lxYWhoeXRldHlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMjMwNDksImV4cCI6MjA5MDY5OTA0OX0.PLVoHK9mpNCOV45lBKCEIMKuVwR5oJsc7HLawemzk8E';
let supabaseClient = null;
if (ENABLE_SUPABASE && typeof supabase !== 'undefined') {
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

function loadMeilleurTemps() {
  const stored = localStorage.getItem('meilleurTemps_' + currentMode);
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
    "Meilleur : " + hours + ':' + minutes + ':' + seconds + ':' + milliseconds;
}

async function sauveMeilleurTemps() {
  if (savedTime < meilleurTemps) {
    party.sparkles(document.getElementById("tempsABattre"));
    meilleurTemps = savedTime;
    localStorage.setItem('meilleurTemps_' + currentMode, meilleurTemps);
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
  localStorage.setItem('meilleurTemps_' + currentMode, meilleurTemps);
  montreMeilleurTemps();
}

function sauveMode(val) {
  localStorage.setItem("mode", val);
}

function lireMode() {
  return localStorage.getItem("mode");
}

// Extend modeMAJ (defined in modes.js) to update currentMode and refresh leaderboard
const _modeMAJ_orig = modeMAJ;
modeMAJ = function(val) {
  _modeMAJ_orig(val);
  currentMode = val || 'Mini';
  const targetCount = { Mini: 10, Espoir: 32, Top: 64 }[currentMode] || 64;
  showPunchText(targetCount + ' cases\nà la suite');
  const tag = document.getElementById('lbModeTag');
  if (tag) tag.textContent = currentMode;
  const tagTab = document.getElementById('lbModeTagTab');
  if (tagTab) tagTab.textContent = currentMode;
  loadMeilleurTemps();
  montreMeilleurTemps();
  refreshLeaderboard();
};

// --- Player name ---
function askPlayerName() {
  return Promise.resolve(localStorage.getItem('lastPlayerName') || 'Anonyme');
}

function submitPlayerName(override) {
  const modal = document.getElementById('nameModal');
  if (modal) modal.classList.remove('open');
  const val = (override === null)
    ? 'Anonymous'
    : (document.getElementById('nameInput').value.trim() || 'Anonymous');
  if (_nameResolve) { _nameResolve(val); _nameResolve = null; }
}

document.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' && document.getElementById('nameModal').classList.contains('open')) {
    submitPlayerName();
  }
});

// --- Supabase helpers ---
async function saveScoreToSupabase(username, score) {
  if (!ENABLE_SUPABASE || !supabaseClient) return null;
  try {
    const payload = { username: username || 'Anonymous', score: Math.floor(score), size: currentMode };
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

async function getMonthlyTopScores(limit = 3) {
  if (!ENABLE_SUPABASE || !supabaseClient) return [];
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  try {
    const { data, error } = await supabaseClient
      .from('scores')
      .select('username,score,timestamp')
      .eq('size', currentMode)
      .gte('timestamp', firstDay)
      .order('score', { ascending: true })
      .limit(limit);
    if (error) { console.error('Supabase monthly scores error', error); return []; }
    return data;
  } catch (err) { console.error(err); return []; }
}

async function getAllTimeTopScore() {
  if (!ENABLE_SUPABASE || !supabaseClient) return null;
  try {
    const { data, error } = await supabaseClient
      .from('scores')
      .select('username,score')
      .eq('size', currentMode)
      .order('score', { ascending: true })
      .limit(1);
    if (error || !data || data.length === 0) return null;
    return data[0];
  } catch (err) { console.error(err); return null; }
}

// --- Leaderboard UI ---
function renderLeaderboard(monthly, alltime) {
  const atEl = document.getElementById('allTimeScore');
  if (atEl) {
    if (alltime) {
      atEl.textContent = '\u2605 ' + (alltime.username || 'Anonymous') + ' \u2014 ' + formatTime(Number(alltime.score));
    } else {
      atEl.textContent = '—';
    }
  }

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
    const local = localStorage.getItem('meilleurTemps_' + currentMode);
    const list = local ? [{ username: 'Local', score: Number(local) }] : [];
    renderLeaderboard(list, list[0] || null);
  }
}

function showPunchText(text) {
  const el = document.getElementById('punchText');
  if (!el) return;
  el.textContent = text;
  el.classList.remove('playing');
  void el.offsetWidth;
  el.classList.add('playing');
  el.addEventListener('animationend', () => el.classList.remove('playing'), { once: true });
}

function showLeaderboard() {
  document.getElementById('leaderboard').classList.remove('lb-collapsed');
}
function hideLeaderboard() {
  document.getElementById('leaderboard').classList.add('lb-collapsed');
}
function toggleLeaderboard() {
  document.getElementById('leaderboard').classList.toggle('lb-collapsed');
}

document.addEventListener('DOMContentLoaded', function () {
  const savedMode = localStorage.getItem("mode") || 'Mini';
  modeMAJ(savedMode);
  setTimeout(hideLeaderboard, 2000);
});

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
