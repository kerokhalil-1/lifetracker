// Form for logging a night's sleep data
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Input from '../ui/Input.jsx';
import Rating from '../ui/Rating.jsx';
import Button from '../ui/Button.jsx';
import { timeDiff, didHitTarget } from '../../utils/timeUtils.js';
import { DEFAULTS } from '../../constants/defaults.js';
import en from '../../locales/en.js';

// Build initial form state from props — extracted so we can call it in useEffect too
const buildInitial = (defaultLog, settings) => ({
  sleepTime: defaultLog?.sleepTime ?? settings?.targetSleepTime ?? DEFAULTS.TARGET_SLEEP_TIME,
  wakeTime: defaultLog?.wakeTime ?? settings?.targetWakeTime ?? DEFAULTS.TARGET_WAKE_TIME,
  quality: defaultLog?.quality ?? DEFAULTS.QUALITY,           // bug #12: ?? not || so 0 is valid
  morningEnergy: defaultLog?.morningEnergy ?? DEFAULTS.MORNING_ENERGY,
});

const SleepLogForm = ({ onSubmit, settings, defaultLog }) => {
  const [form, setForm] = useState(() => buildInitial(defaultLog, settings));
  const [submitting, setSubmitting] = useState(false);

  // Bug #12 fix: re-sync form when defaultLog or settings change (e.g. after Firestore reload)
  useEffect(() => {
    setForm(buildInitial(defaultLog, settings));
  }, [defaultLog, settings]);

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const totalHours = timeDiff(form.sleepTime, form.wakeTime);
  const hitTarget = didHitTarget(form.sleepTime, form.wakeTime, settings?.targetSleepTime, settings?.targetWakeTime);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit({ ...form, totalHours, hitTarget, targetSleepTime: settings?.targetSleepTime, targetWakeTime: settings?.targetWakeTime });
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Input type="time" label={en.sleep.sleepTime} value={form.sleepTime} onChange={set('sleepTime')} />
        <Input type="time" label={en.sleep.wakeTime} value={form.wakeTime} onChange={set('wakeTime')} />
      </div>
      <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
        <span>{en.sleep.totalHours}:</span>
        <span className="font-semibold">{totalHours} hrs</span>
        <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${hitTarget ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
          {hitTarget ? en.sleep.hitTarget : en.sleep.missed}
        </span>
      </div>
      <Rating label={en.sleep.quality} value={form.quality} onChange={(v) => setForm((p) => ({ ...p, quality: v }))} />
      <Rating label={en.sleep.morningEnergy} value={form.morningEnergy} onChange={(v) => setForm((p) => ({ ...p, morningEnergy: v }))} />
      <Button type="submit" disabled={submitting}>{en.sleep.submitLog}</Button>
    </form>
  );
};

SleepLogForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  settings: PropTypes.shape({
    targetSleepTime: PropTypes.string,
    targetWakeTime: PropTypes.string,
  }),
  defaultLog: PropTypes.object,
};

export default SleepLogForm;
