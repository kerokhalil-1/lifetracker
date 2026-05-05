// Sleep tracker — log form, 7-night overview, and settings panel
import { useState } from 'react';
import { Settings } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import Card from '../components/ui/Card.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import SleepLogForm from '../components/sleep/SleepLogForm.jsx';
import SleepCard from '../components/sleep/SleepCard.jsx';
import useSleep from '../hooks/useSleep.js';
import en from '../locales/en.js';

const SleepPage = () => {
  const { todayLog, last7, settings, loading, error, logSleep, updateSettings } = useSleep();
  const [showSettings, setShowSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState(null);

  const openSettings = () => {
    setSettingsForm({
      targetSleepTime: settings?.targetSleepTime || '23:00',
      targetWakeTime: settings?.targetWakeTime || '07:00',
    });
    setShowSettings(true);
  };

  const saveSettings = async () => {
    await updateSettings({ ...settings, ...settingsForm });
    setShowSettings(false);
  };

  if (loading) return <PageWrapper title={en.sleep.title}><Spinner className="py-16" /></PageWrapper>;

  return (
    <PageWrapper title={en.sleep.title}>
      <div className="flex flex-col gap-5">
        {error && <div className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{en.common.error}</div>}

        {/* Log form */}
        <Card header={en.sleep.logForm} footer={
          <button onClick={openSettings} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors">
            <Settings size={13} /> {en.sleep.settings}
          </button>
        }>
          <SleepLogForm onSubmit={logSleep} settings={settings} defaultLog={todayLog} />
        </Card>

        {/* Settings panel */}
        {showSettings && settingsForm && (
          <Card header={en.sleep.settings}>
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <Input type="time" label={en.sleep.targetSleep} value={settingsForm.targetSleepTime} onChange={(e) => setSettingsForm((p) => ({ ...p, targetSleepTime: e.target.value }))} />
                <Input type="time" label={en.sleep.targetWake} value={settingsForm.targetWakeTime} onChange={(e) => setSettingsForm((p) => ({ ...p, targetWakeTime: e.target.value }))} />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => setShowSettings(false)}>{en.common.cancel}</Button>
                <Button onClick={saveSettings}>{en.sleep.saveSettings}</Button>
              </div>
            </div>
          </Card>
        )}

        {/* Last 7 nights */}
        <Card header={en.sleep.last7}>
          {last7.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">{en.sleep.noLogs}</p>
          ) : (
            <div className="flex flex-col gap-3">
              {last7.map((log) => <SleepCard key={log.date} log={log} />)}
            </div>
          )}
        </Card>
      </div>
    </PageWrapper>
  );
};

export default SleepPage;
