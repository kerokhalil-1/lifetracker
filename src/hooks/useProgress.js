// Hook for aggregating progress data across routine, study, and sleep
import { useState, useEffect, useCallback } from 'react';
import { getWeekOfMonth } from 'date-fns';
import { parseISO } from 'date-fns';
import { getRecentRoutineDays } from '../services/routineService.js';
import { listTopics, listAllTasks } from '../services/studyService.js';
import { getAllSleepLogs } from '../services/sleepService.js';
import { getWeekDays, getMonthDays, today } from '../utils/dateUtils.js';
import { calcAverage, countSleepTargetHits, groupBy } from '../utils/statsUtils.js';
import { useErrorLog } from '../context/ErrorLogContext.jsx';

const useProgress = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addError } = useErrorLog();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Bug #10 fix: removed discarded getSettings() from Promise.all (it was fetched but never used)
      const [routineDays, topics, tasks, sleepLogs] = await Promise.all([
        getRecentRoutineDays(60),
        listTopics(),
        listAllTasks(),
        getAllSleepLogs(),
      ]);

      const todayStr = today();
      const weekDays = getWeekDays();
      const monthDays = getMonthDays();

      const todayRoutine = routineDays.find((d) => d.date === todayStr);
      const todayTopics = topics.filter((t) => t.date === todayStr);
      const todayTasks = tasks.filter((t) => t.scheduledDate === todayStr);
      const todaySleep = sleepLogs.find((l) => l.date === todayStr);

      const weekRoutine = routineDays.filter((d) => weekDays.includes(d.date));
      const weekTopics = topics.filter((t) => weekDays.includes(t.date));
      const weekSleep = sleepLogs.filter((l) => weekDays.includes(l.date));
      const weekTasks = tasks.filter((t) => weekDays.includes(t.scheduledDate));
      const weekStudyMins = weekTopics.reduce((acc, t) => acc + (t.timeSpentMinutes || 0), 0);
      const weekSleepHits = countSleepTargetHits(weekSleep);

      const tasksByDate = groupBy(weekTasks, (t) => t.scheduledDate);
      let studyStreak = 0;
      const sortedDays = weekDays.slice().reverse();
      for (const d of sortedDays) {
        if (tasksByDate[d] && tasksByDate[d].some((t) => t.done)) studyStreak++;
        else break;
      }

      const monthRoutine = routineDays.filter((d) => monthDays.includes(d.date));
      const monthTopics = topics.filter((t) => monthDays.includes(t.date));
      const monthSleep = sleepLogs.filter((l) => monthDays.includes(l.date));
      const monthStudyMins = monthTopics.reduce((acc, t) => acc + (t.timeSpentMinutes || 0), 0);

      // Bug #11 fix: use date-fns getWeekOfMonth with Mon start + parseISO (no UTC date shift)
      const weekNum = (dateStr) => getWeekOfMonth(parseISO(dateStr), { weekStartsOn: 1 });
      const byWeek = groupBy(monthRoutine, (d) => weekNum(d.date));
      const weeklyAvgs = Object.entries(byWeek).map(([w, days]) => ({
        week: `Week ${w}`,
        avg: calcAverage(days.map((d) => d.completionScore || 0)),
      }));
      const bestWeek = weeklyAvgs.reduce((a, b) => (a.avg >= b.avg ? a : b), { week: '-', avg: 0 });
      const worstWeek = weeklyAvgs.reduce((a, b) => (a.avg <= b.avg ? a : b), { week: '-', avg: 100 });

      setData({
        daily: {
          routineScore: todayRoutine?.completionScore ?? null,
          tasksDone: todayTasks.filter((t) => t.done).length,
          tasksTotal: todayTasks.length,
          sleepScore: todaySleep?.quality ?? null,
          topicsCount: todayTopics.length,
        },
        weekly: {
          routineByDay: weekDays.map((d) => ({
            day: d,
            score: routineDays.find((r) => r.date === d)?.completionScore ?? 0,
          })),
          studyMins: weekStudyMins,
          topics: weekTopics,
          sleepHits: weekSleepHits,
          sleepTotal: weekSleep.length,
          studyStreak,
        },
        monthly: {
          routineByDay: monthDays.map((d) => ({
            day: d,
            score: routineDays.find((r) => r.date === d)?.completionScore ?? null,
          })),
          studyMins: monthStudyMins,
          topics: monthTopics,
          sleepAvgHours: calcAverage(monthSleep.map((l) => l.totalHours || 0)),
          sleepAvgQuality: calcAverage(monthSleep.map((l) => l.quality || 0)),
          sleepAvgEnergy: calcAverage(monthSleep.map((l) => l.morningEnergy || 0)),
          bestWeek,
          worstWeek,
        },
      });
    } catch (err) {
      setError(err.message);
      addError('useProgress', err);
    } finally {
      setLoading(false);
    }
  }, [addError]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, reload: load };
};

export default useProgress;
