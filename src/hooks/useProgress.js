// Hook for aggregating progress data across routine, study, and sleep
import { useState, useEffect, useCallback } from 'react';
import { getRecentRoutineDays } from '../services/routineService.js';
import { listTopics, listAllTasks } from '../services/studyService.js';
import { getAllSleepLogs, getSettings } from '../services/sleepService.js';
import { getWeekDays, getMonthDays, today } from '../utils/dateUtils.js';
import { calcAverage, countSleepTargetHits, groupBy } from '../utils/statsUtils.js';

const useProgress = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [routineDays, topics, tasks, sleepLogs, settings] = await Promise.all([
        getRecentRoutineDays(60),
        listTopics(),
        listAllTasks(),
        getAllSleepLogs(),
        getSettings(),
      ]);

      const todayStr = today();
      const weekDays = getWeekDays();
      const monthDays = getMonthDays();

      // Daily
      const todayRoutine = routineDays.find((d) => d.date === todayStr);
      const todayTopics = topics.filter((t) => t.date === todayStr);
      const todayTasks = tasks.filter((t) => t.scheduledDate === todayStr);
      const todaySleep = sleepLogs.find((l) => l.date === todayStr);

      // Weekly
      const weekRoutine = routineDays.filter((d) => weekDays.includes(d.date));
      const weekTopics = topics.filter((t) => weekDays.includes(t.date));
      const weekSleep = sleepLogs.filter((l) => weekDays.includes(l.date));
      const weekTasks = tasks.filter((t) => weekDays.includes(t.scheduledDate));
      const weekStudyMins = weekTopics.reduce((acc, t) => acc + (t.timeSpentMinutes || 0), 0);
      const weekSleepHits = countSleepTargetHits(weekSleep);

      // Study streak calculation
      const tasksByDate = groupBy(weekTasks, (t) => t.scheduledDate);
      let studyStreak = 0;
      const sortedDays = weekDays.slice().reverse();
      for (const d of sortedDays) {
        if (tasksByDate[d] && tasksByDate[d].some((t) => t.done)) studyStreak++;
        else break;
      }

      // Monthly
      const monthRoutine = routineDays.filter((d) => monthDays.includes(d.date));
      const monthTopics = topics.filter((t) => monthDays.includes(t.date));
      const monthSleep = sleepLogs.filter((l) => monthDays.includes(l.date));
      const monthStudyMins = monthTopics.reduce((acc, t) => acc + (t.timeSpentMinutes || 0), 0);

      // Weekly breakdown for best/worst
      const weekNum = (dateStr) => {
        const d = new Date(dateStr);
        const start = new Date(d.getFullYear(), d.getMonth(), 1);
        return Math.ceil((d.getDate() + start.getDay()) / 7);
      };
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
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, reload: load };
};

export default useProgress;
