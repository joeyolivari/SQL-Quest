function escapeHtml(v) {
  return String(v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function formatValue(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'number') return Number.isInteger(v) ? String(v) : v.toFixed(2).replace(/\.00$/, '');
  return String(v);
}

export function renderSchema(schema) {
  const panel = document.getElementById('schemaPanel');
  panel.innerHTML = Object.entries(schema).map(([table, cols]) => `
    <div class="schema-table">
      <div class="schema-header" data-schema-toggle>
        ${escapeHtml(table)} <span>&#9660;</span>
      </div>
      <div class="schema-body">
        ${cols.map(([name, type]) =>
          `<div><span>${escapeHtml(name)}</span><span class="type-tag">${escapeHtml(type)}</span></div>`
        ).join('')}
      </div>
    </div>
  `).join('');

  panel.addEventListener('click', e => {
    const header = e.target.closest('[data-schema-toggle]');
    if (!header) return;
    const box = header.closest('.schema-table');
    box.classList.toggle('collapsed');
    header.querySelector('span').textContent = box.classList.contains('collapsed') ? '▶' : '▼';
  });
}

export function renderProgressDots(completedMissions, currentIndex, total) {
  document.getElementById('progressDots').innerHTML = Array.from({ length: total }, (_, i) => {
    const cls = completedMissions.has(i) ? 'done' : i === currentIndex ? 'current' : '';
    return `<span class="dot ${cls}" title="Level ${i + 1}"></span>`;
  }).join('');
}

export function loadMission(mission, index) {
  document.getElementById('missionTitle').textContent = mission.title;
  document.getElementById('missionDesc').textContent = mission.task;
  document.getElementById('sqlInput').value = mission.starterSQL;

  const diff = mission.difficulty.toLowerCase();
  document.getElementById('badgeRow').innerHTML =
    `<span class="difficulty-badge ${diff}">${escapeHtml(mission.difficulty)}</span>` +
    `<span class="badge scenario-badge">${escapeHtml(mission.scenario)}</span>` +
    mission.concepts.map(c => `<span class="badge">${escapeHtml(c)}</span>`).join('');

  const label = document.getElementById('scenarioLabel');
  if (label) label.textContent = mission.scenario;

  hideMessages();
  hideSolutionBox();
  document.getElementById('btnSolution').disabled = true;
  document.getElementById('btnCheck').disabled = false;
  showNextButton(false);
  renderEmptyResults();
}

export function renderResults(result) {
  const panel = document.getElementById('resultPanel');
  const rowCount = document.getElementById('rowCount');

  if (!result.columns.length) {
    panel.innerHTML = '<div class="empty-state">Query executed, but returned no result table.</div>';
    rowCount.textContent = '';
    return;
  }
  if (!result.rows.length) {
    panel.innerHTML = '<div class="empty-state">Query returned 0 rows.<br><br>Columns: ' +
      result.columns.map(escapeHtml).join(', ') + '</div>';
    rowCount.textContent = '0 rows';
    return;
  }

  const thead = result.columns.map(c => `<th>${escapeHtml(c)}</th>`).join('');
  const tbody = result.rows.map(row =>
    '<tr>' + row.map(v => `<td>${escapeHtml(formatValue(v))}</td>`).join('') + '</tr>'
  ).join('');
  panel.innerHTML = `<table><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table>`;
  rowCount.textContent = result.rows.length + ' row' + (result.rows.length === 1 ? '' : 's');
}

export function renderEmptyResults() {
  document.getElementById('resultPanel').innerHTML = '<div class="empty-state">Run a query to see results.</div>';
  document.getElementById('rowCount').textContent = '';
}

export function renderErrorResult(message) {
  document.getElementById('resultPanel').innerHTML =
    '<div class="empty-state">SQL error:<br><br>' + escapeHtml(message) + '</div>';
  document.getElementById('rowCount').textContent = '';
}

export function showError(message) {
  const box = document.getElementById('errorBox');
  box.textContent = message;
  box.classList.add('visible');
}

export function showSuccess(html) {
  const box = document.getElementById('successBox');
  box.innerHTML = html;
  box.classList.add('visible');
}

export function showHintMessage(text) {
  const box = document.getElementById('hintBox');
  box.textContent = text;
  box.classList.add('visible');
}

export function showExplanation(text) {
  const box = document.getElementById('learnBox');
  box.innerHTML = '<h4>Why this matters</h4><p>' + escapeHtml(text) + '</p>';
  box.classList.add('visible');
}

export function hideMessages(includeHint = true) {
  ['errorBox', 'successBox', 'learnBox'].forEach(id =>
    document.getElementById(id).classList.remove('visible')
  );
  if (includeHint) document.getElementById('hintBox').classList.remove('visible');
}

export function showSolutionBox(sql) {
  const box = document.getElementById('solutionBox');
  box.textContent = sql;
  box.classList.add('visible');
}

export function hideSolutionBox() {
  const box = document.getElementById('solutionBox');
  box.classList.remove('visible');
  box.textContent = '';
}

export function showNextButton(show) {
  document.getElementById('btnNext').style.display = show ? 'inline-block' : 'none';
}

export function updateStats(score, hintsLeft, attempts, levelNum) {
  document.getElementById('score').textContent = score;
  document.getElementById('hintsLeft').textContent = hintsLeft;
  document.getElementById('attempts').textContent = attempts;
  document.getElementById('levelNum').textContent = levelNum;
}

export function launchConfetti() {
  const colors = ['#38bdf8', '#22c55e', '#f59e0b', '#ef4444', '#a78bfa'];
  const container = document.getElementById('celebration');
  container.innerHTML = '';
  container.style.display = 'block';
  for (let i = 0; i < 45; i++) {
    const p = document.createElement('div');
    p.className = 'confetti';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.top = '-12px';
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.animationDelay = Math.random() * 0.35 + 's';
    p.style.animationDuration = (1.7 + Math.random() * 1.2) + 's';
    container.appendChild(p);
  }
  setTimeout(() => { container.style.display = 'none'; container.innerHTML = ''; }, 3200);
}

export function showWinModal(score) {
  document.getElementById('finalScore').textContent = score;
  document.getElementById('winModal').classList.add('visible');
}

export function renderTutorialCards(tutorials) {
  document.getElementById('tutorialCards').innerHTML =
    '<div class="tutorial-grid">' +
    tutorials.map(t => `
      <div class="tutorial-card">
        <h4>${escapeHtml(t.concept)}</h4>
        <p>${escapeHtml(t.summary)}</p>
        <pre>${escapeHtml(t.example)}</pre>
        <div class="compliance-use">${escapeHtml(t.complianceUse)}</div>
      </div>
    `).join('') +
    '</div>';
}
