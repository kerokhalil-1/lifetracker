// Helpers for study session timing, formatting, and stat computation

// Format a total-seconds count into a MM:SS or H:MM:SS clock string
export const formatClock = (totalSeconds) => {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(sec).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};

// Format seconds into a short human label: "45s", "12m", "1h 30m"
export const formatDurationSec = (totalSeconds) => {
  const s = Math.max(0, Math.floor(totalSeconds));
  if (s < 60) return `${s}s`;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

// Convert seconds to fractional minutes (for goal progress calculations)
export const secondsToMinutes = (s) => Math.round((s || 0) / 60);

// Given a Firestore Timestamp or plain ms number, return epoch ms
const toMillis = (v) => {
  if (!v) return 0;
  if (typeof v.toMillis === 'function') return v.toMillis();
  if (typeof v === 'number') return v;
  return 0;
};

// Recompute live work seconds for a running session after a page reload
export const computeElapsedWork = (session) => {
  if (!session) return 0;
  const base = session.totalWorkSeconds || 0;
  if (session.status === 'running') {
    const resumedAt = toMillis(session.lastResumedAt);
    if (resumedAt) return base + Math.floor((Date.now() - resumedAt) / 1000);
  }
  return base;
};

// Recompute live break seconds for a paused session after a page reload
export const computeElapsedBreak = (session) => {
  if (!session || session.status !== 'paused') return 0;
  const pausedAt = toMillis(session.pausedAt);
  if (!pausedAt) return 0;
  return Math.floor((Date.now() - pausedAt) / 1000);
};

// Derive a summary stats object from a finished session document
export const getSessionStats = (session) => ({
  workMin: secondsToMinutes(session.totalWorkSeconds || 0),
  breakMin: secondsToMinutes(session.totalBreakSeconds || 0),
  pauseCount: session.pauseCount || 0,
  breakCount: (session.breakSessions || []).length,
});
