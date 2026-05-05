// Error log viewer — shows all captured errors with copy-to-clipboard for sharing
import { useState } from 'react';
import { Trash2, Copy, Check, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import { useErrorLog } from '../context/ErrorLogContext.jsx';

const sourceColor = (source) => {
  if (source.includes('Service') || source.includes('service')) return 'red';
  if (source.includes('Hook') || source.includes('hook')) return 'amber';
  if (source.includes('Unhandled')) return 'red';
  if (source.includes('window')) return 'red';
  return 'slate';
};

const formatTs = (iso) => {
  const d = new Date(iso);
  return d.toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'medium' });
};

const ErrorEntry = ({ entry }) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyEntry = () => {
    const text = [
      `Time:    ${entry.timestamp}`,
      `Source:  ${entry.source}`,
      `Message: ${entry.message}`,
      entry.stack ? `\nStack:\n${entry.stack}` : '',
      entry.componentStack ? `\nComponent Stack:\n${entry.componentStack}` : '',
      entry.filename ? `\nFile: ${entry.filename}:${entry.lineno}:${entry.colno}` : '',
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden mb-3">
      <div className="flex items-start gap-3 p-4 bg-white">
        <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Badge color={sourceColor(entry.source)}>{entry.source}</Badge>
            <span className="text-xs text-slate-400">{formatTs(entry.timestamp)}</span>
          </div>
          <p className="text-sm font-mono text-red-700 break-words">{entry.message}</p>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={copyEntry}
            title="Copy this error"
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
          </button>
          <button
            onClick={() => setExpanded((v) => !v)}
            title="Toggle stack trace"
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {expanded && (entry.stack || entry.componentStack || entry.filename) && (
        <div className="border-t border-slate-100 bg-slate-50 p-4">
          {entry.filename && (
            <p className="text-xs text-slate-500 mb-2">
              {entry.filename}:{entry.lineno}:{entry.colno}
            </p>
          )}
          {entry.stack && (
            <pre className="text-xs text-slate-600 overflow-auto max-h-48 whitespace-pre-wrap break-words mb-2">
              {entry.stack}
            </pre>
          )}
          {entry.componentStack && (
            <>
              <p className="text-xs font-medium text-slate-500 mb-1">Component stack:</p>
              <pre className="text-xs text-slate-600 overflow-auto max-h-32 whitespace-pre-wrap break-words">
                {entry.componentStack.trim()}
              </pre>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const ErrorLogPage = () => {
  const { errors, clearErrors } = useErrorLog();
  const [allCopied, setAllCopied] = useState(false);

  const copyAll = () => {
    const text = errors.map((e, i) => [
      `─── Error ${i + 1} ───`,
      `Time:    ${e.timestamp}`,
      `Source:  ${e.source}`,
      `Message: ${e.message}`,
      e.stack ? `Stack:\n${e.stack}` : '',
      e.componentStack ? `Component Stack:\n${e.componentStack.trim()}` : '',
    ].filter(Boolean).join('\n')).join('\n\n');

    navigator.clipboard.writeText(text || 'No errors logged.').then(() => {
      setAllCopied(true);
      setTimeout(() => setAllCopied(false), 2500);
    });
  };

  return (
    <PageWrapper title="Error Log">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-slate-500">
          {errors.length === 0
            ? 'No errors captured yet.'
            : `${errors.length} error${errors.length !== 1 ? 's' : ''} captured — copy all and send to fix.`}
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={copyAll} disabled={errors.length === 0}>
            {allCopied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy all</>}
          </Button>
          {errors.length > 0 && (
            <Button variant="danger" size="sm" onClick={clearErrors}>
              <Trash2 size={13} /> Clear
            </Button>
          )}
        </div>
      </div>

      {errors.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center py-12 gap-3 text-slate-400">
            <Check size={32} className="text-green-400" />
            <p className="text-sm font-medium">All clear — no errors logged.</p>
          </div>
        </Card>
      ) : (
        <div>
          {errors.map((entry) => (
            <ErrorEntry key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </PageWrapper>
  );
};

export default ErrorLogPage;
