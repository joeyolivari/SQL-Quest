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

export function loadMission(mission, index, briefing) {
  document.getElementById('missionTitle').textContent = mission.title;
  document.getElementById('missionDesc').textContent = mission.task;
  const cfBox = document.getElementById('casefileBox');
  if (cfBox) cfBox.textContent = briefing || '';

  const diff = mission.difficulty.toLowerCase();
  document.getElementById('badgeRow').innerHTML =
    `<span class="difficulty-badge ${diff}">${escapeHtml(mission.difficulty)}</span>` +
    `<span class="badge scenario-badge">${escapeHtml(mission.scenario)}</span>` +
    mission.concepts.map(c => `<span class="badge">${escapeHtml(c)}</span>`).join('');

  const label = document.getElementById('scenarioLabel');
  if (label) label.textContent = mission.scenario;

  hideMessages();
  hideSolutionBox();
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
  ['errorBox', 'successBox', 'learnBox', 'summaryPanel'].forEach(id =>
    document.getElementById(id).classList.remove('visible')
  );
  if (includeHint) document.getElementById('hintBox').classList.remove('visible');
}

export function showSummaryPanel({ rating, points, attempts, hintsUsed, timeTaken, concepts }) {
  const panel = document.getElementById('summaryPanel');
  panel.dataset.rating = rating;
  document.getElementById('summaryRating').textContent = rating;
  document.getElementById('summaryPoints').textContent = '+' + points;
  document.getElementById('summaryAttempts').textContent = attempts;
  document.getElementById('summaryHints').textContent = hintsUsed;
  document.getElementById('summaryTime').textContent = formatTime(timeTaken);
  document.getElementById('summaryConcepts').innerHTML =
    (concepts || []).map(c => `<span class="summary-concept">${escapeHtml(c)}</span>`).join('');
  panel.classList.add('visible');
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

export function formatTime(secs) {
  const m = Math.floor(secs / 60), s = secs % 60;
  return m + ':' + String(s).padStart(2, '0');
}

export function updateTimer(secs) {
  const el = document.getElementById('timer');
  if (el) el.textContent = formatTime(secs);
}

export function showWinModal(score, earnedBadges, total, totalTime, difficulty) {
  document.getElementById('finalScore').textContent = score;
  const timeEl = document.getElementById('certTime');
  if (timeEl) timeEl.textContent = formatTime(totalTime || 0);
  const diffEl = document.getElementById('certDifficulty');
  if (diffEl) diffEl.textContent = difficulty ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1) : '—';
  const totalEl2 = document.getElementById('certTotal');
  if (totalEl2) totalEl2.textContent = total;
  const badgesEl = document.getElementById('certBadges');
  if (badgesEl && earnedBadges) {
    const ICONS = { 'first-case': '🗂️', 'no-mistakes': '🎯', 'clean-hands': '🧤', 'halfway': '⚡', 'audit-ready': '🏆' };
    badgesEl.textContent = earnedBadges.size
      ? [...earnedBadges].map(id => ICONS[id] || '🏅').join(' ')
      : '—';
  }
  document.getElementById('winModal').classList.add('visible');
}

export function renderRecommendation(rec, onClick) {
  const sec = document.getElementById('recommendSection');
  if (!sec) return;
  if (!rec) { sec.style.display = 'none'; return; }

  document.getElementById('recommendReason').textContent = rec.reason;
  document.getElementById('recommendMission').textContent =
    rec.mission.title + ' · ' + rec.mission.difficulty;

  // Replace button to discard any previous click listener
  const old = document.getElementById('btnRecommend');
  const btn = old.cloneNode(true);
  old.replaceWith(btn);
  btn.addEventListener('click', onClick);

  sec.style.display = 'flex';
}

export function showContinueSection(info) {
  const sec = document.getElementById('continueSection');
  if (sec) sec.style.display = 'flex';
  const infoEl = document.getElementById('continueInfo');
  if (infoEl) infoEl.textContent = info;
}

export function showHomeError(msg) {
  const el = document.getElementById('homeError');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}

export function renderLearningDashboard(summary) {
  const el = document.getElementById('learningDashboard');
  if (!el || !summary) return;

  const strongest = renderSkillList(summary.strongest, 'No completed skills yet');
  const weakest = renderSkillList(summary.weakest, 'Complete a mission to reveal weak spots');
  const skills = summary.skills.map(skill => `
    <div class="mastery-row">
      <div class="mastery-row-top">
        <span>${escapeHtml(skill.label)}</span>
        <strong>${skill.mastery}%</strong>
      </div>
      <div class="mastery-track"><span style="width:${skill.mastery}%"></span></div>
    </div>
  `).join('');

  el.innerHTML = `
    <div class="learning-summary">
      <div class="learning-metric">
        <span>Total Completed</span>
        <strong>${summary.totalCompleted}/${summary.totalMissions}</strong>
      </div>
      <div class="learning-recommendation">
        <span>Recommended Next Review</span>
        <strong>${escapeHtml(summary.recommended.skillLabel)}</strong>
        <small>${summary.recommended.missionId ? 'Mission ' + summary.recommended.missionId + ': ' : ''}${escapeHtml(summary.recommended.missionTitle)}</small>
      </div>
    </div>
    <div class="learning-columns">
      <div>
        <h4>Strongest Skills</h4>
        ${strongest}
      </div>
      <div>
        <h4>Weakest Skills</h4>
        ${weakest}
      </div>
    </div>
    <div class="mastery-list">
      <h4>Mastery By Skill</h4>
      ${skills}
    </div>
  `;
}

