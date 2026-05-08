// Study page — Session tracker, daily tasks, topic log, and session history
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Plus, CheckCircle } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import Card from '../components/ui/Card.jsx';
import Tabs from '../components/ui/Tabs.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Modal from '../components/ui/Modal.jsx';
import StudyTaskItem from '../components/study/StudyTaskItem.jsx';
import TopicCard from '../components/study/TopicCard.jsx';
import TopicForm from '../components/study/TopicForm.jsx';
import CoursePickerModal from '../components/study/CoursePickerModal.jsx';
import SessionTimer from '../components/study/SessionTimer.jsx';
import SessionControls from '../components/study/SessionControls.jsx';
import FinishSessionForm from '../components/study/FinishSessionForm.jsx';
import DaySummary from '../components/study/DaySummary.jsx';
import SessionTasksPanel from '../components/study/SessionTasksPanel.jsx';
import GoalBanner from '../components/study/GoalBanner.jsx';
import useStudy from '../hooks/useStudy.js';
import useSession from '../hooks/useSession.js';
import useCourses from '../hooks/useCourses.js';
import useSessionHistory from '../hooks/useSessionHistory.js';
import { today, tomorrow } from '../utils/dateUtils.js';
import { DEFAULTS } from '../constants/defaults.js';
import en from '../locales/en.js';

// Build the tab list — badge the Session tab when a session is live
const buildTabs = (sessionActive) => [
  { value: 'session', label: sessionActive ? `${en.study.tabSession} ●` : en.study.tabSession },
  { value: 'tasks', label: en.study.tabTasks },
  { value: 'topics', label: en.study.tabTopics },
  { value: 'history', label: en.study.tabHistory },
];

// ─── Session tab ─────────────────────────────────────────────────────────────

const SessionTab = ({ session: sessionHook, courses, history, study }) => {
  const { status, session, elapsedWork, elapsedBreak, startSession, pauseSession, resumeSession, requestFinish, cancelFinish, submitFinish, cancelSession } = sessionHook;
  const [showPicker, setShowPicker] = useState(false);

  // Auto-open the picker when the user clicks Study Now
  const handleStudyNow = () => setShowPicker(true);
  const handlePickCourse = (course) => startSession(course.id, course.name);

  if (status === 'loading') return <Spinner className="py-16" />;

  // ── Idle — show Study Now CTA ──────────────────────────────────────────────
  if (status === 'idle') {
    return (
      <div className="flex flex-col gap-4">
        <GoalBanner todayWorkSeconds={history.todayWorkSeconds} />
        <Card className="flex flex-col items-center justify-center gap-6 py-14 px-6 text-center">
          <span className="text-5xl">📚</span>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-slate-800">Ready to study?</h2>
            <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
              Pick a course, start the timer, and track every minute of focused work.
            </p>
          </div>
          <Button
            onClick={handleStudyNow}
            size="lg"
            data-perf-label="Study Now"
            className="w-full sm:w-auto px-10"
          >
            {en.study.studyNow}
          </Button>
        </Card>
        <CoursePickerModal
          isOpen={showPicker}
          onClose={() => setShowPicker(false)}
          courses={courses.courses}
          loading={courses.loading}
          onSelect={handlePickCourse}
          onCreateCourse={courses.addCourse}
        />
      </div>
    );
  }

  // ── Finish form ────────────────────────────────────────────────────────────
  if (status === 'finishing') {
    return (
      <Card>
        <FinishSessionForm
          onSubmit={submitFinish}
          onBack={cancelFinish} // return to prior state (running or paused) — bug #7 fix
        />
      </Card>
    );
  }

  // ── Saved confirmation ─────────────────────────────────────────────────────
  if (status === 'finished') {
    return (
      <Card className="flex flex-col items-center gap-4 py-12">
        <CheckCircle size={48} className="text-green-500" />
        <p className="text-lg font-semibold text-slate-800">{en.study.sessionFinished}</p>
      </Card>
    );
  }

  // ── Live session (running | paused) ───────────────────────────────────────
  return (
    <div className="flex flex-col gap-4">
      <GoalBanner todayWorkSeconds={history.todayWorkSeconds} activeSessionSeconds={elapsedWork} />
      <Card>
        <SessionTimer
          session={session}
          elapsedWork={elapsedWork}
          elapsedBreak={elapsedBreak}
          status={status}
        />
        <div className="mt-6">
          <SessionControls
            status={status}
            onPause={pauseSession}
            onResume={resumeSession}
            onFinish={requestFinish}
            onCancel={cancelSession}
          />
        </div>
        {/* Today's tasks — visible while studying so you can check them off without switching tabs */}
        <SessionTasksPanel
          tasks={study.todayTasks}
          onToggle={study.toggleTask}
        />
      </Card>
    </div>
  );
};

