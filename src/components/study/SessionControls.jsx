// Pause / Resume / Finish / Cancel action buttons for the live session
import PropTypes from 'prop-types';
import { Pause, Play, CheckCircle, X } from 'lucide-react';
import Button from '../ui/Button.jsx';
import en from '../../locales/en.js';

const SessionControls = ({ status, onPause, onResume, onFinish, onCancel }) => (
  <div className="flex flex-col gap-3 w-full">
    <div className="flex gap-2 justify-center flex-wrap">
      {status === 'running' && (
        <Button variant="secondary" onClick={onPause} size="lg" className="gap-2">
          <Pause size={18} /> {en.study.pauseSession}
        </Button>
      )}
      {status === 'paused' && (
        <Button onClick={onResume} size="lg" className="gap-2">
          <Play size={18} /> {en.study.resumeSession}
        </Button>
      )}
      <Button
        variant={status === 'paused' ? 'secondary' : 'primary'}
        onClick={onFinish}
        size="lg"
        className="gap-2"
      >
        <CheckCircle size={18} /> {en.study.finishSession}
      </Button>
    </div>
    <div className="flex justify-center">
      <Button variant="ghost" onClick={onCancel} size="sm" className="text-slate-400 hover:text-red-500">
        <X size={14} /> {en.study.cancelSession}
      </Button>
    </div>
  </div>
);

SessionControls.propTypes = {
  status: PropTypes.oneOf(['running', 'paused']).isRequired,
  onPause: PropTypes.func.isRequired,
  onResume: PropTypes.func.isRequired,
  onFinish: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default SessionControls;
