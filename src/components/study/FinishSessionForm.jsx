// Form that captures what the user actually studied before saving the finished session
import { useState } from 'react';
import PropTypes from 'prop-types';
import { Plus, X } from 'lucide-react';
import Input from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';
import Rating from '../ui/Rating.jsx';
import { DEFAULTS } from '../../constants/defaults.js';
import en from '../../locales/en.js';

const empty = () => ({
  details: '',
  keyNotes: '',
  completedWork: '',
  remainingWork: '',
  nextStep: '',
  tags: '',
  difficulty: DEFAULTS.SESSION_DIFFICULTY,
  focusRating: DEFAULTS.SESSION_FOCUS,
});

const FinishSessionForm = ({ onSubmit, onBack }) => {
  const [form, setForm] = useState(empty());
  const [topics, setTopics] = useState(['']);
  const [subtopics, setSubtopics] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  // Add or update a topic line
  const setTopic = (i, val) =>
    setTopics((prev) => prev.map((t, idx) => (idx === i ? val : t)));
  const addTopicLine = () => setTopics((prev) => [...prev, '']);
  const removeTopicLine = (i) => setTopics((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const topicsCovered = topics.map((t) => t.trim()).filter(Boolean);
    const subtopicList = subtopics
      ? subtopics.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    const tagList = form.tags
      ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];
    await onSubmit({
      topicsCovered,
      subtopics: subtopicList,
      details: form.details,
      keyNotes: form.keyNotes,
      completedWork: form.completedWork,
      remainingWork: form.remainingWork,
      nextStep: form.nextStep,
      tags: tagList,
      difficulty: form.difficulty,
      focusRating: form.focusRating,
    });
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <h2 className="text-base font-semibold text-slate-800">{en.study.finishTitle}</h2>

      {/* Topics covered */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-slate-600">{en.study.topicsCovered}</span>
        {topics.map((t, i) => (
          <div key={i} className="flex gap-2 items-center">
            <Input
              value={t}
              onChange={(e) => setTopic(i, e.target.value)}
              placeholder={en.study.topicsPlaceholder}
              className="flex-1"
            />
            {topics.length > 1 && (
              <button
                type="button"
                onClick={() => removeTopicLine(i)}
                className="p-1 text-slate-400 hover:text-red-500 focus:outline-none shrink-0"
                aria-label="Remove topic"
              >
                <X size={16} />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addTopicLine}
          className="flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700 font-medium focus:outline-none w-fit"
        >
          <Plus size={14} /> {en.study.addTopic}
        </button>
      </div>

      {/* Subtopics */}
      <Input
        label={en.study.subtopics}
        value={subtopics}
        onChange={(e) => setSubtopics(e.target.value)}
        placeholder={en.study.subtopicsPlaceholder}
      />

      {/* Details and notes */}
      <Input type="textarea" rows={3} label={en.study.details} value={form.details} onChange={set('details')} placeholder={en.study.detailsPlaceholder} />
      <Input type="textarea" rows={3} label={en.study.keyNotes} value={form.keyNotes} onChange={set('keyNotes')} placeholder={en.study.keyNotesPlaceholder} />

      {/* Progress */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input type="textarea" rows={2} label={en.study.completedWork} value={form.completedWork} onChange={set('completedWork')} placeholder={en.study.completedPlaceholder} />
        <Input type="textarea" rows={2} label={en.study.remainingWork} value={form.remainingWork} onChange={set('remainingWork')} placeholder={en.study.remainingPlaceholder} />
      </div>
      <Input label={en.study.nextStep} value={form.nextStep} onChange={set('nextStep')} placeholder={en.study.nextStepPlaceholder} />

      {/* Tags */}
      <Input label={en.study.sessionTags} value={form.tags} onChange={set('tags')} placeholder={en.study.sessionTagsPlaceholder} />

      {/* Ratings */}
      <div className="flex gap-6 flex-wrap">
        <Rating label={en.study.difficulty} value={form.difficulty} onChange={(v) => setForm((p) => ({ ...p, difficulty: v }))} />
        <Rating label={en.study.focusRating} value={form.focusRating} onChange={(v) => setForm((p) => ({ ...p, focusRating: v }))} />
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end pt-1">
        <Button type="button" variant="ghost" onClick={onBack}>{en.common.cancel}</Button>
        <Button type="submit" disabled={submitting}>{en.study.finishSave}</Button>
      </div>
    </form>
  );
};

FinishSessionForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default FinishSessionForm;
