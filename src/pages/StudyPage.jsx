// Study tracker — Today's Tasks and Course Topics tabs
import { useState } from 'react';
import { Plus } from 'lucide-react';
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
import useStudy from '../hooks/useStudy.js';
import { today, tomorrow } from '../utils/dateUtils.js';
import { DEFAULTS } from '../constants/defaults.js';
import en from '../locales/en.js';

const TABS = [
  { value: 'tasks', label: en.study.tabTasks },
  { value: 'topics', label: en.study.tabTopics },
];

const StudyPage = () => {
  const { todayTasks, topics, loading, error, addTask, toggleTask, removeTask, addTopic } = useStudy(today());
  const [activeTab, setActiveTab] = useState('tasks');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [isPlanTomorrow, setIsPlanTomorrow] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', subject: '', estimatedMinutes: DEFAULTS.ESTIMATED_MINUTES });
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');

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

  const openAddTask = (forTomorrow = false) => {
    setIsPlanTomorrow(forTomorrow);
    setShowTaskModal(true);
  };

  const allTags = [...new Set(topics.flatMap((t) => t.tags || []))];
  const filteredTopics = topics.filter((t) => {
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.summary?.toLowerCase().includes(search.toLowerCase());
    const matchTag = !tagFilter || (t.tags || []).includes(tagFilter);
    return matchSearch && matchTag;
  });

  if (loading) return <PageWrapper title={en.study.title}><Spinner className="py-16" /></PageWrapper>;

  return (
    <PageWrapper title={en.study.title}>
      <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      {error && <div className="text-sm text-red-600 bg-red-50 rounded-lg p-3 mt-4">{en.common.error}</div>}

      <div className="mt-5">
        {activeTab === 'tasks' && (
          <Card>
            <div className="flex gap-2 mb-4">
              <Button onClick={() => openAddTask(false)} size="sm">
                <Plus size={14} /> {en.study.addTask}
              </Button>
              <Button variant="secondary" onClick={() => openAddTask(true)} size="sm">
                {en.study.planTomorrow}
              </Button>
            </div>

            {todayTasks.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">{en.study.noTasks}</p>
            ) : (
              todayTasks.map((task) => (
                <StudyTaskItem key={task.id} task={task} onToggle={toggleTask} onDelete={removeTask} />
              ))
            )}
          </Card>
        )}

        {activeTab === 'topics' && (
          <div className="flex flex-col gap-4">
            <div className="flex gap-2 flex-wrap items-center justify-between">
              <span className="text-sm text-slate-500">{topics.length} {en.study.topicsCount}</span>
              <Button onClick={() => setShowTopicModal(true)} size="sm">
                <Plus size={14} /> {en.study.logTopic}
              </Button>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={en.study.searchTopics}
                className="flex-1 min-w-40"
              />
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

            {filteredTopics.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">{en.study.noTopics}</p>
            ) : (
              filteredTopics.map((topic) => <TopicCard key={topic.id} topic={topic} />)
            )}
          </div>
        )}
      </div>

      {/* Add Task Modal */}
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

      {/* Log Topic Modal */}
      <Modal isOpen={showTopicModal} onClose={() => setShowTopicModal(false)} title={en.study.logTopic} maxWidth="max-w-xl">
        <TopicForm onSubmit={async (data) => { await addTopic(data); setShowTopicModal(false); }} onCancel={() => setShowTopicModal(false)} />
      </Modal>
    </PageWrapper>
  );
};

export default StudyPage;
