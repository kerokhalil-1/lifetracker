// Hook for loading and managing study topics and tasks
// Uses optimistic updates: local state changes instantly, Firestore write follows, reverts on error.
import { useState, useEffect, useCallback } from 'react';
import { today } from '../utils/dateUtils.js';
import { addTopic, listTopics, addTask, updateTask, deleteTask, listTasksByDate } from '../services/studyService.js';
import { useErrorLog } from '../context/ErrorLogContext.jsx';

const useStudy = (dateStr = today()) => {
  const [todayTasks, setTodayTasks] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addError } = useErrorLog();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [tasks, topicList] = await Promise.all([
        listTasksByDate(dateStr),
        listTopics(),
      ]);
      setTodayTasks(tasks);
      setTopics(topicList);
    } catch (err) {
      setError(err.message);
      addError('useStudy', err);
    } finally {
      setLoading(false);
    }
  }, [dateStr, addError]);

  useEffect(() => { load(); }, [load]);

  // Optimistic toggle — flip done in UI, write to Firestore, revert on error (bug #8 fix)
  const toggleTask = async (id, done) => {
    setTodayTasks((prev) => prev.map((t) => t.id === id ? { ...t, done } : t));
    try {
      await updateTask(id, { done });
    } catch (err) {
      // Revert on failure
      setTodayTasks((prev) => prev.map((t) => t.id === id ? { ...t, done: !done } : t));
      setError(err.message);
      addError('useStudy.toggleTask', err);
    }
  };

  // Optimistic remove — remove from UI immediately, delete in Firestore, restore on error
  const removeTask = async (id) => {
    const prev = todayTasks.find((t) => t.id === id);
    setTodayTasks((ts) => ts.filter((t) => t.id !== id));
    try {
      await deleteTask(id);
    } catch (err) {
      if (prev) setTodayTasks((ts) => [...ts, prev]);
      setError(err.message);
      addError('useStudy.removeTask', err);
    }
  };

  // Optimistic add — push temp item instantly, swap id when Firestore confirms
  const addTaskFn = async (taskData) => {
    const tempId = `tmp-${Date.now()}`;
    const tempTask = { id: tempId, done: false, ...taskData };
    setTodayTasks((ts) => [...ts, tempTask]);
    try {
      const realId = await addTask(taskData);
      setTodayTasks((ts) => ts.map((t) => t.id === tempId ? { ...t, id: realId } : t));
    } catch (err) {
      setTodayTasks((ts) => ts.filter((t) => t.id !== tempId));
      setError(err.message);
      addError('useStudy.addTask', err);
    }
  };

  // Optimistic add topic — prepend to list, revert on error
  const addTopicFn = async (topicData) => {
    const tempId = `tmp-${Date.now()}`;
    const tempTopic = { id: tempId, ...topicData };
    setTopics((ts) => [tempTopic, ...ts]);
    try {
      const realId = await addTopic(topicData);
      setTopics((ts) => ts.map((t) => t.id === tempId ? { ...t, id: realId } : t));
    } catch (err) {
      setTopics((ts) => ts.filter((t) => t.id !== tempId));
      setError(err.message);
      addError('useStudy.addTopic', err);
    }
  };

  return { todayTasks, topics, loading, error, addTask: addTaskFn, toggleTask, removeTask, addTopic: addTopicFn, reload: load };
};

export default useStudy;
