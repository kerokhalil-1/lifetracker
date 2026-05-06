// Daily home screen showing today's overview and quick stats
import { useState } from 'react';
import { CheckSquare, BookOpen, Moon, Flame } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import Card from '../components/ui/Card.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import Checkbox from '../components/ui/Checkbox.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import StatCard from '../components/progress/StatCard.jsx';
import useRoutine from '../hooks/useRoutine.js';
import useStudy from '../hooks/useStudy.js';
import useSleep from '../hooks/useSleep.js';
import useSessionHistory from '../hooks/useSessionHistory.js';
import { today, formatFull, getWeekDays } from '../utils/dateUtils.js';
import { minsToHrs } from '../utils/timeUtils.js';
import en from '../locales/en.js';

// Compute consecutive-day study streak from finished sessions.
// Walk backward from today; stop as soon as a day has no finished session.
const computeStreak = (sessions) => {
  const finishedDates = new Set(
    sessions.filter((s) => s.status === 'finished').map((s) => s.date)
  );
  let streak = 0;
  const d = new Date();
  while (true) {
    const dateStr = d.toISOString().split('T')[0]; // local-date approximation (calendar dates are server-side anyway)
    if (!finishedDates.has(dateStr)) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
};

const DashboardPage = () => {
  const { routineDay, loading: routineLoading, toggleItem } = useRoutine(today());
  const { todayTasks, loading: studyLoading, toggleTask, addTask } = useStudy(today());
  const { todayLog, loading: sleepLoading } = useSleep();
  const { sessions, loading: sessionLoading } = useSessionHistory();
  const [newTask, setNewTask] = useState('');

  const loading = routineLoading || studyLoading || sleepLoading || sessionLoading;

  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    await addTask({ title: newTask.trim(), subject: '', scheduledDate: today(), estimatedMinutes: 0 });
    setNewTask('');
  };

  // Sum work seconds for finished sessions whose date falls in the current week
  const weekDays = new Set(getWeekDays());
  const studyMinsThisWeek = sessions
    .filter((s) => s.status === 'finished' && weekDays.has(s.date))
    .reduce((sum, s) => sum + Math.round((s.totalWorkSeconds || 0) / 60), 0);

  const streak = computeStreak(sessions);
  const routineScore = routineDay?.completionScore ?? 0;
  const allItems = [...(routineDay?.fixedItems || []), ...(routineDay?.flexibleItems || [])];

  return (
    <PageWrapper>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">{en.dashboard.title}</h1>
        <p className="text-slate-500 text-sm mt-1">{formatFull(new Date())}</p>
      </div>

      {loading ? (
        <Spinner className="py-16" />
      ) : (
        <div className="flex flex-col gap-5">
          {/* Quick stats row */}
          <div className="flex gap-3 flex-wrap">
            <StatCard label={en.dashboard.routinePct} value={`${routineScore}%`} icon={CheckSquare} color="sky" />
            <StatCard label={en.dashboard.studyHours} value={minsToHrs(studyMinsThisWeek)} icon={BookOpen} color="green" />
            <StatCard label={en.dashboard.streak} value={streak} sub={en.common.days} icon={Flame} color="amber" />
          </div>

          {/* Morning Routine quick-check */}
          <Card header={en.dashboard.routineSection}>
            {allItems.length === 0 ? (
              <p className="text-sm text-slate-400">{en.common.empty}</p>
            ) : (
              <div className="flex flex-col divide-y divide-slate-50">
                {allItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="py-2.5">
                    <Checkbox
                      checked={item.done}
                      onChange={(e) => toggleItem(routineDay?.fixedItems?.find((f) => f.id === item.id) ? 'fixed' : 'flexible', item.id, e.target.checked)}
                      label={item.title}
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Today's study tasks */}
          <Card header={en.dashboard.studySection}>
            <div className="flex gap-2 mb-3">
              <Input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder={en.dashboard.taskPlaceholder}
                className="flex-1"
              />
              <Button onClick={handleAddTask} size="sm">{en.common.add}</Button>
            </div>
            {todayTasks.length === 0 ? (
              <p className="text-sm text-slate-400">{en.dashboard.noTasks}</p>
            ) : (
              <div className="flex flex-col divide-y divide-slate-50">
                {todayTasks.map((task) => (
                  <div key={task.id} className="py-2.5">
                    <Checkbox
                      checked={task.done}
                      onChange={(e) => toggleTask(task.id, e.target.checked)}
                      label={task.title}
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Sleep last night */}
          <Card header={en.dashboard.sleepSection}>
            {todayLog ? (
              <div className="flex items-center gap-4 text-sm text-slate-700">
                <Moon size={16} className="text-indigo-400" />
                <span>{todayLog.sleepTime} → {todayLog.wakeTime}</span>
                <span className="font-semibold">{todayLog.totalHours} hrs</span>
                <span className={todayLog.hitTarget ? 'text-green-600' : 'text-red-500'}>
                  {todayLog.hitTarget ? en.sleep.hitTarget : en.sleep.missed}
                </span>
              </div>
            ) : (
              <p className="text-sm text-slate-400">{en.dashboard.noSleepLog}</p>
            )}
          </Card>
        </div>
      )}
    </PageWrapper>
  );
};

export default DashboardPage;
