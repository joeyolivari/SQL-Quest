const MASTERY_KEY = 'csq_mastery_v1';

// In-memory store: { [concept]: { attempts, correct, hintsUsed, mistakeTypes } }
let mastery = {};

// ── Persistence ───────────────────────────────────────────────────────────────

export function loadMastery() {
  try {
    const raw = localStorage.getItem(MASTERY_KEY);
    mastery = raw ? JSON.parse(raw) : {};
  } catch {
    mastery = {};
  }
  return mastery;
}

export function saveMastery() {
  try {
    localStorage.setItem(MASTERY_KEY, JSON.stringify(mastery));
  } catch { /* quota exceeded — silently ignore */ }
}

export function clearMastery() {
  mastery = {};
  try { localStorage.removeItem(MASTERY_KEY); } catch { /* ignore */ }
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function ensureConcept(concept) {
  if (!mastery[concept]) {
    mastery[concept] = { attempts: 0, correct: 0, hintsUsed: 0, mistakeTypes: {} };
  }
}

function forEachConcept(concepts, fn) {
  if (!concepts?.length) return;
  concepts.forEach(c => { ensureConcept(c); fn(mastery[c]); });
}

// ── Mastery score (0–1) ───────────────────────────────────────────────────────

export function computeScore({ attempts, correct, hintsUsed }) {
  if (attempts === 0) return 0;
  const base = correct / attempts;
  const hintPenalty = Math.min(hintsUsed, 5) * 0.05;
  return Math.max(0, Math.min(1, base - hintPenalty));
}

// ── Recording events ──────────────────────────────────────────────────────────

export function recordMasteryAttempt(concepts) {
  forEachConcept(concepts, c => { c.attempts++; });
  saveMastery();
}

export function recordMasterySuccess(concepts) {
  forEachConcept(concepts, c => { c.correct++; });
  saveMastery();
}

export function recordMasteryHint(concepts) {
  forEachConcept(concepts, c => { c.hintsUsed++; });
  saveMastery();
}

export function recordMasteryMistake(concepts, mistakeType) {
  forEachConcept(concepts, c => {
    c.mistakeTypes[mistakeType] = (c.mistakeTypes[mistakeType] || 0) + 1;
  });
  saveMastery();
}

// ── Querying ──────────────────────────────────────────────────────────────────

export function getMastery(concept) {
  ensureConcept(concept);
  const data = mastery[concept];
  return { ...data, score: computeScore(data) };
}

export function getAllMastery() {
  return Object.fromEntries(
    Object.entries(mastery).map(([c, data]) => [c, { ...data, score: computeScore(data) }])
  );
}
