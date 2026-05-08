// Class-based React Error Boundary — catches render-phase crashes
import { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { ROUTES } from '../constants/routes.js';

// Detect stale-chunk errors that happen after a new deployment.
// When Vite builds, chunk filenames contain a content hash. If the user has an old
// index.html cached and navigates to a lazy-loaded route, the old chunk URL no longer
// exists on the server → "Failed to fetch dynamically imported module".
// Solution: reload once automatically. A sessionStorage flag prevents reload loops.
const isChunkLoadError = (err) =>
  err?.message?.includes('Failed to fetch dynamically imported module') ||
  err?.message?.includes('Importing a module script failed') ||
  err?.message?.includes('is not a valid JavaScript MIME type') ||   // Firebase 404 → HTML served instead of JS
  err?.message?.includes('error loading dynamically imported module') || // Safari variant
  err?.name === 'ChunkLoadError';

const RELOAD_FLAG = 'eb_chunk_reloaded';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null, autoReloading: false };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });

    // Auto-reload once for stale-chunk errors — user shouldn't see the crash UI at all
    if (isChunkLoadError(error)) {
      const alreadyTriedReload = sessionStorage.getItem(RELOAD_FLAG);
      if (!alreadyTriedReload) {
        sessionStorage.setItem(RELOAD_FLAG, '1');
        this.setState({ autoReloading: true });
        window.location.reload();
        return; // don't log to error log — this is infrastructure noise, not a code bug
      }
      // Second time means reloading didn't help — clear the flag and show the error UI
      sessionStorage.removeItem(RELOAD_FLAG);
    }

    // Forward real errors to the global error log
    if (typeof this.props.onError === 'function') {
      this.props.onError(error, info);
    }
  }

  handleTryAgain = () => {
    sessionStorage.removeItem(RELOAD_FLAG);
    this.setState({ error: null, info: null, autoReloading: false });
    window.location.href = '/';
  };

  render() {
    const { error, info, autoReloading } = this.state;
    if (!error) return this.props.children;

    // Show a brief "updating…" message while the auto-reload triggers
    if (autoReloading || isChunkLoadError(error)) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm max-w-sm w-full p-6 text-center">
            <RefreshCw size={24} className="text-sky-500 mx-auto mb-3 animate-spin" />
            <p className="text-sm font-medium text-slate-700">New version available — reloading…</p>
            <p className="text-xs text-slate-400 mt-1">This only takes a second.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-red-200 shadow-sm max-w-lg w-full p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle size={22} className="text-red-500 flex-shrink-0" />
            <h2 className="text-base font-semibold text-slate-800">Something crashed</h2>
          </div>
          <p className="text-sm text-red-600 font-mono bg-red-50 rounded-lg p-3 mb-4 break-words">
            {error.message}
          </p>
          {info?.componentStack && (
            <pre className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3 overflow-auto max-h-40 mb-4">
              {info.componentStack.trim()}
            </pre>
          )}
          <div className="flex gap-2">
            <button
              onClick={this.handleTryAgain}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700 transition-colors"
            >
              <RefreshCw size={14} /> Try again
            </button>
            <Link
              to={ROUTES.ERRORS}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
            >
              View error log
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  onError: PropTypes.func,
};

export default ErrorBoundary;
