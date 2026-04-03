var modes = ["Mini", "Espoir", "Top"];
var select = { value: 'Mini' }; // kept for compatibility with getMode()

function menuModeFactory() {
	const container = document.createElement('div');
	container.className = 'mode-selector';
	const current = lireMode() || 'Mini';
	modes.forEach(function(m) {
		const btn = document.createElement('button');
		btn.className = 'mode-btn' + (m === current ? ' active' : '');
		btn.textContent = m;
		btn.dataset.mode = m;
		btn.addEventListener('click', function() {
			modeMAJ(m);
		});
		container.appendChild(btn);
	});
	return container;
}

function buttonValidModeFactory() {
	// No longer needed — mode changes instantly on click
	return document.createDocumentFragment();
}

function getMode() {
	return select.value;
}

function modeMAJ(val) {
	select.value = val;
	sauveMode(val);
	// Update active button
	document.querySelectorAll('.mode-btn').forEach(function(btn) {
		btn.classList.toggle('active', btn.dataset.mode === val);
	});
	if (typeof window.placePieces === 'function') window.placePieces();
}
