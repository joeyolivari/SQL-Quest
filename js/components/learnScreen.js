// Learn track screen component.
//
// Mirrors js/components/learningScreen.js: it keeps the Learn track markup out
// of index.html, renders it into #learnScreenMount, and adds a defensive
// fallback so the "Learn SQL" button still opens the screen even if the module
// controller (js/features/learn.js) is delayed or cached.
//
// The interactive logic (rendering lessons, checking answers) lives in the
// module file js/features/learn.js, which exposes window.openLearnTrack.

function learnScreenMarkup() {
  return `
<!-- Learn Track (component-rendered screen) -->
<div id="learnScreen" class="learn-screen" style="display:none">
  <div class="learn-hero">
    <button class="btn-home" id="btnLearnBack" type="button" data-learn-close="true">&#8592; Main Menu</button>
    <div class="learn-kicker">Learn SQL &middot; Zero to Mission-Ready</div>
    <h1 class="learn-title">Learn <span>Track</span></h1>
    <p class="learn-tagline">Tiny lessons that build on each other. Tap, fill in the blank, then write real SQL.</p>
  </div>

  <!-- MAP VIEW: units and their lesson paths -->
  <div id="learnMapView" class="learn-map-view">
    <div id="learnUnits" class="learn-units"></div>
  </div>

  <!-- LESSON PLAYER VIEW: one step at a time -->
  <div id="learnPlayerView" class="learn-player-view" style="display:none">
    <div class="learn-player-top">
      <button class="btn-home" id="btnLearnExitLesson" type="button">&#8592; Path</button>
      <div class="learn-progress-track"><span id="learnProgressFill" class="learn-progress-fill"></span></div>
      <span id="learnProgressLabel" class="learn-progress-label"></span>
    </div>

    <div id="learnLessonTitle" class="learn-lesson-title"></div>
    <div id="learnStepHost" class="learn-step-host"></div>

    <div id="learnFeedback" class="learn-feedback" hidden></div>

    <div class="learn-actions">
      <button id="btnLearnHint" class="btn-secondary learn-hint-btn" type="button" hidden>&#128161; Hint</button>
      <button id="btnLearnCheck" class="btn-lg btn-primary" type="button">Check</button>
      <button id="btnLearnContinue" class="btn-lg btn-primary" type="button" hidden>Continue &#8594;</button>
    </div>
  </div>
</div>`;
}

function renderLearnScreen() {
  if (document.getElementById('learnScreen')) return document.getElementById('learnScreen');

  const mount = document.getElementById('learnScreenMount');
  if (mount) {
    mount.outerHTML = learnScreenMarkup();
    return document.getElementById('learnScreen');
  }

  const home = document.getElementById('homeScreen');
  if (home) {
    home.insertAdjacentHTML('afterend', learnScreenMarkup());
    return document.getElementById('learnScreen');
  }

  return null;
}

function fallbackOpenLearnTrack() {
  const screen = renderLearnScreen();
  const home = document.getElementById('homeScreen');
  const game = document.querySelector('.game-container');
  if (home) home.style.display = 'none';
  if (game) game.style.display = 'none';
  if (screen) screen.style.display = 'flex';
  window.scrollTo(0, 0);
}

function fallbackCloseLearnTrack() {
  const screen = document.getElementById('learnScreen');
  const home = document.getElementById('homeScreen');
  if (screen) screen.style.display = 'none';
  if (home) home.style.display = 'flex';
  window.scrollTo(0, 0);
}

function wireLearnScreenFallbacks() {
  if (window.__learnScreenFallbacksWired) return;
  window.__learnScreenFallbacksWired = true;

  document.addEventListener('click', event => {
    const openBtn = event.target.closest('#btnOpenLearn');
    if (openBtn) {
      // app.js normally handles this. Only fall back if the screen never opened
      // (e.g. the module controller was delayed or failed to load).
      setTimeout(() => {
        const screen = document.getElementById('learnScreen');
        if (!screen || screen.style.display === 'none' || !screen.style.display) {
          if (typeof window.openLearnTrack === 'function') window.openLearnTrack();
          else fallbackOpenLearnTrack();
        }
      }, 0);
      return;
    }

    const closeBtn = event.target.closest('#learnScreen [data-learn-close="true"]');
    if (closeBtn) {
      if (typeof window.closeLearnTrack === 'function') {
        window.closeLearnTrack();
        return;
      }
      setTimeout(() => {
        const screen = document.getElementById('learnScreen');
        if (screen && screen.style.display !== 'none') fallbackCloseLearnTrack();
      }, 0);
    }
  });
}

// Safe hook for the module controller.
window.ensureLearnScreen = renderLearnScreen;

if (!renderLearnScreen() && document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderLearnScreen, { once: true });
}

wireLearnScreenFallbacks();
