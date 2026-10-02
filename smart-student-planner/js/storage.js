/**
 * storage.js
 * LocalStorage abstraction layer for Smart Student Planner
 * All data persistence goes through this module.
 */

const Storage = (() => {
  // Storage keys
  const KEYS = {
    USER: 'ssp_user',
    USERS: 'ssp_users',
    TASKS: 'ssp_tasks',
    TIMETABLE: 'ssp_timetable',
    ASSIGNMENTS: 'ssp_assignments',
    EXAMS: 'ssp_exams',
    SETTINGS: 'ssp_settings',
    SAMPLE_LOADED: 'ssp_sample_loaded',
  };

  /* ---- Generic helpers ---- */

  function get(key, defaultValue = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : defaultValue;
    } catch (e) {
      console.warn('Storage.get error:', key, e);
      return defaultValue;
    }
  }

  function set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn('Storage.set error:', key, e);
      return false;
    }
  }

  function remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('Storage.remove error:', key, e);
    }
  }

  /* ---- ID generator ---- */
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  /* ---- User / Auth ---- */

  function getUsers() {
    return get(KEYS.USERS, []);
  }

  function saveUser(user) {
    const users = getUsers();
    const idx = users.findIndex(u => u.email === user.email);
    if (idx >= 0) {
      users[idx] = user;
    } else {
      users.push(user);
    }
    set(KEYS.USERS, users);
  }

  function getUserByEmail(email) {
    return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  function getCurrentUser() {
    return get(KEYS.USER, null);
  }

  function setCurrentUser(user) {
    set(KEYS.USER, user);
  }

  function clearCurrentUser() {
    remove(KEYS.USER);
  }

  function updateCurrentUser(updates) {
    const user = getCurrentUser();
    if (!user) return false;
    const updated = { ...user, ...updates };
    setCurrentUser(updated);
    saveUser(updated);
    return true;
  }

  /* ---- Tasks ---- */

  function getTasks() {
    return get(KEYS.TASKS, []);
  }

  function saveTasks(tasks) {
    set(KEYS.TASKS, tasks);
  }

  function addTask(task) {
    const tasks = getTasks();
    const newId = generateId();
    const newTask = {
      title: task.title || 'Untitled Task',
      description: task.description || '',
      priority: task.priority || 'medium',
      dueDate: task.dueDate || '',
      completed: false,
      createdAt: new Date().toISOString(),
      ...task,
      id: newId, // always override with a fresh unique id
    };
    tasks.unshift(newTask);
    saveTasks(tasks);
    return newTask;
  }

  function updateTask(id, updates) {
    const tasks = getTasks();
    const idx = tasks.findIndex(t => t.id === id);
    if (idx < 0) return null;
    tasks[idx] = { ...tasks[idx], ...updates, updatedAt: new Date().toISOString() };
    saveTasks(tasks);
    return tasks[idx];
  }

  function deleteTask(id) {
    const tasks = getTasks().filter(t => t.id !== id);
    saveTasks(tasks);
  }

  /* ---- Timetable ---- */

  function getTimetable() {
    return get(KEYS.TIMETABLE, []);
  }

  function saveTimetable(entries) {
    set(KEYS.TIMETABLE, entries);
  }

  function addTimetableEntry(entry) {
    const entries = getTimetable();
    const newEntry = {
      id: generateId(),
      subject: entry.subject || '',
      day: entry.day || 'monday',
      startTime: entry.startTime || '09:00',
      endTime: entry.endTime || '10:00',
      room: entry.room || '',
      colorIndex: entry.colorIndex !== undefined ? entry.colorIndex : (entries.length % 8),
      createdAt: new Date().toISOString(),
    };
    entries.push(newEntry);
    saveTimetable(entries);
    return newEntry;
  }

  function updateTimetableEntry(id, updates) {
    const entries = getTimetable();
    const idx = entries.findIndex(e => e.id === id);
    if (idx < 0) return null;
    entries[idx] = { ...entries[idx], ...updates };
    saveTimetable(entries);
    return entries[idx];
  }

  function deleteTimetableEntry(id) {
    saveTimetable(getTimetable().filter(e => e.id !== id));
  }

  /* ---- Assignments ---- */

  function getAssignments() {
    return get(KEYS.ASSIGNMENTS, []);
  }

  function saveAssignments(assignments) {
    set(KEYS.ASSIGNMENTS, assignments);
  }

  function addAssignment(assignment) {
    const assignments = getAssignments();
    const newAssignment = {
      id: generateId(),
      subject: assignment.subject || '',
      title: assignment.title || 'Untitled Assignment',
      description: assignment.description || '',
      deadline: assignment.deadline || '',
      priority: assignment.priority || 'medium',
      completed: false,
      createdAt: new Date().toISOString(),
    };
    assignments.unshift(newAssignment);
    saveAssignments(assignments);
    return newAssignment;
  }

  function updateAssignment(id, updates) {
    const assignments = getAssignments();
    const idx = assignments.findIndex(a => a.id === id);
    if (idx < 0) return null;
    assignments[idx] = { ...assignments[idx], ...updates };
    saveAssignments(assignments);
    return assignments[idx];
  }

  function deleteAssignment(id) {
    saveAssignments(getAssignments().filter(a => a.id !== id));
  }

  /* ---- Exams (Calendar events) ---- */

  function getExams() {
    return get(KEYS.EXAMS, []);
  }

  function saveExams(exams) {
    set(KEYS.EXAMS, exams);
  }

  function addExam(exam) {
    const exams = getExams();
    const newExam = {
      id: generateId(),
      subject: exam.subject || '',
      description: exam.description || '',
      date: exam.date || '',
      createdAt: new Date().toISOString(),
    };
    exams.push(newExam);
    saveExams(exams);
    return newExam;
  }

  function updateExam(id, updates) {
    const exams = getExams();
    const idx = exams.findIndex(e => e.id === id);
    if (idx < 0) return null;
    exams[idx] = { ...exams[idx], ...updates };
    saveExams(exams);
    return exams[idx];
  }

  function deleteExam(id) {
    saveExams(getExams().filter(e => e.id !== id));
  }

  /* ---- Settings ---- */

  function getSettings() {
    return get(KEYS.SETTINGS, {
      theme: 'light',
      notifications: true,
    });
  }

  function saveSettings(settings) {
    set(KEYS.SETTINGS, { ...getSettings(), ...settings });
  }

  /* ---- Sample data ---- */

  function isSampleLoaded() {
    return get(KEYS.SAMPLE_LOADED, false);
  }

  function markSampleLoaded() {
    set(KEYS.SAMPLE_LOADED, true);
  }

  function resetSampleFlag() {
    remove(KEYS.SAMPLE_LOADED);
  }

  /* ---- Clear all app data ---- */

  function clearAllData() {
    Object.values(KEYS).forEach(key => {
      if (key !== KEYS.USER && key !== KEYS.USERS) {
        remove(key);
      }
    });
  }

  function clearEverything() {
    Object.values(KEYS).forEach(key => remove(key));
  }

  /* ---- Public API ---- */
  return {
    // User
    getUsers, saveUser, getUserByEmail,
    getCurrentUser, setCurrentUser, clearCurrentUser, updateCurrentUser,
    // Tasks
    getTasks, saveTasks, addTask, updateTask, deleteTask,
    // Timetable
    getTimetable, saveTimetable, addTimetableEntry, updateTimetableEntry, deleteTimetableEntry,
    // Assignments
    getAssignments, saveAssignments, addAssignment, updateAssignment, deleteAssignment,
    // Exams
    getExams, saveExams, addExam, updateExam, deleteExam,
    // Settings
    getSettings, saveSettings,
    // Utility
    generateId,
    isSampleLoaded, markSampleLoaded, resetSampleFlag,
    clearAllData, clearEverything,
  };
})();
