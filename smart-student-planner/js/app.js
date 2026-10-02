/**
 * app.js
 * Shared application utilities for Smart Student Planner
 * - Toast notification system
 * - Modal management
 * - Date/time helpers
 * - Sample data loader
 * - App initialization
 */

/* ============================================================
   TOAST NOTIFICATION SYSTEM
   ============================================================ */
const Toast = (() => {
  let container = null;

  function getContainer() {
    if (!container) {
      container = document.getElementById('toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
      }
    }
    return container;
  }

  const ICONS = {
    success: 'fa-circle-check',
    error: 'fa-circle-xmark',
    warning: 'fa-triangle-exclamation',
    info: 'fa-circle-info',
  };

  function show(message, type = 'info', duration = 3000) {
    const c = getContainer();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.innerHTML = `
      <i class="fa-solid ${ICONS[type] || ICONS.info} toast-icon" aria-hidden="true"></i>
      <span>${message}</span>
    `;
    c.appendChild(toast);

    // Auto remove
    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 350);
    }, duration);
  }

  return {
    success: (msg, dur) => show(msg, 'success', dur),
    error:   (msg, dur) => show(msg, 'error',   dur),
    warning: (msg, dur) => show(msg, 'warning', dur),
    info:    (msg, dur) => show(msg, 'info',    dur),
  };
})();

/* ============================================================
   MODAL MANAGEMENT
   ============================================================ */
