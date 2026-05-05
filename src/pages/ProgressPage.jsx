// Progress overview — Daily, Weekly, and Monthly tabs with charts and stats
import { useState } from 'react';
import { CheckSquare, BookOpen, Moon, Flame, Target } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import Card from '../components/ui/Card.jsx';
import Tabs from '../components/ui/Tabs.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import StatCard from '../components/progress/StatCard.jsx';
import WeeklyChart from '../components/progress/WeeklyChart.jsx';
import MonthlyChart from '../components/progress/MonthlyChart.jsx';
import StreakWidget from '../components/progress/StreakWidget.jsx';
import TopicCard from '../components/study/TopicCard.jsx';
import useProgress from '../hooks/useProgress.js';
import { minsToHrs } from '../utils/timeUtils.js';
import { calcCompletionPct } from '../utils/statsUtils.js';
import en from '../locales/en.js';

const TABS = [
  { value: 'daily', label: en.progress.tabDaily },
  { value: 'weekly', label: en.progress.tabWeekly },
  { value: 'monthly', label: en.progress.tabMonthly },
];

const ProgressPage = () => {
  const { data, loading, error } = useProgress();
  const [activeTab, setActiveTab] = useState('daily');

  if (loading) return <PageWrapper title={en.progress.title}><Spinner className="py-16" /></PageWrapper>;

  return (
    <PageWrapper title={en.progress.title}>
      <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      {error && <div className="text-sm text-red-600 bg-red-50 rounded-lg p-3 mt-4">{en.common.error}</div>}

      {!data ? (
        <p className="text-sm text-slate-400 text-center py-8 mt-4">{en.progress.noData}</p>
      ) : (
        <div className="mt-5 flex flex-col gap-5">

          {/* DAILY TAB */}
          {activeTab === 'daily' && (
            <>
              <div className="flex gap-3 flex-wrap">
                <StatCard
                  label={en.progress.routineCompletion}
                  value={data.daily.routineScore !== null ? `${data.daily.routineScore}%` : '—'}
                  icon={CheckSquare}
                  color="sky"
                />
                <StatCard
                  label={en.progress.studyTasksDone}
                  value={`${data.daily.tasksDone} ${en.common.of} ${data.daily.tasksTotal}`}
                  icon={BookOpen}
                  color="green"
                />
              </div>
              <div className="flex gap-3 flex-wrap">
                <StatCard
                  label={en.progress.sleepScore}
                  value={data.daily.sleepScore !== null ? `${data.daily.sleepScore}/5` : '—'}
                  icon={Moon}
                  color="purple"
                />
                <StatCard
                  label={en.progress.topicsToday}
                  value={data.daily.topicsCount}
                  icon={Target}
                  color="amber"
                />
              </div>
            </>
          )}

          {/* WEEKLY TAB */}
          {activeTab === 'weekly' && (
            <>
              <Card header={en.progress.routineCompletion}>
                {data.weekly.routineByDay.length > 0 ? (
                  <WeeklyChart data={data.weekly.routineByDay} />
                ) : (
                  <p className="text-sm text-slate-400">{en.progress.noData}</p>
                )}
              </Card>

              <div className="flex gap-3 flex-wrap">
                <StatCard label={en.progress.totalStudyHours} value={minsToHrs(data.weekly.studyMins)} icon={BookOpen} color="green" />
                <StatCard label={en.progress.sleepConsistency} value={`${data.weekly.sleepHits}/${data.weekly.sleepTotal}`} sub={en.progress.nights} icon={Moon} color="purple" />
              </div>

              <Card header={en.progress.studyStreak}>
                <StreakWidget streak={data.weekly.studyStreak} />
              </Card>

              <Card header={en.progress.topicsWeek}>
                {data.weekly.topics.length === 0 ? (
                  <p className="text-sm text-slate-400">{en.progress.noData}</p>
                ) : (
                  data.weekly.topics.map((t) => <TopicCard key={t.id} topic={t} />)
                )}
              </Card>
            </>
          )}

          {/* MONTHLY TAB */}
          {activeTab === 'monthly' && (
            <>
              <Card header={en.progress.routineCompletion}>
                <MonthlyChart data={data.monthly.routineByDay} />
              </Card>

              <div className="flex gap-3 flex-wrap">
                <StatCard label={en.progress.totalHoursMonth} value={minsToHrs(data.monthly.studyMins)} icon={BookOpen} color="green" />
                <StatCard label={en.progress.avgHours} value={`${data.monthly.sleepAvgHours} hrs`} icon={Moon} color="purple" />
              </div>

              <div className="flex gap-3 flex-wrap">
                <StatCard label={en.progress.avgQuality} value={`${data.monthly.sleepAvgQuality}/5`} icon={Moon} color="sky" />
                <StatCard label={en.progress.avgEnergy} value={`${data.monthly.sleepAvgEnergy}/5`} icon={Flame} color="amber" />
              </div>

              <div className="flex gap-3 flex-wrap">
                <StatCard label={en.progress.bestWeek} value={data.monthly.bestWeek.week} sub={`${data.monthly.bestWeek.avg}%`} color="green" />
                <StatCard label={en.progress.worstWeek} value={data.monthly.worstWeek.week} sub={`${data.monthly.worstWeek.avg}%`} color="amber" />
              </div>

              <Card header={en.progress.topicsMonth}>
                {data.monthly.topics.length === 0 ? (
                  <p className="text-sm text-slate-400">{en.progress.noData}</p>
                ) : (
                  data.monthly.topics.map((t) => <TopicCard key={t.id} topic={t} />)
                )}
              </Card>
            </>
          )}
        </div>
      )}
    </PageWrapper>
  );
};

export default ProgressPage;
