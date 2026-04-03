var meilleurTemps = 11000002;
let currentLevel = '1coup';

const ENABLE_SUPABASE = true;
const SUPABASE_URL = 'https://eetumbczoiqahhytetys.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVldHVtYmN6b2lxYWhoeXRldHlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMjMwNDksImV4cCI6MjA5MDY5OTA0OX0.PLVoHK9mpNCOV45lBKCEIMKuVwR5oJsc7HLawemzk8E';
let supabaseClient = null;
if (ENABLE_SUPABASE && typeof supabase !== 'undefined') {
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

function loadMeilleurTemps() {
  const stored = localStorage.getItem('run_meilleurTemps_' + currentLevel);
  meilleurTemps = stored ? parseInt(stored) : 11000002;
}

function montreMeilleurTemps() {
  const el = document.getElementById('tempsABattre');
  if (!el) return;
  if (meilleurTemps >= 11000002) {
    el.innerHTML = 'Aucun record';
    return;
  }
  el.innerHTML = 'Meilleur : ' + formatTime(meilleurTemps);
}

async function sauveMeilleurTemps() {
  if (savedTime < meilleurTemps) {
    meilleurTemps = savedTime;
    localStorage.setItem('run_meilleurTemps_' + currentLevel, meilleurTemps);
    montreMeilleurTemps();
    const username = await askPlayerName();
    try { localStorage.setItem('lastPlayerName', username); } catch (e) {}
    if (ENABLE_SUPABASE) {
      saveScoreToSupabase(username, savedTime).catch(e => console.error(e));
    }
  }
}

function razMeilleurTemps() {
  meilleurTemps = 11000002;
  localStorage.setItem('run_meilleurTemps_' + currentLevel, meilleurTemps);
  montreMeilleurTemps();
}

function askPlayerName() {
  return Promise.resolve(localStorage.getItem('lastPlayerName') || 'Anonyme');
}

// Wrap levelMAJ to also update record state
const _levelMAJ_orig = levelMAJ;
levelMAJ = function(val) {
  _levelMAJ_orig(val);
  currentLevel = val || '1coup';
  const tag = document.getElementById('lbLevelTag');
  if (tag) tag.textContent = levelLabel(currentLevel);
  const tagTab = document.getElementById('lbLevelTagTab');
  if (tagTab) tagTab.textContent = levelLabel(currentLevel);
  loadMeilleurTemps();
  montreMeilleurTemps();
  refreshLeaderboard();
};

async function saveScoreToSupabase(username, score) {
  if (!ENABLE_SUPABASE || !supabaseClient) return null;
  try {
    const payload = { username: username || 'Anonyme', score: Math.floor(score), size: currentLevel };
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
      .eq('size', currentLevel)
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
      .eq('size', currentLevel)
      .order('score', { ascending: true })
      .limit(1);
    if (error || !data || data.length === 0) return null;
    return data[0];
  } catch (err) { console.error(err); return null; }
}

function renderLeaderboard(monthly, alltime) {
  const atEl = document.getElementById('allTimeScore');
  if (atEl) {
    atEl.textContent = alltime
      ? '★ ' + (alltime.username || 'Anonyme') + ' — ' + formatTime(Number(alltime.score))
      : '—';
  }
  const ol = document.getElementById('leaderboardList');
  if (!ol) return;
  ol.innerHTML = '';
  const medals = ['🥇', '🥈', '🥉'];
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
    li.innerHTML =
      '<span class="lb-medal">' + (medals[i] || (i + 1) + '.') + '</span>' +
      '<span class="lb-name">' + (row.username || 'Anonyme') + '</span>' +
      '<span class="lb-time">' + formatTime(Number(row.score)) + '</span>';
    ol.appendChild(li);
  });
}

function showLeaderboardStatus(msg) {
  const el = document.getElementById('leaderboardStatus');
  if (el) {
    el.textContent = msg;
    setTimeout(() => { el.textContent = ''; }, 5000);
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
    const local = localStorage.getItem('run_meilleurTemps_' + currentLevel);
    const list = local ? [{ username: 'Local', score: Number(local) }] : [];
    renderLeaderboard(list, list[0] || null);
  }
}

function showLeaderboard() {
  const el = document.getElementById('leaderboard');
  if (el) el.classList.remove('lb-collapsed');
}
function hideLeaderboard() {
  const el = document.getElementById('leaderboard');
  if (el) el.classList.add('lb-collapsed');
}
function toggleLeaderboard() {
  const el = document.getElementById('leaderboard');
  if (el) el.classList.toggle('lb-collapsed');
}

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

document.addEventListener('DOMContentLoaded', function() {
  const savedLvl = lireLevel() || '1coup';
  levelMAJ(savedLvl);
  setTimeout(hideLeaderboard, 2000);
});