// ─── Tasks tab ────────────────────────────────────────────────────────────────

const TasksTab = ({ study }) => {
  const { todayTasks, loading, error, addTask, toggleTask, removeTask } = study;
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [isPlanTomorrow, setIsPlanTomorrow] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', subject: '', estimatedMinutes: DEFAULTS.ESTIMATED_MINUTES });

  const openAddTask = (forTomorrow = false) => {
    setIsPlanTomorrow(forTomorrow);
    setShowTaskModal(true);
  };

  const handleAddTask = async () => {
    if (!taskForm.title.trim()) return;
    await addTask({
      title: taskForm.title,
      subject: taskForm.subject,
      estimatedMinutes: Number(taskForm.estimatedMinutes) || 0,
      scheduledDate: isPlanTomorrow ? tomorrow() : today(),
    });
    setTaskForm({ title: '', subject: '', estimatedMinutes: DEFAULTS.ESTIMATED_MINUTES });
    setShowTaskModal(false);
  };

  if (loading) return <Spinner className="py-12" />;

  return (
    <>
      <Card>
        <div className="flex gap-2 mb-4">
          <Button onClick={() => openAddTask(false)} size="sm">
            <Plus size={14} /> {en.study.addTask}
          </Button>
          <Button variant="secondary" onClick={() => openAddTask(true)} size="sm">
            {en.study.planTomorrow}
          </Button>
        </div>
        {error && <p className="text-sm text-red-600 mb-3">{en.common.error}</p>}
        {todayTasks.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">{en.study.noTasks}</p>
        ) : (
          todayTasks.map((task) => (
            <StudyTaskItem key={task.id} task={task} onToggle={toggleTask} onDelete={removeTask} />
          ))
        )}
      </Card>

      <Modal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        title={isPlanTomorrow ? en.study.planTomorrow : en.study.addTask}
      >
        <div className="flex flex-col gap-3">
          <Input label={en.study.taskTitle} value={taskForm.title} onChange={(e) => setTaskForm((p) => ({ ...p, title: e.target.value }))} placeholder="e.g. Read chapter 4" />
          <Input label={en.study.taskSubject} value={taskForm.subject} onChange={(e) => setTaskForm((p) => ({ ...p, subject: e.target.value }))} placeholder="e.g. Math" />
          <Input type="number" label={en.study.taskEstimate} value={taskForm.estimatedMinutes} onChange={(e) => setTaskForm((p) => ({ ...p, estimatedMinutes: e.target.value }))} min={0} />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowTaskModal(false)}>{en.common.cancel}</Button>
            <Button onClick={handleAddTask}>{en.common.add}</Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

// ─── Topics tab ───────────────────────────────────────────────────────────────

const PREVIEW_COUNT = 12; // chips shown before "show more"