const Modal = (() => {
  function open(id) {
    const overlay = document.getElementById(id);
    if (!overlay) return;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    // Focus first input
    setTimeout(() => {
      const first = overlay.querySelector('input, textarea, select, button:not(.modal-close)');
      if (first) first.focus();
    }, 100);
  }

  function close(id) {
    const overlay = document.getElementById(id);
    if (!overlay) return;
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function closeAll() {
    document.querySelectorAll('.modal-overlay.open').forEach(el => {
      el.classList.remove('open');
    });
    document.body.style.overflow = '';
  }

  // Close on overlay click
  document.addEventListener('click', e => {
    if (e.target.classList.contains('modal-overlay')) {
      closeAll();
    }
    if (e.target.classList.contains('modal-close') || e.target.closest('.modal-close')) {
      const overlay = e.target.closest('.modal-overlay');
      if (overlay) close(overlay.id);
    }
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAll();
  });

  return { open, close, closeAll };
})();

/* ============================================================
   CONFIRM DIALOG
   ============================================================ */
function showConfirm(title, message, onConfirm, danger = true) {
  // Remove existing confirm if any
  const existing = document.getElementById('confirm-dialog-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'confirm-dialog-overlay';
  overlay.className = 'modal-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'confirm-title');
  overlay.innerHTML = `
    <div class="confirm-dialog">
      <div class="confirm-icon">${danger ? '⚠️' : '❓'}</div>
      <h3 id="confirm-title">${title}</h3>
      <p>${message}</p>
      <div class="confirm-buttons">
        <button class="btn btn-ghost" id="confirm-cancel">Cancel</button>
        <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" id="confirm-ok">${danger ? 'Delete' : 'Confirm'}</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // Animate in
  requestAnimationFrame(() => overlay.classList.add('open'));

  function destroy() {
    overlay.classList.remove('open');
    setTimeout(() => overlay.remove(), 300);
    document.body.style.overflow = '';
  }

  overlay.querySelector('#confirm-cancel').addEventListener('click', destroy);
  overlay.querySelector('#confirm-ok').addEventListener('click', () => {
    destroy();
    onConfirm();
  });
  overlay.addEventListener('click', e => {
    if (e.target === overlay) destroy();
  });
  document.body.style.overflow = 'hidden';
}

/* ============================================================
   DATE / TIME HELPERS
   ============================================================ */
const DateUtils = (() => {
  const MONTHS = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];
  const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const SHORT_DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  function today() {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d)) return dateStr;
    return `${SHORT_MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }

  function formatDateLong(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d)) return dateStr;
    return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }

  function isOverdue(dateStr) {
    if (!dateStr) return false;
    return new Date(dateStr + 'T23:59:59') < new Date();
  }

  function isDueSoon(dateStr, days = 3) {
    if (!dateStr) return false;
    const due = new Date(dateStr + 'T23:59:59');
    const now = new Date();
    const diff = (due - now) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= days;
  }

  function daysUntil(dateStr) {
    if (!dateStr) return null;
    const due = new Date(dateStr + 'T00:00:00');
    const now = new Date();
    now.setHours(0,0,0,0);
    return Math.round((due - now) / (1000 * 60 * 60 * 24));
  }

  function formatRelative(dateStr) {
    const days = daysUntil(dateStr);
    if (days === null) return '';
    if (days < 0)  return `${Math.abs(days)}d overdue`;
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `Due in ${days} days`;
  }

  function formatTime(timeStr) {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${pad(m)} ${period}`;
  }

  function getCurrentDay() {
    return DAYS[new Date().getDay()].toLowerCase();
  }

  function getMonthYear(year, month) {
    return `${MONTHS[month]} ${year}`;
  }

  function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
  }

  function todayDisplay() {
    const d = new Date();
    return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }

  return {
    today, pad, formatDate, formatDateLong, formatTime,
    isOverdue, isDueSoon, daysUntil, formatRelative,
    getCurrentDay, getMonthYear, getDaysInMonth, getFirstDayOfMonth,
    todayDisplay, MONTHS, SHORT_MONTHS, DAYS, SHORT_DAYS,
  };
})();

/* ============================================================
   SAMPLE DATA LOADER
   ============================================================ */
function loadSampleData() {
  if (Storage.isSampleLoaded()) return;

  const today = new Date();
  const addDays = (d, n) => {
    const r = new Date(d);
    r.setDate(r.getDate() + n);
    return r.toISOString().split('T')[0];
  };

  // Sample Tasks
  const sampleTasks = [
    {
      title: 'Complete Data Structures Assignment',
      description: 'Implement a binary search tree with insert, delete and traversal operations.',
      priority: 'high',
      dueDate: addDays(today, 2),
    },
    {
      title: 'Read Chapter 5 – Operating Systems',
      description: 'Process scheduling algorithms: FCFS, SJF, and Round Robin.',
      priority: 'medium',
      dueDate: addDays(today, 4),
    },
    {
      title: 'Submit Lab Report – Networks',
      description: 'Document the Wireshark packet analysis experiment.',
      priority: 'high',
      dueDate: addDays(today, 1),
    },
    {
      title: 'Prepare slides for Database presentation',
      description: 'Cover normalization forms 1NF, 2NF, 3NF with examples.',
      priority: 'medium',
      dueDate: addDays(today, 5),
    },
    {
      title: 'Practice previous year exam papers',
      description: '',
      priority: 'low',
      dueDate: addDays(today, 7),
    },
    {
      title: 'Revise C++ templates and STL',
      description: 'Focus on vectors, maps, and iterators.',
      priority: 'medium',
      dueDate: addDays(today, 3),
      completed: true,
    },
  ];
  sampleTasks.forEach(t => Storage.addTask(t));

  // Sample Timetable
  const sampleSlots = [
    { subject: 'Data Structures',  day: 'monday',    startTime: '09:00', endTime: '10:00', room: 'CS-101', colorIndex: 0 },
    { subject: 'Computer Networks',day: 'monday',    startTime: '11:00', endTime: '12:00', room: 'CS-205', colorIndex: 1 },
    { subject: 'DBMS',             day: 'tuesday',   startTime: '09:00', endTime: '10:30', room: 'CS-301', colorIndex: 2 },
    { subject: 'Operating Systems',day: 'tuesday',   startTime: '01:00', endTime: '02:00', room: 'CS-102', colorIndex: 3 },
    { subject: 'Data Structures',  day: 'wednesday', startTime: '10:00', endTime: '11:00', room: 'CS-101', colorIndex: 0 },
    { subject: 'Mathematics',      day: 'wednesday', startTime: '02:00', endTime: '03:00', room: 'M-201',  colorIndex: 4 },
    { subject: 'Computer Networks',day: 'thursday',  startTime: '09:00', endTime: '10:00', room: 'CS-205', colorIndex: 1 },
    { subject: 'DBMS Lab',         day: 'thursday',  startTime: '02:00', endTime: '04:00', room: 'CS-Lab', colorIndex: 2 },
    { subject: 'Operating Systems',day: 'friday',    startTime: '09:00', endTime: '10:00', room: 'CS-102', colorIndex: 3 },
    { subject: 'Mathematics',      day: 'friday',    startTime: '11:00', endTime: '12:00', room: 'M-201',  colorIndex: 4 },
    { subject: 'Networks Lab',     day: 'saturday',  startTime: '10:00', endTime: '12:00', room: 'CS-Lab2',colorIndex: 1 },
  ];
  sampleSlots.forEach(s => Storage.addTimetableEntry(s));

  // Sample Assignments
  const sampleAssignments = [
    {
      subject: 'Data Structures',
      title: 'Binary Search Tree Implementation',
      description: 'Implement insert, delete, search, and all traversal methods.',
      deadline: addDays(today, 3),
      priority: 'high',
    },
    {
      subject: 'Computer Networks',
      title: 'Subnetting Practice Problems',
      description: 'Solve the 20 subnetting exercises from Chapter 4.',
      deadline: addDays(today, 5),
      priority: 'medium',
    },
    {
      subject: 'DBMS',
      title: 'ER Diagram for Library Management System',
      description: 'Design a complete ER diagram with all entities, attributes, and relationships.',
      deadline: addDays(today, 7),
      priority: 'medium',
    },
    {
      subject: 'Operating Systems',
      title: 'CPU Scheduling Simulation',
      description: 'Write a program to simulate FCFS and Round Robin scheduling.',
      deadline: addDays(today, -2),
      priority: 'high',
      completed: true,
    },
  ];
  sampleAssignments.forEach(a => Storage.addAssignment(a));

  // Sample Exams
  const sampleExams = [
    { subject: 'Data Structures', description: 'Mid-semester examination – Units 1 to 4', date: addDays(today, 10) },
    { subject: 'Computer Networks', description: 'Mid-semester examination – Chapters 1 to 5', date: addDays(today, 14) },
    { subject: 'DBMS', description: 'Unit test – Normalization and SQL', date: addDays(today, 6) },
    { subject: 'Mathematics', description: 'Internal assessment – Calculus', date: addDays(today, 20) },
    { subject: 'Operating Systems', description: 'Unit test – Process management', date: addDays(today, 18) },
  ];
  sampleExams.forEach(e => Storage.addExam(e));

  Storage.markSampleLoaded();
}

/* ============================================================
   UI HELPERS
   ============================================================ */

/**
 * Renders an empty state message in a container element
 */
function renderEmptyState(container, icon, title, message, btnLabel, btnAction) {
  container.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">${icon}</div>
      <h3>${title}</h3>
      <p>${message}</p>
      ${btnLabel ? `<button class="btn btn-primary" onclick="${btnAction}">${btnLabel}</button>` : ''}
    </div>
  `;
}

/**
 * Sanitize HTML to prevent XSS
 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str || ''));
  return div.innerHTML;
}

/**
 * Validate form fields and show error messages
 * @param {Object} rules - { fieldId: { required, minLength, match, matchId } }
 * @returns {boolean}
 */
function validateForm(rules) {
  let valid = true;
  Object.entries(rules).forEach(([fieldId, rule]) => {
    const el = document.getElementById(fieldId);
    if (!el) return;
    const val = el.value.trim();
    const errEl = document.getElementById(fieldId + '-error');

    let msg = '';
    if (rule.required && !val) {
      msg = rule.requiredMsg || 'This field is required.';
    } else if (rule.minLength && val.length < rule.minLength) {
      msg = rule.minLengthMsg || `Minimum ${rule.minLength} characters required.`;
    } else if (rule.email && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      msg = 'Please enter a valid email address.';
    } else if (rule.match && val !== document.getElementById(rule.match)?.value?.trim()) {
      msg = rule.matchMsg || 'Values do not match.';
    }

    if (msg) {
      el.classList.add('error');
      if (errEl) errEl.textContent = msg;
      valid = false;
    } else {
      el.classList.remove('error');
      if (errEl) errEl.textContent = '';
    }
  });
  return valid;
}

/**
 * Update sidebar badges from storage counts
 */
function updateSidebarBadges() {
  const tasks = Storage.getTasks();
  const pending = tasks.filter(t => !t.completed).length;
  const el = document.getElementById('badge-tasks');
  if (el) {
    el.textContent = pending > 0 ? pending : '';
    el.style.display = pending > 0 ? '' : 'none';
  }

  const assignments = Storage.getAssignments();
  const pendingA = assignments.filter(a => !a.completed).length;
  const elA = document.getElementById('badge-assignments');
  if (elA) {
    elA.textContent = pendingA > 0 ? pendingA : '';
    elA.style.display = pendingA > 0 ? '' : 'none';
  }
}

/* ============================================================
   APP INIT - called once DOM is ready
   ============================================================ */
function initApp() {
  // Apply saved theme
  const settings = Storage.getSettings();
  if (settings.theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  // Update topbar date
  const dateEl = document.getElementById('topbar-date');
  if (dateEl) dateEl.textContent = DateUtils.todayDisplay();

  // Update sidebar user info
  const user = Storage.getCurrentUser();
  if (user) {
    const nameEl = document.getElementById('sidebar-user-name');
    if (nameEl) nameEl.textContent = user.name;
    const avatarEl = document.getElementById('sidebar-avatar');
    if (avatarEl) avatarEl.textContent = user.name.charAt(0).toUpperCase();
  }

  // Sidebar toggle (mobile)
  const toggleBtn = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      if (overlay) overlay.classList.toggle('open');
    });
  }

  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('open');
    });
  }

  // Navigation
  document.querySelectorAll('.nav-item[data-section]').forEach(item => {
    item.addEventListener('click', () => {
      const section = item.dataset.section;
      navigateTo(section);
      // Close mobile sidebar
      if (sidebar) sidebar.classList.remove('open');
      if (overlay) overlay.classList.remove('open');
    });
  });

  // Logout button(s)
  document.querySelectorAll('.logout-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      showConfirm('Logout', 'Are you sure you want to logout?', () => {
        Storage.clearCurrentUser();
        window.location.href = 'login.html';
      }, false);
    });
  });

  // Check auth
  const currentUser = Storage.getCurrentUser();
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  // Load sample data on first visit
  loadSampleData();

  // Update badges
  updateSidebarBadges();

  // Navigate to saved section or default
  const hash = window.location.hash.slice(1) || 'dashboard';
  navigateTo(hash);
}

