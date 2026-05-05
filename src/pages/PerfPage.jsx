// App speed monitor — shows every click, navigation, Firestore call, and browser metric
import { useState } from 'react';
import { Copy, Check, Trash2, Zap, Database, Navigation, MousePointer, Monitor } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import { usePerf } from '../context/PerfContext.jsx';

// ─── helpers ────────────────────────────────────────────────────────────────

const TYPE_META = {
  firestore:    { label: 'Firestore', Icon: Database,     color: 'sky'   },
  navigation:   { label: 'Navigate',  Icon: Navigation,   color: 'purple' },
  interaction:  { label: 'Click',     Icon: MousePointer, color: 'slate' },
  browser:      { label: 'Browser',   Icon: Monitor,      color: 'green' },
};

const speedColor = (ms, type) => {
  if (type === 'interaction') return 'text-slate-500';
  if (ms === 0) return 'text-slate-400';
  if (ms < 300)  return 'text-green-600';
  if (ms < 1000) return 'text-amber-600';
  return 'text-red-600';
};

const speedBg = (ms, type) => {
  if (type === 'interaction' || ms === 0) return 'bg-white';
  if (ms < 300)  return 'bg-green-50';
  if (ms < 1000) return 'bg-amber-50';
  return 'bg-red-50';
};

const speedLabel = (ms, type) => {
  if (type === 'interaction' || ms === 0) return null;
  if (ms < 300)  return { text: 'Fast',   color: 'green' };
  if (ms < 1000) return { text: 'OK',     color: 'amber' };
  return          { text: 'Slow',   color: 'red'   };
};

const formatTs = (iso) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 2 });

const avgOf = (arr) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

// ─── sub-components ─────────────────────────────────────────────────────────

const EntryRow = ({ entry }) => {
  const meta = TYPE_META[entry.type] || TYPE_META.browser;
  const spd = speedLabel(entry.duration, entry.type);

  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 border-b border-slate-100 last:border-0 ${speedBg(entry.duration, entry.type)}`}>
      <meta.Icon size={14} className="text-slate-400 flex-shrink-0" />

      <span className="text-xs text-slate-400 w-24 flex-shrink-0 tabular-nums">
        {formatTs(entry.timestamp)}
      </span>

      <span className="text-sm text-slate-700 flex-1 truncate">{entry.label}</span>

      {entry.error && (
        <span className="text-xs text-red-500 truncate max-w-32">{entry.error}</span>
      )}

      <div className="flex items-center gap-2 flex-shrink-0">
        {spd && <Badge color={spd.color}>{spd.text}</Badge>}
        {entry.type !== 'interaction' && (
          <span className={`text-sm font-mono font-semibold w-16 text-right ${speedColor(entry.duration, entry.type)}`}>
            {entry.duration > 0 ? `${entry.duration}ms` : '—'}
          </span>
        )}
      </div>
    </div>
  );
};

// ─── main page ───────────────────────────────────────────────────────────────

const PerfPage = () => {
  const { entries, clear } = usePerf();
  const [filter, setFilter] = useState('all');
  const [copied, setCopied] = useState(false);

  const filtered = filter === 'all' ? entries : entries.filter((e) => e.type === filter);

  // Summary stats from Firestore entries only
  const firestoreEntries = entries.filter((e) => e.type === 'firestore');
  const slowest = firestoreEntries.reduce((a, b) => (a.duration > b.duration ? a : b), { duration: 0, label: '—' });
  const avgFirestore = avgOf(firestoreEntries.map((e) => e.duration));
  const errorCount = entries.filter((e) => e.status === 'error').length;
  const slowCount = firestoreEntries.filter((e) => e.duration >= 1000).length;

  const copyAll = () => {
    const text = entries.map((e) =>
      `[${formatTs(e.timestamp)}] [${e.type.toUpperCase()}] ${e.label} — ${e.duration > 0 ? e.duration + 'ms' : 'instant'}${e.status === 'error' ? ' ❌ ' + e.error : ''}`
    ).join('\n');
    navigator.clipboard.writeText(text || 'No entries.').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const FILTERS = [
    { value: 'all',         label: 'All' },
    { value: 'firestore',   label: 'Firestore' },
    { value: 'navigation',  label: 'Navigation' },
    { value: 'interaction', label: 'Clicks' },
    { value: 'browser',     label: 'Browser' },
  ];

  return (
    <PageWrapper title="App Speed Monitor">

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total events',    value: entries.length,          color: 'text-slate-800' },
          { label: 'Avg Firestore',   value: avgFirestore ? `${avgFirestore}ms` : '—', color: avgFirestore < 300 ? 'text-green-600' : avgFirestore < 1000 ? 'text-amber-600' : 'text-red-600' },
          { label: 'Slow ops (>1s)',  value: slowCount,               color: slowCount > 0 ? 'text-red-600' : 'text-green-600' },
          { label: 'Errors',          value: errorCount,              color: errorCount > 0 ? 'text-red-600' : 'text-green-600' },
        ].map(({ label, value, color }) => (
          <Card key={label} className="text-center">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </Card>
        ))}
      </div>

      {slowest.duration >= 300 && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <Zap size={16} className="text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            Slowest operation: <strong>{slowest.label}</strong> took <strong>{slowest.duration}ms</strong>
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${filter === f.value ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {f.label}
              {f.value !== 'all' && (
                <span className="ml-1 text-slate-400">
                  ({entries.filter((e) => e.type === f.value).length})
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="ml-auto flex gap-2">
          <Button variant="secondary" size="sm" onClick={copyAll} disabled={entries.length === 0}>
            {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy all</>}
          </Button>
          {entries.length > 0 && (
            <Button variant="danger" size="sm" onClick={clear}>
              <Trash2 size={13} /> Clear
            </Button>
          )}
        </div>
      </div>

      {/* Timeline */}
      <Card padding={false}>
        {/* Legend */}
        <div className="flex flex-wrap gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50 rounded-t-xl">
          <span className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block" /> Fast (&lt;300ms)</span>
          <span className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> OK (300ms–1s)</span>
          <span className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" /> Slow (&gt;1s)</span>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-14 gap-3 text-slate-400">
            <Zap size={28} />
            <p className="text-sm">No events yet — use the app and they'll appear here in real time.</p>
          </div>
        ) : (
          <div className="overflow-auto max-h-[60vh]">
            {filtered.map((entry) => (
              <EntryRow key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </Card>
    </PageWrapper>
  );
};

export default PerfPage;