function renderSkillList(skills, emptyText) {
  if (!skills.length) return `<p class="learning-empty">${escapeHtml(emptyText)}</p>`;

  return `<div class="skill-pill-list">${skills.map(skill => `
    <div class="skill-pill">
      <span>${escapeHtml(skill.label)}</span>
      <strong>${skill.mastery}%</strong>
    </div>
  `).join('')}</div>`;
}

export function renderMissionList(missions, onClick) {
  const el = document.getElementById('missionList');
  if (!el) return;
  el.innerHTML = missions.map((m, i) => {
    const diff = m.difficulty.toLowerCase();
    const concepts = m.concepts.slice(0, 3)
      .map(c => `<span class="mission-concept">${escapeHtml(c)}</span>`).join('');
    return `<button class="mission-item" data-idx="${i}">
      <span class="mission-item-num">${i + 1}</span>
      <span class="mission-item-body">
        <span class="mission-item-title">${escapeHtml(m.title)}</span>
        <span class="mission-item-concepts">${concepts}</span>
      </span>
      <span class="mission-item-badge ${escapeHtml(diff)}">${escapeHtml(m.difficulty)}</span>
    </button>`;
  }).join('');
  el.onclick = e => {
    const btn = e.target.closest('.mission-item');
    if (btn) onClick(parseInt(btn.dataset.idx, 10));
  };
}

export function renderKeywordBar(keywords, onInsert) {
  const el = document.getElementById('keywordBar');
  if (!el) return;
  el.innerHTML = keywords.map(kw =>
    `<button class="kw-chip" data-kw="${escapeHtml(kw.label)}">${escapeHtml(kw.label)}</button>`
  ).join('');
  el.addEventListener('click', e => {
    const chip = e.target.closest('.kw-chip');
    if (!chip) return;
    const kw = keywords.find(k => k.label === chip.dataset.kw);
    if (kw) onInsert(kw);
  });
}

export function hideHomeScreen() {
  const hs = document.getElementById('homeScreen');
  if (hs) hs.style.display = 'none';
  const gc = document.querySelector('.game-container');
  if (gc) gc.style.removeProperty('display');
  // Let CSS control mobile tab bar visibility
  const tabs = document.getElementById('mobileTabs');
  if (tabs) tabs.style.removeProperty('display');
}

export function showHomeScreen() {
  const hs = document.getElementById('homeScreen');
  if (hs) hs.style.display = 'flex';
  const gc = document.querySelector('.game-container');
  if (gc) gc.style.display = 'none';
  // Always hide tab bar on home screen (it lives inside game-container
  // but is position:fixed so CSS parent hiding doesn't apply)
  const tabs = document.getElementById('mobileTabs');
  if (tabs) tabs.style.display = 'none';
}

export function showBadgeToast(badge) {
  const toast = document.getElementById('badgeToast');
  if (!toast) return;
  toast.innerHTML =
    `<span class="toast-icon">${badge.icon}</span>` +
    `<div><div class="toast-label">Badge Unlocked: ${escapeHtml(badge.label)}</div>` +
    `<div class="toast-desc">${escapeHtml(badge.desc)}</div></div>`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

export function renderScenarioCards(scenarios, onClick) {
  const grid = document.getElementById('scenarioGrid');
  if (!grid) return;
  grid.innerHTML = scenarios.map(sc =>
    `<div class="scenario-card" data-scenario="${escapeHtml(sc.id)}" style="border-color:${sc.color}">` +
    `<h4>${escapeHtml(sc.name)}</h4>` +
    `<p>${escapeHtml(sc.description)}</p></div>`
  ).join('');
  grid.addEventListener('click', e => {
    const card = e.target.closest('.scenario-card');
    if (!card) return;
    grid.querySelectorAll('.scenario-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    onClick(card.dataset.scenario);
  });
}

export function renderTutorialCards(tutorials) {
  document.getElementById('tutorialCards').innerHTML =
    '<div class="tutorial-grid">' +
    tutorials.map(t => `
      <div class="tutorial-card">
        <h4>${escapeHtml(t.concept)}</h4>
        <p>${escapeHtml(t.summary)}</p>
        <div class="eli12-box"><span class="eli12-label">ELI12</span>${escapeHtml(t.eli12)}</div>
        <pre>${escapeHtml(t.example)}</pre>
        <div class="compliance-use">${escapeHtml(t.complianceUse)}</div>
      </div>
    `).join('') +
    '</div>';
}