/**
 * Navigate to a section
 */
function navigateTo(section) {
  // Validate section
  const validSections = ['dashboard','tasks','timetable','assignments','calendar','progress','settings'];
  if (!validSections.includes(section)) section = 'dashboard';

  // Hide all sections
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  // Show target section
  const target = document.getElementById('section-' + section);
  if (target) target.classList.add('active');

  // Highlight nav
  const navItem = document.querySelector(`.nav-item[data-section="${section}"]`);
  if (navItem) navItem.classList.add('active');

  // Update page title
  const titles = {
    dashboard: 'Dashboard',
    tasks: 'My Tasks',
    timetable: 'Study Timetable',
    assignments: 'Assignments',
    calendar: 'Exam Calendar',
    progress: 'Study Progress',
    settings: 'Profile & Settings',
  };
  const pageTitle = document.getElementById('page-title');
  if (pageTitle) pageTitle.textContent = titles[section] || 'Dashboard';

  // Update hash
  window.location.hash = section;

  // Trigger section-specific refresh
  const event = new CustomEvent('sectionActivated', { detail: { section } });
  document.dispatchEvent(event);
}

// Make navigateTo globally accessible
window.navigateTo = navigateTo;
window.Toast = Toast;
window.Modal = Modal;
window.showConfirm = showConfirm;
window.DateUtils = DateUtils;
window.escapeHtml = escapeHtml;
window.validateForm = validateForm;
window.updateSidebarBadges = updateSidebarBadges;
window.renderEmptyState = renderEmptyState;
