// Modal for selecting an existing course or creating a new one before starting a session
import { useState } from 'react';
import PropTypes from 'prop-types';
import { BookOpen, Plus } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import Spinner from '../ui/Spinner.jsx';
import en from '../../locales/en.js';

const CoursePickerModal = ({ isOpen, onClose, courses, loading, onSelect, onCreateCourse }) => {
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    await onCreateCourse({ name: name.trim(), description: desc.trim() });
    setName('');
    setDesc('');
    setShowCreate(false);
    setCreating(false);
  };

  const handleClose = () => {
    setShowCreate(false);
    setName('');
    setDesc('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={en.study.pickCourse} maxWidth="max-w-md">
      {loading ? (
        <Spinner className="py-8" />
      ) : showCreate ? (
        <div className="flex flex-col gap-3">
          <Input
            label={en.study.courseName}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. React Development"
          />
          <Input
            label={en.study.courseDesc}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Optional description"
          />
          <div className="flex gap-2 justify-end pt-1">
            <Button variant="ghost" onClick={() => setShowCreate(false)}>{en.common.cancel}</Button>
            <Button onClick={handleCreate} disabled={creating || !name.trim()}>
              {en.study.createCourse}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {courses.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">{en.study.noCourses}</p>
          )}
          {courses.map((course) => (
            <button
              key={course.id}
              type="button"
              onClick={() => { onSelect(course); handleClose(); }}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-slate-200 hover:border-sky-400 hover:bg-sky-50 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <BookOpen size={18} className="text-sky-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{course.name}</p>
                {course.description && (
                  <p className="text-xs text-slate-400 truncate">{course.description}</p>
                )}
              </div>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 w-full px-4 py-3 rounded-xl border border-dashed border-slate-300 hover:border-sky-400 hover:bg-sky-50 text-sm font-medium text-slate-500 hover:text-sky-600 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 mt-1"
          >
            <Plus size={16} />
            {en.study.newCourse}
          </button>
        </div>
      )}
    </Modal>
  );
};

CoursePickerModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  courses: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
  })).isRequired,
  loading: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  onCreateCourse: PropTypes.func.isRequired,
};

export default CoursePickerModal;
