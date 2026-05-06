# Bugs & Issues — Audit Findings

Each section is a self-contained prompt that can be pasted into Claude Code to fix that one issue. Sections are ordered by severity: 🔴 critical · 🟡 important · 🟢 polish.

---

## 🔴 1. Firestore security rules are wide open

**File:** `firestore.rules`

**Problem:**
The rules currently allow anyone on the public internet to read and write every document in the database:
```js
match /{document=**} {
  allow read, write: if true;
}
```
This was set during early development. Since the app has no auth yet, any real personal data (sleep, study sessions, notes) is publicly readable and writable by anyone who finds the project ID.

**Fix prompt to paste:**
> Lock down the Firestore rules in `firestore.rules`. The app has no authentication today, so we cannot key access to a user. Replace the open rule with one that:
> 1. Allows access only when the request comes from the same project (use `request.auth == null` won't help — instead, require an App Check token or a hardcoded shared secret in the request).
> 2. As an interim safer option, change `allow read, write: if true;` to `allow read: if true; allow write: if false;` so at least no one outside the app can mutate data, then add a TODO to gate writes when auth is added.
> Also: add a `// TODO(auth)` comment block at the top of the file noting that proper per-user rules need to be added when auth is introduced (e.g. `request.auth.uid == resource.data.userId`).
> After updating, run `firebase deploy --only firestore:rules`.

---

## 🔴 2. Firebase project / hosting target mismatch

**Files:** `src/services/firebase.js`, `.firebaserc`

**Problem:**
- The Firebase config in `src/services/firebase.js` points the app at project **`lifetracker-app-2026`** (the Firestore database).
- `.firebaserc` also lists `lifetracker-app-2026` as default.
- But the active CLI project (where every recent deploy went) is **`touch-app-7b0d1`** (`firebase use` returns this).
- Hosting is being deployed to `touch-app-7b0d1.web.app`, while data is being read from `lifetracker-app-2026`.
- Worse: the `studyTasks` composite index in `firestore.indexes.json` was deployed to `touch-app-7b0d1` (the wrong project). The real Firestore `lifetracker-app-2026` may not have the index, so `listTasksByDate` could fail in production with "this query requires an index".

**Fix prompt to paste:**
> The app's Firestore config in `src/services/firebase.js` points to project `lifetracker-app-2026`, but `firebase use` shows the active CLI project is `touch-app-7b0d1` and hosting is being deployed there. Decide which project is canonical:
> - If `lifetracker-app-2026` is correct: run `firebase use lifetracker-app-2026`, redeploy hosting + indexes there, and either drop the `touch-app-7b0d1` project or add it as a non-default alias.
> - If `touch-app-7b0d1` is correct: copy the Firebase config from that project's settings into `src/services/firebase.js`, update `.firebaserc` `default` to `touch-app-7b0d1`, and redeploy.
> Either way, after fixing, run `firebase deploy --only firestore:indexes` against the correct project so the `studyTasks` composite index (`scheduledDate ASC + createdAt ASC`) is present where the app actually reads from.
> Verify the `listTasksByDate` query works in production after the fix (no "requires an index" error).

---

## 🔴 3. `useSession.submitFinish` resets the parent course's totals on every save

**File:** `src/hooks/useSession.js` (lines 152–157)

**Problem:**
When a session finishes, the code tries to bump the course's running totals:
```js
await updateCourse(session.courseId, {
  totalStudySeconds: (session.totalStudySeconds || 0) + finalWorkSeconds,
  sessionCount: (session.sessionCount || 0) + 1,
});
```
But `session.totalStudySeconds` and `session.sessionCount` belong to the **course document**, not the session. The session object never has those fields, so the fallback `|| 0` always fires. Result:
- Every finished session **overwrites** the course's `totalStudySeconds` with just the seconds from that one session (history is wiped).
- `sessionCount` is permanently stuck at `1`.

**Fix prompt to paste:**
> In `src/hooks/useSession.js`, the `submitFinish` callback writes course totals using `session.totalStudySeconds` and `session.sessionCount`, but those fields live on the course document, not the session. Fix it by using Firestore's atomic `increment()`:
> 1. In `src/services/courseService.js`, import `increment` from `firebase/firestore` and add a helper `incrementCourseStats(courseId, addedSeconds)` that calls `updateDoc(ref, { totalStudySeconds: increment(addedSeconds), sessionCount: increment(1), updatedAt: serverTimestamp() })`. Don't forget to invalidate the courses cache.
> 2. In `useSession.submitFinish`, replace the existing `updateCourse(...)` call with `incrementCourseStats(session.courseId, finalWorkSeconds)`.
> Test: finish two sessions on the same course back-to-back and confirm `totalStudySeconds` accumulates and `sessionCount` reaches 2.

---

## 🔴 4. Dashboard's "Study hrs this week" and "Day streak" are hardcoded to 0

**File:** `src/pages/DashboardPage.jsx` (lines 32, 51)

**Problem:**
```js
const studyMinsThisWeek = last7.reduce((acc) => acc, 0);  // ← no-op reducer
// ...
<StatCard label={en.dashboard.streak} value={0} ... />     // ← hardcoded 0
```
- `last7` is an array of **sleep logs** (not study data) and the reducer never reads any item — it always returns the initial accumulator `0`.
- The streak StatCard always shows `0`. There's no streak calculation at all.

So the dashboard's two main motivational stats are always zero.

**Fix prompt to paste:**
> In `src/pages/DashboardPage.jsx`:
> 1. Replace the broken `studyMinsThisWeek` line with real study time. Pull session totals via `useSessionHistory` (or load `listRecentSessions` directly), filter to sessions whose `date` falls in the current week (`getWeekDays()` from `src/utils/dateUtils.js`), and sum `totalWorkSeconds` divided by 60.
> 2. For the "Day streak" StatCard: compute the consecutive-day study streak from finished sessions. Use the existing `calcStudyStreak(tasksByDate)` from `src/utils/statsUtils.js` after grouping sessions by `date`, OR write a small inline helper that walks backwards from today and counts consecutive days that have at least one finished session.
> Confirm in the speed monitor that no extra duplicate Firestore reads are triggered (use the existing `listRecentSessions` cache).

---

## 🔴 5. Active-session cache is not invalidated on pause / resume

**File:** `src/services/sessionService.js` (line 32)

**Problem:**
```js
if (updates.status && updates.status !== 'running' && updates.status !== 'paused') {
  invalidateActiveSession();
}
```
The cache is only cleared when the status moves to `finished` or `cancelled`. Pause / resume update the document but leave the cache holding the stale snapshot (with the old `lastResumedAt`, `pausedAt`, `pauseCount`, etc.).

Then if `useSession` remounts (e.g. user navigates Study → Dashboard → Study), it reads the stale cached object and:
- restores the wrong `status` field,
- computes elapsed time from a stale `lastResumedAt`,
- the timer ticks from the wrong starting point.

**Fix prompt to paste:**
> In `src/services/sessionService.js`, `updateSession` only invalidates the active-session cache when the status leaves the active states. That's wrong — pause and resume also mutate the active session and the cached snapshot becomes stale. Change the logic to: invalidate the active-session cache on **every** `updateSession` call (or, better, update the cache in place by merging the `updates` into `_activeCache` when the cache exists and the doc id matches). Confirm by pausing a session, navigating away to Dashboard, navigating back to Study, and verifying the timer shows the correct paused state with no stale tick.

---

## 🟡 6. Service-layer caches stay in a stuck state when a fetch errors

**Files:** `src/services/sleepService.js`, `src/services/courseService.js`, `src/services/sessionService.js`, `src/services/routineService.js`

**Problem:**
Every cache uses the same pattern:
```js
_xFetch = timed('x', 'firestore', async () => {
  const snap = await getDoc(...);
  _xCache = ...;
  _xFetch = null;          // ← only resets on success
  return _xCache;
});
return _xFetch;
```
If the Firestore call throws (offline, transient error, permission denied), `_xFetch` keeps holding the **rejected** promise forever. Every subsequent caller does `return _xFetch` and gets the same rejection. The user has to hard-reload the page to recover.

**Fix prompt to paste:**
> Every service-layer cache (`getSettings` in `src/services/sleepService.js`, `listCourses` in `src/services/courseService.js`, `getActiveSession` and `listRecentSessions` in `src/services/sessionService.js`, `initRoutineDay` and `getRecentRoutineDays` in `src/services/routineService.js`) sets the in-flight promise variable to `null` only inside the success path. On a rejected fetch the cached promise stays stuck and every subsequent caller gets the same rejection forever.
> Wrap each in-flight assignment so `_xFetch = null` runs in both success **and** error paths. Easiest pattern:
> ```js
> _xFetch = (async () => { try { /* fetch + populate cache */ } finally { _xFetch = null; } })();
> ```
> Or: chain `.finally(() => { _xFetch = null; })` on the timed promise. Apply consistently across all five caches. After fixing, simulate an offline/error state and confirm a second call retries instead of replaying the rejection.

---

## 🟡 7. `useSession.submitFinish` has no path back if the user clicks Cancel from a running session

**File:** `src/pages/StudyPage.jsx` (line 80)

**Problem:**
The "Cancel" button on the Finish form does:
```js
onBack={() => sessionHook.resumeSession()}
```
But `resumeSession` early-returns if status isn't `'paused'`:
```js
if (!sessionId || status !== 'paused') return;
```
When the user clicks Finish from a **running** session, status goes `running → finishing`. Then Cancel calls `resumeSession`, which sees status `finishing` and does nothing. The user is stuck on the form with no way back to the timer.

**Fix prompt to paste:**
> In `src/hooks/useSession.js` add a new action `cancelFinish()` that simply restores the prior status. Track the pre-finish status in a ref or state so we can return to whichever state we came from:
> ```js
> const preFinishStatusRef = useRef(null);
> const requestFinish = useCallback(() => {
>   if (status !== 'running' && status !== 'paused') return;
>   preFinishStatusRef.current = status;
>   setStatus('finishing');
> }, [status]);
> const cancelFinish = useCallback(() => {
>   if (status !== 'finishing') return;
>   setStatus(preFinishStatusRef.current || 'running');
> }, [status]);
> ```
> Export `cancelFinish` from the hook return value.
> In `src/pages/StudyPage.jsx`, change `onBack={() => sessionHook.resumeSession()}` to `onBack={sessionHook.cancelFinish}`.
> Test: click Finish while running, then Cancel — should return to running with the timer still ticking.

---

## 🟡 8. `useStudy` re-fetches everything on every toggle / add / delete

**File:** `src/hooks/useStudy.js`

**Problem:**
Every action calls `await load()`, which fires both `listTasksByDate` and `listTopics` in parallel. Toggling a single task's done state triggers two Firestore reads. This is the same problem `useRoutine.toggleItem` solved with optimistic updates.

**Fix prompt to paste:**
> Refactor `src/hooks/useStudy.js` to use optimistic updates the same way `src/hooks/useRoutine.js` does:
> 1. `toggleTask`: update `todayTasks` state immediately with the new `done` value, then write to Firestore via `updateTask`. On error, revert and log.
> 2. `removeTask`: filter out the task locally first, then call `deleteTask`. On error, restore.
> 3. `addTaskFn`: push a temporary item with a generated id into `todayTasks` immediately, then `addTask`. On success, swap the temp id for the real one (or just call a lightweight refresh of just `listTasksByDate`, not topics).
> 4. `addTopicFn`: optimistically prepend to `topics`, then `addTopic`. On error, revert.
> Goal: each user action should do exactly one Firestore write and zero reads.

---

## 🟡 9. `calcStudyStreak` skips broken-streak days instead of breaking

**File:** `src/utils/statsUtils.js` (lines 40–57)

**Problem:**
```js
for (const date of dates) {
  const diff = differenceInCalendarDays(parseISO(expected), parseISO(date));
  if (diff === 0 && tasksByDate[date].some((t) => t.done)) {
    streak++;
    expected = ...;
  } else if (diff > 1) {
    break;
  }
}
```
The middle case (`diff === 0` but no done task, OR `diff === 1`) falls through and continues iterating. Imagine: today=Wed, Tue had a task but none done. The loop visits Wed (streak=1, expected=Tue), then Tue (`diff=0` but `hasDone=false`, neither branch fires, loop continues), then Mon (`diff` from Tue is 1, so `diff > 1` is false, falls through again). The streak silently keeps counting across gaps.

**Fix prompt to paste:**
> The `calcStudyStreak` function in `src/utils/statsUtils.js` has a logic gap: when the iterated date matches `expected` but no task is done, neither branch of the if/else fires and the loop continues, allowing the streak to silently span gaps. Rewrite the loop so that any failed expectation (no done task, or a jump > 1 day) breaks immediately:
> ```js
> for (const date of dates) {
>   const diff = differenceInCalendarDays(parseISO(expected), parseISO(date));
>   if (diff !== 0) break;                                 // skipped a day → done
>   if (!tasksByDate[date].some((t) => t.done)) break;     // no done task → done
>   streak++;
>   const d = parseISO(expected);
>   d.setDate(d.getDate() - 1);
>   expected = format(d, 'yyyy-MM-dd');                    // use date-fns format, not toISOString
> }
> ```
> Also fix the same UTC-vs-local issue in `calcStreak` higher in the file: replace `d.toISOString().split('T')[0]` with date-fns `format(d, 'yyyy-MM-dd')`. Otherwise users in negative-UTC timezones see off-by-one streak breaks.

---

## 🟡 10. `useProgress` fetches `getSettings` and discards it

**File:** `src/hooks/useProgress.js` (lines 21–27)

**Problem:**
```js
const [routineDays, topics, tasks, sleepLogs] = await Promise.all([
  getRecentRoutineDays(60),
  listTopics(),
  listAllTasks(),
  getAllSleepLogs(),
  getSettings(),     // ← 5th element, never destructured
]);
```
The `Promise.all` array has 5 entries but only 4 are destructured. `getSettings()` runs and its result is thrown away. Either remove the call or use it (e.g. for the `targetSleepTime` reference in stats).

**Fix prompt to paste:**
> In `src/hooks/useProgress.js`, the `Promise.all` array passes 5 promises but only 4 are destructured — `getSettings()` runs and the result is discarded. Either remove the `getSettings()` call entirely (it's already cached so the cost is small but it still adds to perf log noise), or destructure it as a 5th variable and use the `targetSleepTime`/`targetWakeTime` to display the user's targets in the daily/weekly views.

---

## 🟡 11. `weekNum()` in `useProgress` produces wrong week for month boundaries

**File:** `src/hooks/useProgress.js` (lines 58–62)

**Problem:**
```js
const weekNum = (dateStr) => {
  const d = new Date(dateStr);
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  return Math.ceil((d.getDate() + start.getDay()) / 7);
};
```
- `start.getDay()` returns Sunday=0, but the rest of the app uses Mon-start weeks (`weekStartsOn: 1` in `getWeekRange`). The two weeks-of-month numberings won't agree.
- `new Date(dateStr)` for `'2026-05-05'` parses as **UTC midnight**, which in negative timezones can roll back to the previous day.

**Fix prompt to paste:**
> Replace the ad-hoc `weekNum` helper inside `src/hooks/useProgress.js` with date-fns's `getWeekOfMonth(date, { weekStartsOn: 1 })`. Also use `parseISO(dateStr)` (already imported in `dateUtils.js`) instead of `new Date(dateStr)` so the date isn't parsed at UTC midnight. Verify `bestWeek`/`worstWeek` labels match what `getWeekDays()` would group together.

---

## 🟡 12. `SleepLogForm` doesn't sync with prop updates and treats `0` as missing

**File:** `src/components/sleep/SleepLogForm.jsx`

**Problem:**
1. `useState(initial)` only fires on first mount. After `useSleep` reloads and `defaultLog` changes, the form keeps its old initial values. Edit-existing-log flow is broken.
2. `defaultLog?.quality || DEFAULTS.QUALITY` — if a saved log has `quality: 0` (unlikely but possible), the OR falls back to the default. Should use `??`.

**Fix prompt to paste:**
> In `src/components/sleep/SleepLogForm.jsx`:
> 1. Add a `useEffect` that resets the form state whenever `defaultLog` changes — otherwise reloading from Firestore doesn't update the displayed values. The effect should also reset when `settings.targetSleepTime/targetWakeTime` change.
> 2. Replace every `defaultLog?.X || DEFAULTS.X` with `defaultLog?.X ?? DEFAULTS.X` so a stored `0` doesn't fall through to the default. Affects `quality`, `morningEnergy`.

---

## 🟡 13. `useSession.js` imports `useRef` but never uses it

**File:** `src/hooks/useSession.js` (line 2)

**Problem:**
```js
import { useState, useEffect, useRef, useCallback } from 'react';
```
`useRef` was used in an earlier draft of the timer logic but the final implementation moved the interval into `useEffect` cleanups. The unused import survives, which the linter flags.

**Fix prompt to paste:**
> Remove the unused `useRef` import from line 2 of `src/hooks/useSession.js`. (When you implement the `cancelFinish` action from issue #7, this import will be needed again — add it back at that point.)

---

## 🟡 14. ErrorBoundary uses `<a href="/errors">` instead of React Router `<Link>`

**File:** `src/components/ErrorBoundary.jsx` (line 50)

**Problem:**
The "View error log" link uses a raw `<a href>` which triggers a full page reload, losing any React state and re-bootstrapping the entire app. Inside the boundary that's mostly fine (the boundary already crashed), but it bypasses BrowserRouter and feels jarring.

**Fix prompt to paste:**
> In `src/components/ErrorBoundary.jsx`, replace the `<a href="/errors">` link with React Router's `<Link to={ROUTES.ERRORS}>` (import `Link` from `react-router-dom` and `ROUTES` from `../constants/routes.js`). Also wire the "Try again" button to clear the boundary state AND navigate home — currently it only resets state, leaving the URL stuck on whichever page crashed (which will likely re-crash on render).

---

## 🟡 15. `MonthlyChart.jsx` has a duplicate / unused import

**File:** `src/components/progress/MonthlyChart.jsx` (lines 3–4)

**Problem:**
```js
import { formatDayAbbr } from '../../utils/dateUtils.js';
import { formatDisplay } from '../../utils/dateUtils.js';
```
Two separate imports from the same module, and `formatDayAbbr` is imported but never used.

**Fix prompt to paste:**
> Clean up `src/components/progress/MonthlyChart.jsx`: merge the two `dateUtils` imports into one and drop the unused `formatDayAbbr`. Final import: `import { formatDisplay } from '../../utils/dateUtils.js';`

---

## 🟡 16. `EntryRow` (PerfPage) and `ErrorEntry` (ErrorLogPage) are missing PropTypes

**Files:** `src/pages/PerfPage.jsx` (line 47), `src/pages/ErrorLogPage.jsx` (line 23)

**Problem:**
The codebase rule says "Every component must have clear prop types defined." These two inner components break the rule.

**Fix prompt to paste:**
> Add `PropTypes` declarations to:
> 1. `EntryRow` in `src/pages/PerfPage.jsx`:
>    ```js
>    EntryRow.propTypes = {
>      entry: PropTypes.shape({
>        id: PropTypes.string,
>        timestamp: PropTypes.string.isRequired,
>        type: PropTypes.oneOf(['firestore', 'navigation', 'interaction', 'browser']).isRequired,
>        label: PropTypes.string.isRequired,
>        duration: PropTypes.number,
>        status: PropTypes.string,
>        error: PropTypes.string,
>      }).isRequired,
>    };
>    ```
> 2. `ErrorEntry` in `src/pages/ErrorLogPage.jsx`:
>    ```js
>    ErrorEntry.propTypes = {
>      entry: PropTypes.shape({
>        id: PropTypes.string,
>        timestamp: PropTypes.string.isRequired,
>        source: PropTypes.string.isRequired,
>        message: PropTypes.string.isRequired,
>        stack: PropTypes.string,
>        componentStack: PropTypes.string,
>        filename: PropTypes.string,
>        lineno: PropTypes.number,
>        colno: PropTypes.number,
>      }).isRequired,
>    };
>    ```
> Import `PropTypes` from 'prop-types' at the top of each file.

---

## 🟢 17. `StudyPage.jsx` imports `Badge` and `PropTypes` is declared mid-file

**File:** `src/pages/StudyPage.jsx`

**Problem:**
- Line 11: `import Badge from '../components/ui/Badge.jsx';` — Badge is never used in this file.
- Line 262: `import PropTypes from 'prop-types';` is declared **after** the component definitions instead of at the top of the file.

**Fix prompt to paste:**
> In `src/pages/StudyPage.jsx`:
> 1. Remove the unused `Badge` import.
> 2. Move `import PropTypes from 'prop-types';` from line 262 up to the top of the file with the other imports.

---

## 🟢 18. `GoalBanner` computes `pct` but never uses it

**File:** `src/components/study/GoalBanner.jsx`

**Problem:**
```js
const pct = Math.min(100, Math.round((doneMinutes / goal) * 100));  // ← never used
```
The percentage is computed but `ProgressBar` is given raw `value` and `max` and computes the % itself.

**Fix prompt to paste:**
> Remove the unused `pct` variable from `src/components/study/GoalBanner.jsx`. The `ProgressBar` already computes the percentage internally from `value` + `max`.

---

## 🟢 19. `theme/tokens.js` is dead code

**File:** `src/theme/tokens.js`

**Problem:**
The file exports `colors`, `spacing`, `fontSizes` but nothing in the codebase imports them. Tailwind classes are used everywhere instead. The file is dead weight in the bundle (technically tree-shaken, but still misleading to readers).

**Fix prompt to paste:**
> Either delete `src/theme/tokens.js` (and the `src/theme/` directory if empty) or wire it into the Tailwind config via `tailwind.config.js`'s `theme.extend` so the colors/spacing/fontSizes values are reused as Tailwind tokens. Pick one — the current state (defined but never imported) is dead code.

---

## 🟢 20. `MobileNav` cramps 7 items on small screens

**File:** `src/components/layout/MobileNav.jsx`

**Problem:**
The bar has 7 `flex-1` items: Dashboard, Routine, Study, Sleep, Progress, Speed, Errors. On a 360px viewport that's ~51px per tab — icons squeeze together with the labels and the speed/error badges overlap the labels.

**Fix prompt to paste:**
> In `src/components/layout/MobileNav.jsx`, hide the Speed and Errors links from the bar on small screens (they're already on the desktop sidebar). Two options:
> 1. Add a "More" tab that opens a sheet/menu with Speed + Errors.
> 2. Wrap the Speed and Errors `<NavLink>` blocks in a `<div className="hidden sm:contents">` so they only show on screens ≥ 640px.
> Pick option 2 for simplicity. Test on a 360px width that the 5 remaining tabs aren't cramped.

---

## 🟢 21. `PerfPage` clipboard call has no error handling

**File:** `src/pages/PerfPage.jsx` (lines 97, 112)

**Problem:**
```js
navigator.clipboard.writeText(text).then(() => { ... });
```
`navigator.clipboard` rejects silently in insecure contexts (`http://`) and on older mobile browsers. The user clicks "Copy all" and nothing happens — no fallback, no toast, no error.

**Fix prompt to paste:**
> Add a `.catch()` to the `navigator.clipboard.writeText` calls in both `src/pages/PerfPage.jsx` and `src/pages/ErrorLogPage.jsx`. On failure, fall back to creating a hidden `<textarea>`, calling `document.execCommand('copy')`, and surfacing a toast/error message via the existing `useErrorLog().addError()` hook so the user sees something happened.

---

## 🟢 22. `PerfContext` global click capture records every clickable element

**File:** `src/context/PerfContext.jsx`

**Problem:**
The capture-phase document click listener records the text content of every `button | a | [role=button] | label` the user clicks, including labels that may contain personal data (course names, task titles). These are persisted to `sessionStorage` and visible in the Speed Monitor + included in "Copy all" output.

**Fix prompt to paste:**
> In `src/context/PerfContext.jsx`, the click listener captures every clickable element's text content. To reduce the chance of recording personal text:
> 1. Prefer a `data-perf-label` attribute on the element if present, falling back to `aria-label`/`title` only.
> 2. If neither is set, record just the element's `tagName` (e.g. `BUTTON`) and skip the truncated text content.
> 3. Add a max-length cap of ~30 chars when text content is used (currently 60).
> Then sprinkle `data-perf-label` attributes on the navigation items and primary buttons in `Sidebar.jsx`, `MobileNav.jsx`, `SessionControls.jsx`, etc., so we still get useful labels in the perf log without leaking content.

---

## 🟢 23. Race condition: rapid double-click on Pause / Resume

**File:** `src/hooks/useSession.js`

**Problem:**
The `pauseSession` / `resumeSession` guards check `status` before awaiting Firestore. React state hasn't updated yet, so two rapid clicks both pass the guard, both fire `updateSession`, and `pauseCount` (or break recording) is incremented twice. Edge case but very real on mobile mistaps.

**Fix prompt to paste:**
> Add a re-entrancy guard to `pauseSession` and `resumeSession` in `src/hooks/useSession.js`. Use a ref like `const inFlightRef = useRef(false)`; at the top of each callback do `if (inFlightRef.current) return; inFlightRef.current = true;` and reset it in a `finally` block. Test by spam-clicking pause and confirming `pauseCount` only increments once per real pause.

---

## 🟢 24. `Modal` Escape-key handler doesn't trap focus

**File:** `src/components/ui/Modal.jsx`

**Problem:**
The modal listens for Escape but doesn't trap Tab focus inside the modal. Tabbing out of the modal moves focus to elements behind the dim overlay, which is a small accessibility issue.

**Fix prompt to paste:**
> Add basic focus management to `src/components/ui/Modal.jsx`:
> 1. On open, focus the first focusable element inside the modal (or the close button as a fallback).
> 2. On close, return focus to whatever element was focused before the modal opened (store it in a ref before opening).
> 3. Trap Tab/Shift+Tab so it cycles within the modal — find all focusable descendants, listen for keydown, and wrap focus.
> If implementing all of this is too much, at least add `aria-modal="true"` and `role="dialog"` to the modal root element so screen readers announce it correctly.

---

## Summary

- **Critical (5):** open Firestore rules, project mismatch, course totals reset, hardcoded dashboard stats, stale active-session cache.
- **Important (11):** sticky cache rejections, no path back from Finish form, useStudy thrashing, streak logic, useProgress dead promise, week numbering, SleepLogForm sync, dead `useRef` import, Link routing, dead imports, missing PropTypes (×2).
- **Polish (8):** unused imports, dead code, mobile cramping, clipboard error handling, click logging privacy, click race, modal a11y, design tokens.

Recommended order: fix #1 and #2 first (security + correctness foundation), then #3–#5 (data integrity), then the rest.
