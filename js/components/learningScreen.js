// Learning Center screen component
// Keeps the Learning Center markup out of index.html while preserving the same IDs
// that app.js already uses for navigation, mode buttons, and dashboard rendering.

function learningScreenMarkup() {
  return `
<!-- Learning Center (component-rendered screen) -->
<div id="learningScreen" class="learning-screen" style="display:none">
  <div class="learning-page-hero">
    <button class="btn-home" id="btnLearningBack">&#8592; Main Menu</button>
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
      <button class="mode-btn selected" data-mode="story">
        <span class="mode-icon">&#128218;</span>
        <span class="mode-label">Story Mode</span>
        <span class="mode-desc">Play missions in order</span>
      </button>
      <button class="mode-btn" data-mode="training">
        <span class="mode-icon">&#127919;</span>
        <span class="mode-label">Training Mode</span>
        <span class="mode-desc">Start with your weakest skills</span>
      </button>
      <button class="mode-btn" data-mode="review">
        <span class="mode-icon">&#128260;</span>
        <span class="mode-label">Review Mode</span>
        <span class="mode-desc">Revisit failed or low-mastery skills</span>
      </button>
    </div>
  </div>

  <div class="home-footer">
    <button class="btn-lg btn-primary" id="btnLearningApply">&#8594; Back to Missions</button>
  </div>
</div>`;
}

function renderLearningScreen() {
  if (document.getElementById('learningScreen')) return;

  const mount = document.getElementById('learningScreenMount');
  if (mount) {
    mount.outerHTML = learningScreenMarkup();
    return;
  }

  const home = document.getElementById('homeScreen');
  if (home) {
    home.insertAdjacentHTML('afterend', learningScreenMarkup());
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderLearningScreen, { once: true });
} else {
  renderLearningScreen();
}
