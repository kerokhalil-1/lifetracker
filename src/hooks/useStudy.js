// Hook for loading and managing study topics and tasks
import { useState, useEffect, useCallback } from 'react';
import { today } from '../utils/dateUtils.js';
import { addTopic, listTopics, addTask, updateTask, deleteTask, listTasksByDate, listAllTasks } from '../services/studyService.js';
import { useErrorLog } from '../context/ErrorLogContext.jsx';

const useStudy = (dateStr = today()) => {
  const [todayTasks, setTodayTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addError } = useErrorLog();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [tasks, all, topicList] = await Promise.all([
        listTasksByDate(dateStr),
        listAllTasks(),
        listTopics(),
      ]);
      setTodayTasks(tasks);
      setAllTasks(all);
      setTopics(topicList);
    } catch (err) {
      setError(err.message);
      addError('useStudy', err);
    } finally {
      setLoading(false);
    }
  }, [dateStr, addError]);

  useEffect(() => { load(); }, [load]);

  const addTaskFn = async (taskData) => {
    try {
      await addTask(taskData);
      await load();
    } catch (err) {
      setError(err.message);
      addError('useStudy.addTask', err);
    }
  };

  const toggleTask = async (id, done) => {
    try {
      await updateTask(id, { done });
      await load();
    } catch (err) {
      setError(err.message);
      addError('useStudy.toggleTask', err);
    }
  };

  const removeTask = async (id) => {
    try {
      await deleteTask(id);
      await load();
    } catch (err) {
      setError(err.message);
      addError('useStudy.removeTask', err);
    }
  };

  const addTopicFn = async (topicData) => {
    try {
      await addTopic(topicData);
      await load();
    } catch (err) {
      setError(err.message);
      addError('useStudy.addTopic', err);
    }
  };

  return { todayTasks, allTasks, topics, loading, error, addTask: addTaskFn, toggleTask, removeTask, addTopic: addTopicFn, reload: load };
};

export default useStudy;
