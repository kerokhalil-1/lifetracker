// Hook for loading and managing courses
import { useState, useEffect, useCallback } from 'react';
import { listCourses, addCourse } from '../services/courseService.js';
import { useErrorLog } from '../context/ErrorLogContext.jsx';

const useCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addError } = useErrorLog();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const list = await listCourses();
      setCourses(list);
    } catch (err) {
      addError('useCourses', err);
    } finally {
      setLoading(false);
    }
  }, [addError]);

  useEffect(() => { load(); }, [load]);

  // Add a new course and refresh the list
  const addCourseFn = useCallback(async (data) => {
    try {
      await addCourse(data);
      await load();
    } catch (err) {
      addError('useCourses.addCourse', err);
    }
  }, [load, addError]);

  return { courses, loading, addCourse: addCourseFn, reload: load };
};

export default useCourses;
