// Time and duration formatting helpers
// Convert minutes to a formatted hours and minutes string
export const minsToHrs = (minutes) => {
  if (!minutes || minutes <= 0) return '0 min';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
};

// Format a decimal hours value to a display string
export const formatDuration = (hours) => {
  if (!hours || hours <= 0) return '0 hr';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
};

// Calculate the difference in hours between two HH:MM time strings (handles midnight crossover)
export const timeDiff = (sleepTime, wakeTime) => {
  if (!sleepTime || !wakeTime) return 0;
  const [sh, sm] = sleepTime.split(':').map(Number);
  const [wh, wm] = wakeTime.split(':').map(Number);
  let sleepMins = sh * 60 + sm;
  let wakeMins = wh * 60 + wm;
  if (wakeMins <= sleepMins) wakeMins += 24 * 60; // crosses midnight
  return Math.round(((wakeMins - sleepMins) / 60) * 10) / 10;
};

// Check if a given sleep/wake time combo hit a target
export const didHitTarget = (sleepTime, wakeTime, targetSleep, targetWake, toleranceMinutes = 30) => {
  if (!sleepTime || !wakeTime || !targetSleep || !targetWake) return false;
  const toMins = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const sleepDiff = Math.abs(toMins(sleepTime) - toMins(targetSleep));
  const wakeDiff = Math.abs(toMins(wakeTime) - toMins(targetWake));
  return sleepDiff <= toleranceMinutes && wakeDiff <= toleranceMinutes;
};
