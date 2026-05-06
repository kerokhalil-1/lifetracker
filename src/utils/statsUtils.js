// Statistics calculation helpers for streaks, completion, and averages
import { parseISO, differenceInCalendarDays, format } from 'date-fns';
import { today } from './dateUtils.js';

// Calculate the current consecutive streak of days that had at least one task done
export const calcStreak = (dayRecords) => {
  if (!dayRecords.length) return 0;
  const sorted = [...dayRecords].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  let expected = today();
  for (const rec of sorted) {
    if (rec.date === expected && rec.hasDone) {
      streak++;
      const d = parseISO(expected);
      d.setDate(d.getDate() - 1);
      expected = format(d, 'yyyy-MM-dd'); // bug #9 fix: use date-fns format, not toISOString (UTC issue)
    } else {
      break;
    }
  }
  return streak;
};

// Calculate completion percentage given done count and total
export const calcCompletionPct = (done, total) => {
  if (!total) return 0;
  return Math.round((done / total) * 100);
};

// Calculate the simple average of an array of numbers
export const calcAverage = (nums) => {
  if (!nums.length) return 0;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10;
};

// Count how many sleep logs hit their target
export const countSleepTargetHits = (logs) => logs.filter((l) => l.hitTarget).length;

// Calculate the study streak (consecutive days with at least 1 done task)
// Bug #9 fix: any failed expectation breaks the streak immediately — no silent fall-through
export const calcStudyStreak = (tasksByDate) => {
  const dates = Object.keys(tasksByDate).sort((a, b) => b.localeCompare(a));
  if (!dates.length) return 0;
  let streak = 0;
  let expected = today();
  for (const date of dates) {
    const diff = differenceInCalendarDays(parseISO(expected), parseISO(date));
    if (diff !== 0) break;                              // skipped a day → stop
    if (!tasksByDate[date].some((t) => t.done)) break; // no done task → stop
    streak++;
    const d = parseISO(expected);
    d.setDate(d.getDate() - 1);
    expected = format(d, 'yyyy-MM-dd'); // use date-fns format, not toISOString (UTC issue)
  }
  return streak;
};

// Group an array of items by a key function
export const groupBy = (arr, keyFn) =>
  arr.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
