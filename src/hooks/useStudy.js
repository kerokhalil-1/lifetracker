// Hook for loading and managing study topics and tasks
import { useState, useEffect, useCallback } from 'react';
import { today } from '../utils/dateUtils.js';
import { addTopic, listTopics, addTask, updateTask, deleteTask, listTasksByDate, listAllTasks } from '../services/studyService.js';

const useStudy = (dateStr = today()) => {
  const [todayTasks, setTodayTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    } finally {
      setLoading(false);
    }
  }, [dateStr]);

  useEffect(() => { load(); }, [load]);

  const addTaskFn = async (taskData) => {
    try {
      await addTask(taskData);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleTask = async (id, done) => {
    try {
      await updateTask(id, { done });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const removeTask = async (id) => {
    try {
      await deleteTask(id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const addTopicFn = async (topicData) => {
    try {
      await addTopic(topicData);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return { todayTasks, allTasks, topics, loading, error, addTask: addTaskFn, toggleTask, removeTask, addTopic: addTopicFn, reload: load };
};

export default useStudy;