const TopicsTab = ({ study, history }) => {
  const { topics, loading, addTopic } = study;

  // Unique topics covered across all finished sessions — collapsed by default
  const sessionTopics = [...new Set(
    (history.sessions || [])
      .filter((s) => s.status === 'finished')
      .flatMap((s) => s.topicsCovered || [])
  )].sort();
  const [sessionTopicsExpanded, setSessionTopicsExpanded] = useState(false);
  const visibleSessionTopics = sessionTopicsExpanded ? sessionTopics : sessionTopics.slice(0, PREVIEW_COUNT);

  const [showTopicModal, setShowTopicModal] = useState(false);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');

  const allTags = [...new Set(topics.flatMap((t) => t.tags || []))];
  const filtered = topics.filter((t) => {
    const matchSearch = !search || t.title?.toLowerCase().includes(search.toLowerCase());
    const matchTag = !tagFilter || (t.tags || []).includes(tagFilter);
    return matchSearch && matchTag;
  });

  if (loading) return <Spinner className="py-12" />;

  return (
    <>
      {/* Topics derived from sessions — collapsed by default, shows first 12 */}
      {sessionTopics.length > 0 && (
        <div className="bg-sky-50 border border-sky-200 rounded-xl px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-sky-600 uppercase tracking-wider">
              From your sessions · {sessionTopics.length} topics
            </p>
            {sessionTopics.length > PREVIEW_COUNT && (
              <button
                type="button"
                onClick={() => setSessionTopicsExpanded((v) => !v)}
                data-perf-label={sessionTopicsExpanded ? 'Collapse session topics' : 'Expand session topics'}
                className="text-xs text-sky-600 hover:text-sky-800 font-medium transition-colors"
              >
                {sessionTopicsExpanded ? 'Show less ↑' : `Show all ${sessionTopics.length} ↓`}
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {visibleSessionTopics.map((t, i) => (
              <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-700">
                {t}
              </span>
            ))}
            {!sessionTopicsExpanded && sessionTopics.length > PREVIEW_COUNT && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                +{sessionTopics.length - PREVIEW_COUNT} more
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex gap-2 flex-wrap items-center justify-between">
          <span className="text-sm text-slate-500">{topics.length} {en.study.topicsCount}</span>
          <Button onClick={() => setShowTopicModal(true)} size="sm">
            <Plus size={14} /> {en.study.logTopic}
          </Button>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={en.study.searchTopics} className="flex-1 min-w-40" />
          {allTags.length > 0 && (
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">{en.study.filterByTag}</option>
              {allTags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
            </select>
          )}
        </div>
        {filtered.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">{en.study.noTopics}</p>
        ) : (
          filtered.map((topic) => <TopicCard key={topic.id} topic={topic} />)
        )}
      </div>

      <Modal isOpen={showTopicModal} onClose={() => setShowTopicModal(false)} title={en.study.logTopic} maxWidth="max-w-xl">
        <TopicForm
          onSubmit={async (data) => { await addTopic(data); setShowTopicModal(false); }}
          onCancel={() => setShowTopicModal(false)}
        />
      </Modal>
    </>
  );
};

// ─── History tab ──────────────────────────────────────────────────────────────

const HistoryTab = ({ history }) => {
  const { sessions, tasksByDate, loading, editSession } = history;
  const finished = sessions.filter((s) => s.status === 'finished');

  if (loading) return <Spinner className="py-12" />;
  if (finished.length === 0) return <p className="text-sm text-slate-400 text-center py-12">{en.study.noHistory}</p>;

  // Group sessions by date (desc order preserved — sessions sorted by startedAt desc)
  const byDate = [];
  const seen = new Map();
  for (const s of finished) {
    const d = s.date || 'unknown';
    if (!seen.has(d)) {
      seen.set(d, []);
      byDate.push({ dateStr: d, sessions: seen.get(d) });
    }
    seen.get(d).push(s);
  }

  return (
    <div className="flex flex-col gap-4">
      {byDate.map(({ dateStr, sessions: daySessions }) => (
        <DaySummary
          key={dateStr}
          dateStr={dateStr}
          sessions={daySessions}
          dayTasks={tasksByDate[dateStr] || []}
          onEditSession={editSession}
        />
      ))}
    </div>
  );
};

// ─── PropTypes for inner tab components ──────────────────────────────────────

SessionTab.propTypes = {
  session: PropTypes.object.isRequired,
  courses: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  study:   PropTypes.object.isRequired,
};

TasksTab.propTypes  = { study: PropTypes.object.isRequired };
TopicsTab.propTypes = { study: PropTypes.object.isRequired, history: PropTypes.object.isRequired };
HistoryTab.propTypes = { history: PropTypes.object.isRequired };
HistoryTab.propTypes = { history: PropTypes.object.isRequired };

// ─── Root page ────────────────────────────────────────────────────────────────

const StudyPage = () => {
  const sessionHook = useSession();
  const coursesHook = useCourses();
  const historyHook = useSessionHistory();
  const studyHook = useStudy(today());

  const isLive = ['running', 'paused'].includes(sessionHook.status);
  const [activeTab, setActiveTab] = useState('session');

  // When a session goes live, jump to the Session tab automatically
  useEffect(() => {
    if (isLive) setActiveTab('session');
  }, [isLive]);

  // Reload history after a session finishes so the new entry appears immediately
  useEffect(() => {
    if (sessionHook.status === 'finished') historyHook.reload();
  }, [sessionHook.status]); // eslint-disable-line react-hooks/exhaustive-deps

  const tabs = buildTabs(isLive);

  return (
    <PageWrapper title={en.study.title}>
      <div className="flex flex-col gap-5">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === 'session' && (
          <SessionTab session={sessionHook} courses={coursesHook} history={historyHook} study={studyHook} />
        )}
        {activeTab === 'tasks' && <TasksTab study={studyHook} />}
        {activeTab === 'topics' && <TopicsTab study={studyHook} history={historyHook} />}
        {activeTab === 'history' && <HistoryTab history={historyHook} />}
      </div>
    </PageWrapper>
  );
};

export default StudyPage;
