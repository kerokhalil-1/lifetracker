// Reusable modal overlay with title, Escape-key close, and basic focus trap
import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import en from '../../locales/en.js';

// All focusable elements that can receive Tab navigation
const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  const panelRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Close on Escape key + focus trap (bug #24 fix)
  useEffect(() => {
    if (!isOpen) return;

    // Remember what had focus before the modal opened
    previousFocusRef.current = document.activeElement;

    // Focus the first focusable element inside the modal (or the panel itself)
    const panel = panelRef.current;
    const firstFocusable = panel?.querySelector(FOCUSABLE);
    if (firstFocusable) firstFocusable.focus();
    else panel?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;

      // Trap Tab within the modal
      const focusable = Array.from(panel?.querySelectorAll(FOCUSABLE) || []);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      // Restore focus when modal closes
      previousFocusRef.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`relative bg-white rounded-2xl shadow-xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto focus:outline-none`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          {title && <h2 className="text-base font-semibold text-slate-800">{title}</h2>}
          <button
            onClick={onClose}
            className="ml-auto p-1 rounded-lg hover:bg-slate-100 text-slate-500 focus:outline-none"
            aria-label={en.common.close}
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  maxWidth: PropTypes.string,
};

export default Modal;
