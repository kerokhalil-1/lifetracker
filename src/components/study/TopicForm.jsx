// Form for logging a new study topic
import { useState } from 'react';
import PropTypes from 'prop-types';
import Input from '../ui/Input.jsx';
import Rating from '../ui/Rating.jsx';
import Button from '../ui/Button.jsx';
import { today } from '../../utils/dateUtils.js';
import { DEFAULTS } from '../../constants/defaults.js';
import en from '../../locales/en.js';

const empty = () => ({
  title: '',
  summary: '',
  courseSection: '',
  timeSpentMinutes: 0,
  keyNotes: '',
  difficulty: DEFAULTS.DIFFICULTY,
  tags: '',
  date: today(),
});

const TopicForm = ({ onSubmit, onCancel }) => {
  const [form, setForm] = useState(empty());
  const [submitting, setSubmitting] = useState(false);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSubmitting(true);
    await onSubmit({
      ...form,
      timeSpentMinutes: Number(form.timeSpentMinutes) || 0,
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    });
    setForm(empty());
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Input label={en.study.topicTitle} value={form.title} onChange={set('title')} placeholder="e.g. React hooks" />
      <Input label={en.study.topicSection} value={form.courseSection} onChange={set('courseSection')} placeholder="e.g. Chapter 3" />
      <Input type="textarea" label={en.study.topicSummary} value={form.summary} onChange={set('summary')} placeholder="What did you learn?" rows={2} />
      <div className="grid grid-cols-2 gap-3">
        <Input type="number" label={en.study.topicTime} value={form.timeSpentMinutes} onChange={set('timeSpentMinutes')} min={0} />
        <Input type="date" label={en.study.topicDate} value={form.date} onChange={set('date')} />
      </div>
      <Rating label={en.study.topicDifficulty} value={form.difficulty} onChange={(v) => setForm((p) => ({ ...p, difficulty: v }))} />
      <Input type="textarea" label={en.study.topicNotes} value={form.keyNotes} onChange={set('keyNotes')} placeholder="Key notes and insights..." rows={3} />
      <Input label={en.study.topicTags} value={form.tags} onChange={set('tags')} placeholder="react, hooks, state" />
      <div className="flex gap-2 justify-end">
        {onCancel && <Button variant="ghost" onClick={onCancel} type="button">{en.common.cancel}</Button>}
        <Button type="submit" disabled={submitting}>{en.study.submitTopic}</Button>
      </div>
    </form>
  );
};

TopicForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
};

export default TopicForm;
