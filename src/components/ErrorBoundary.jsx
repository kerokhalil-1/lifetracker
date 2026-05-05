// Class-based React Error Boundary — catches render-phase crashes
import { Component } from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    // Forward to the global error log via the injected callback
    if (typeof this.props.onError === 'function') {
      this.props.onError(error, info);
    }
  }

  render() {
    const { error, info } = this.state;
    if (!error) return this.props.children;

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
              onClick={() => this.setState({ error: null, info: null })}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700 transition-colors"
            >
              <RefreshCw size={14} /> Try again
            </button>
            <a
              href="/errors"
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
            >
              View error log
            </a>
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
