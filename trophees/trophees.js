const SUPABASE_URL = 'https://eetumbczoiqahhytetys.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVldHVtYmN6b2lxYWhoeXRldHlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMjMwNDksImV4cCI6MjA5MDY5OTA0OX0.PLVoHK9mpNCOV45lBKCEIMKuVwR5oJsc7HLawemzk8E';

const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function formatTime(ms) {
  if (ms == null) return '—';
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  const msec = Math.floor((ms % 1000) / 10);
  return m > 0
    ? m + 'min ' + String(sec).padStart(2,'0') + 's'
    : sec + 's' + String(msec).padStart(2,'0');
}

const medals = ['🥇', '🥈', '🥉'];

async function loadBoard(size, listEl) {
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { data, error } = await db
    .from('scores')
    .select('username, score, created_at')
    .eq('size', String(size))
    .gte('created_at', firstOfMonth)
    .order('score', { ascending: true })
    .limit(5);

  if (error || !data || data.length === 0) {
    listEl.innerHTML = '<li class="empty">Aucun score ce mois-ci</li>';
    return;
  }

  listEl.innerHTML = data.map((row, i) =>
    `<li>
      <span class="medal">${medals[i] || (i + 1) + '.'}</span>
      <span class="player">${row.username || 'Anonyme'}</span>
      <span class="time">${formatTime(row.score)}</span>
    </li>`
  ).join('');
}

async function loadAllBoards() {
  const tasks = [
    { size: '2x2',   el: document.getElementById('memory-2x2') },
    { size: '4x3',   el: document.getElementById('memory-4x3') },
    { size: '4x4',   el: document.getElementById('memory-4x4') },
    { size: '6x6',   el: document.getElementById('memory-6x6') },
    { size: '8x8',   el: document.getElementById('memory-8x8') },
    { size: 'Mini',  el: document.getElementById('vision-Mini') },
    { size: 'Espoir',el: document.getElementById('vision-Espoir') },
    { size: 'Top',   el: document.getElementById('vision-Top') },
  ];
  await Promise.all(tasks.map(t => loadBoard(t.size, t.el)));
}

loadAllBoards();
