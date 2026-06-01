// Learning Center screen component
// Keeps the Learning Center markup out of index.html while preserving the same IDs
// that app.js uses for navigation, mode buttons, and dashboard rendering.
//
// This file builds the Learning Center and adds fallback click behavior so the
// buttons still respond even if app.js is cached, delayed, or interrupted.

function learningScreenMarkup() {
  return `
<!-- Learning Center (component-rendered screen) -->
<div id="learningScreen" class="learning-screen" style="display:none">
  <div class="learning-page-hero">
    <button class="btn-home" id="btnLearningBack" type="button" data-learning-close="true">&#8592; Main Menu</button>
    <div class="learning-page-kicker">Accelerated Learning</div>
    <h1 class="learning-page-title">Learning <span>Center</span></h1>
    <p class="learning-page-tagline">Track your SQL skill mastery and tune how your next missions are ordered.</p>
  </div>

  <div class="home-section">
    <div class="section-row">
      <h3>Learning Dashboard</h3>
      <span class="section-hint">Skill progress from completed missions</span>
    </div>
    <div id="learningDashboard" class="learning-dashboard"></div>
  </div>

  <div class="home-section">
    <div class="section-row">
      <h3>Learning Mode</h3>
      <span class="section-hint">Controls how missions are ordered on the menu</span>
    </div>
    <div class="mode-row" id="learningModeOptions">
      <button class="mode-btn selected" type="button" data-mode="story">
        <span class="mode-icon">&#128218;</span>
        <span class="mode-label">Story Mode</span>
        <span class="mode-desc">Play missions in order</span>
      </button>
      <button class="mode-btn" type="button" data-mode="training">
        <span class="mode-icon">&#127919;</span>
        <span class="mode-label">Training Mode</span>
        <span class="mode-desc">Start with your weakest skills</span>
      </button>
      <button class="mode-btn" type="button" data-mode="review">
        <span class="mode-icon">&#128260;</span>
        <span class="mode-label">Review Mode</span>
        <span class="mode-desc">Revisit failed or low-mastery skills</span>
      </button>
    </div>
  </div>

  <div class="home-footer">
    <button class="btn-lg btn-primary" id="btnLearningApply" type="button" data-learning-close="true">&#8594; Back to Missions</button>
  </div>
</div>`;
}

function renderLearningScreen() {
  if (document.getElementById('learningScreen')) return document.getElementById('learningScreen');

  const mount = document.getElementById('learningScreenMount');
  if (mount) {
    mount.outerHTML = learningScreenMarkup();
    return document.getElementById('learningScreen');
  }

  const home = document.getElementById('homeScreen');
  if (home) {
    home.insertAdjacentHTML('afterend', learningScreenMarkup());
    return document.getElementById('learningScreen');
  }

  return null;
}

function fallbackOpenLearningCenter() {
  const screen = renderLearningScreen();
  const home = document.getElementById('homeScreen');
  if (home) home.style.display = 'none';
  if (screen) screen.style.display = 'flex';
  window.scrollTo(0, 0);
}

function fallbackCloseLearningCenter() {
  const screen = document.getElementById('learningScreen');
  const home = document.getElementById('homeScreen');
  if (screen) screen.style.display = 'none';
  if (home) home.style.display = 'flex';
  window.scrollTo(0, 0);
}

function fallbackSelectMode(modeBtn) {
  const screen = document.getElementById('learningScreen');
  if (!screen || !modeBtn) return;
  const mode = modeBtn.dataset.mode;

  // Prefer the real handler from app.js so the chosen mode actually reorders the
  // mission list and updates the launcher meta — not just the visual selection.
  if (mode && typeof window.applyLearningMode === 'function') {
    window.applyLearningMode(mode);
    return;
  }

  // Cosmetic-only fallback if app.js is unavailable.
  screen.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('selected'));
  modeBtn.classList.add('selected');

  const meta = document.getElementById('learningLaunchMeta');
  if (meta && mode) {
    const label = mode.charAt(0).toUpperCase() + mode.slice(1);
    meta.textContent = meta.textContent.replace(/^(Story|Training|Review) Mode/, `${label} Mode`);
  }
}

function wireLearningScreenFallbacks() {
  if (window.__learningScreenFallbacksWired) return;
  window.__learningScreenFallbacksWired = true;

  document.addEventListener('click', event => {
    const openBtn = event.target.closest('#btnOpenLearning');
    if (openBtn) {
      setTimeout(() => {
        const screen = document.getElementById('learningScreen');
        if (!screen || screen.style.display === 'none' || !screen.style.display) {
          fallbackOpenLearningCenter();
        }
      }, 0);
      return;
    }

    const closeBtn = event.target.closest('[data-learning-close="true"]');
    if (closeBtn) {
      setTimeout(() => {
        const screen = document.getElementById('learningScreen');
        if (screen && screen.style.display !== 'none') {
          fallbackCloseLearningCenter();
        }
      }, 0);
      return;
    }

    const modeBtn = event.target.closest('#learningScreen .mode-btn');
    if (modeBtn) {
      setTimeout(() => {
        if (!modeBtn.classList.contains('selected')) {
          fallbackSelectMode(modeBtn);
        }
      }, 0);
    }
  });
}

// Expose a tiny safe hook for app.js. This avoids fragile timing issues.
window.ensureLearningScreen = renderLearningScreen;

// At the bottom of index.html, #learningScreenMount already exists when this
// script runs, so render immediately. Keep DOMContentLoaded as a fallback only.
if (!renderLearningScreen() && document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderLearningScreen, { once: true });
}

wireLearningScreenFallbacks();
