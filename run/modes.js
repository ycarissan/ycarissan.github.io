var levels = ['1coup', '2coups'];
var selectLevel = { value: '1coup' };

function menuLevelFactory() {
  const container = document.createElement('div');
  container.className = 'mode-selector';
  const current = lireLevel() || '1coup';
  levels.forEach(function(l) {
    const btn = document.createElement('button');
    btn.className = 'mode-btn' + (l === current ? ' active' : '');
    btn.textContent = levelLabel(l);
    btn.dataset.level = l;
    btn.addEventListener('click', function() {
      levelMAJ(l);
    });
    container.appendChild(btn);
  });
  return container;
}

function levelLabel(l) {
  return l === '1coup' ? '1 coup' : l === '2coups' ? '2 coups' : l;
}

function lireLevel() {
  return localStorage.getItem('run_level') || '1coup';
}

function saveLevel(val) {
  localStorage.setItem('run_level', val);
}

function levelMAJ(val) {
  selectLevel.value = val;
  saveLevel(val);
  document.querySelectorAll('.mode-btn').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.level === val);
  });
  if (typeof window.onLevelChange === 'function') window.onLevelChange(val);
}
