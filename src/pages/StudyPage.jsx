// Study page — Session tracker, daily tasks, topic log, and session history
import { useState, useEffect } from 'react';
import { Plus, CheckCircle } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import Card from '../components/ui/Card.jsx';
import Tabs from '../components/ui/Tabs.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Modal from '../components/ui/Modal.jsx';
import Badge from '../components/ui/Badge.jsx';
import StudyTaskItem from '../components/study/StudyTaskItem.jsx';
import TopicCard from '../components/study/TopicCard.jsx';
import TopicForm from '../components/study/TopicForm.jsx';
import CoursePickerModal from '../components/study/CoursePickerModal.jsx';
import SessionTimer from '../components/study/SessionTimer.jsx';
import SessionControls from '../components/study/SessionControls.jsx';
import FinishSessionForm from '../components/study/FinishSessionForm.jsx';
import SessionCard from '../components/study/SessionCard.jsx';
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

const SessionTab = ({ session: sessionHook, courses, history }) => {
  const { status, session, elapsedWork, elapsedBreak, startSession, pauseSession, resumeSession, requestFinish, submitFinish, cancelSession } = sessionHook;
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
        <Card className="flex flex-col items-center gap-5 py-10">
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="text-4xl">📚</span>
            <h2 className="text-xl font-bold text-slate-800">Ready to study?</h2>
            <p className="text-sm text-slate-400 max-w-xs">Pick a course, start the timer, and track every minute of focused work.</p>
          </div>
          <Button onClick={handleStudyNow} size="lg">{en.study.studyNow}</Button>
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
          onBack={() => sessionHook.resumeSession()} // return to running state
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

const TopicsTab = ({ study }) => {
  const { topics, loading, addTopic } = study;
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
  const { sessions, loading } = history;
  const finished = sessions.filter((s) => s.status === 'finished');

  if (loading) return <Spinner className="py-12" />;
  if (finished.length === 0) return <p className="text-sm text-slate-400 text-center py-12">{en.study.noHistory}</p>;

  return (
    <div className="flex flex-col gap-3">
      {finished.map((s) => <SessionCard key={s.id} session={s} />)}
    </div>
  );
};

// ─── PropTypes for inner tab components ──────────────────────────────────────

import PropTypes from 'prop-types';

SessionTab.propTypes = {
  session: PropTypes.object.isRequired,
  courses: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

TasksTab.propTypes = { study: PropTypes.object.isRequired };
TopicsTab.propTypes = { study: PropTypes.object.isRequired };
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
          <SessionTab session={sessionHook} courses={coursesHook} history={historyHook} />
        )}
        {activeTab === 'tasks' && <TasksTab study={studyHook} />}
        {activeTab === 'topics' && <TopicsTab study={studyHook} />}
        {activeTab === 'history' && <HistoryTab history={historyHook} />}
      </div>
    </PageWrapper>
  );
};

export default StudyPage;
