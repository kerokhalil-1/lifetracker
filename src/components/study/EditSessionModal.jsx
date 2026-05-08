// Modal to edit any previously saved study session
import { useState } from 'react';
import PropTypes from 'prop-types';
import { Plus, X } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import Input from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';
import Rating from '../ui/Rating.jsx';
import en from '../../locales/en.js';

const EditSessionModal = ({ session, isOpen, onClose, onSave }) => {
  const [topics, setTopics] = useState(() =>
    session.topicsCovered?.length ? [...session.topicsCovered] : ['']
  );
  const [form, setForm] = useState({
    details:       session.details       || '',
    keyNotes:      session.keyNotes      || '',
    completedWork: session.completedWork || '',
    remainingWork: session.remainingWork || '',
    nextStep:      session.nextStep      || '',
    tags:          (session.tags || []).join(', '),
    difficulty:    session.difficulty    || 0,
    focusRating:   session.focusRating   || 0,
  });
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const setTopic = (i, val) => setTopics((prev) => prev.map((t, idx) => (idx === i ? val : t)));
  const addTopicLine = () => setTopics((prev) => [...prev, '']);
  const removeTopicLine = (i) => setTopics((prev) => prev.filter((_, idx) => idx !== i));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(session.id, {
        topicsCovered: topics.map((t) => t.trim()).filter(Boolean),
        details:       form.details,
        keyNotes:      form.keyNotes,
        completedWork: form.completedWork,
        remainingWork: form.remainingWork,
        nextStep:      form.nextStep,
        tags:          form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        difficulty:    form.difficulty,
        focusRating:   form.focusRating,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit — ${session.courseName || 'Session'}`} maxWidth="max-w-xl">
      <form onSubmit={handleSave} className="flex flex-col gap-4">

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
            className="flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700 font-medium w-fit"
          >
            <Plus size={14} /> {en.study.addTopic}
          </button>
        </div>

        <Input type="textarea" rows={3} label={en.study.details}       value={form.details}       onChange={set('details')}       placeholder={en.study.detailsPlaceholder} />
        <Input type="textarea" rows={3} label={en.study.keyNotes}      value={form.keyNotes}      onChange={set('keyNotes')}      placeholder={en.study.keyNotesPlaceholder} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input type="textarea" rows={2} label={en.study.completedWork} value={form.completedWork} onChange={set('completedWork')} placeholder={en.study.completedPlaceholder} />
          <Input type="textarea" rows={2} label={en.study.remainingWork} value={form.remainingWork} onChange={set('remainingWork')} placeholder={en.study.remainingPlaceholder} />
        </div>

        <Input label={en.study.nextStep}     value={form.nextStep}  onChange={set('nextStep')}  placeholder={en.study.nextStepPlaceholder} />
        <Input label={en.study.sessionTags}  value={form.tags}      onChange={set('tags')}      placeholder={en.study.sessionTagsPlaceholder} />

        <div className="flex gap-6 flex-wrap">
          <Rating label={en.study.difficulty}  value={form.difficulty}  onChange={(v) => setForm((p) => ({ ...p, difficulty: v }))} />
          <Rating label={en.study.focusRating} value={form.focusRating} onChange={(v) => setForm((p) => ({ ...p, focusRating: v }))} />
        </div>

        <div className="flex gap-2 justify-end pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>{en.common.cancel}</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Saving…' : en.common.save}</Button>
        </div>
      </form>
    </Modal>
  );
};

EditSessionModal.propTypes = {
  session: PropTypes.shape({
    id: PropTypes.string.isRequired,
    courseName: PropTypes.string,
    topicsCovered: PropTypes.arrayOf(PropTypes.string),
    details: PropTypes.string,
    keyNotes: PropTypes.string,
    completedWork: PropTypes.string,
    remainingWork: PropTypes.string,
    nextStep: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    difficulty: PropTypes.number,
    focusRating: PropTypes.number,
  }).isRequired,
  isOpen:  PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave:  PropTypes.func.isRequired,
};

export default EditSessionModal;
