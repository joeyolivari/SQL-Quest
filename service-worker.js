/**
 * SQL Quest Service Worker — PWA offline support
 *
 * Strategy:
 *  - App shell (local files): Cache-First, fall back to network
 *  - CDN resources (sql.js): Network-First, fall back to cached copy
 *
 * Bump CACHE_VERSION to force all clients to pick up new files on deploy.
 */

const CACHE_VERSION = 'csq-v3';
const CDN_CACHE = 'csq-cdn-v1';

// Build absolute URLs relative to this SW's location so the same
// paths work on both localhost and GitHub Pages (/SQL-Quest/).
const BASE = new URL('./', self.location).href;

const APP_SHELL = [
  BASE,
  BASE + 'index.html',
  BASE + 'manifest.webmanifest',
  BASE + 'css/styles.css',
  BASE + 'css/editor.css',
  BASE + 'css/base.css',
  BASE + 'css/theme.css',
  BASE + 'css/layout.css',
  BASE + 'css/components.css',
  BASE + 'css/learning.css',
  BASE + 'css/sandbox.css',
  BASE + 'css/mobile.css',
  BASE + 'js/features/app.js',
  BASE + 'js/features/badges.js',
  BASE + 'js/features/sandbox.js',
  BASE + 'js/core/editor.js',
  BASE + 'js/lib/codemirror-sql.js',
  BASE + 'js/core/sqlEngine.js',
  BASE + 'js/core/gameState.js',
  BASE + 'js/core/validation.js',
  BASE + 'js/core/diagnostics.js',
  BASE + 'js/data/missions.js',
  BASE + 'js/data/schema.js',
  BASE + 'js/data/data.js',
  BASE + 'js/data/casefiles.js',
  BASE + 'js/data/scenarios.js',
  BASE + 'js/data/tutorial.js',
  BASE + 'js/learning/masteryTracker.js',
  BASE + 'js/learning/adaptiveQueue.js',
  BASE + 'js/learning/hintEngine.js',
  BASE + 'js/learning/diagnostics.js',
  BASE + 'js/learning/skillMap.js',
  BASE + 'js/learning/dashboard.js',
  BASE + 'js/learning/sqlUsageTracker.js',
  BASE + 'js/ui/ui.js',
  BASE + 'assets/icons/icon-192.svg',
  BASE + 'assets/icons/icon-512.svg',
  BASE + 'assets/icons/icon-maskable.svg',
  BASE + 'assets/images/difficulty/beginner-card.png',
  BASE + 'assets/images/difficulty/intermediate-card.png',
  BASE + 'assets/images/difficulty/advanced-card.png',
  BASE + 'assets/images/difficulty/all-levels-card.png',
];

// ── Install: pre-cache the app shell ─────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: remove stale caches from previous versions ─────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_VERSION && key !== CDN_CACHE)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;

  // Only intercept GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // CDN resources (sql.js + WASM): network-first so updates are picked up,
  // cached copy keeps the game working offline after first load.
  if (url.origin !== self.location.origin) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(CDN_CACHE).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Local app files: cache-first, fall back to network then cache the result.
  event.respondWith(
    caches.match(request)
      .then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(request, clone));
          return response;
        });
      })
  );
});
