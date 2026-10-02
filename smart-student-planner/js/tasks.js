/**
 * tasks.js
 * To-Do List section – add, edit, delete, complete, search, filter, sort tasks
 */

let taskFilter  = 'all';
let taskSearch  = '';
let taskSort    = 'dueDate';
let editingTaskId = null;

function initTasks() {
  // Modal opened from outside (dashboard quick action)
  window.openAddTaskModal = function() {
    editingTaskId = null;
    openTaskModal();
  };
}

/* ============================================================
   RENDER
   ============================================================ */
function renderTasks() {
  const container = document.getElementById('tasks-content');
  if (!container) return;

  container.innerHTML = `
    <!-- Header -->
    <div class="section-header">
      <div>
        <h2 class="section-title">My Tasks</h2>
        <p class="section-subtitle">Manage and track your daily study tasks</p>
      </div>
      <button class="btn btn-primary" onclick="openAddTaskModal()" aria-label="Add new task">
        <i class="fa-solid fa-plus" aria-hidden="true"></i> Add Task
      </button>
    </div>

    <!-- Search + Filters -->
    <div class="card mb-lg" style="padding: var(--spacing-md);">
      <div class="search-bar">
        <div class="search-input-wrap" style="flex:2;">
          <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
          <input type="search" id="task-search" placeholder="Search tasks..." value="${escapeHtml(taskSearch)}"
            aria-label="Search tasks" />
        </div>
        <div class="filter-tabs" role="tablist" aria-label="Filter tasks">
          <button class="filter-tab ${taskFilter==='all'?'active':''}" role="tab"
            aria-selected="${taskFilter==='all'}" onclick="setTaskFilter('all')">All</button>
          <button class="filter-tab ${taskFilter==='pending'?'active':''}" role="tab"
            aria-selected="${taskFilter==='pending'}" onclick="setTaskFilter('pending')">Pending</button>
          <button class="filter-tab ${taskFilter==='completed'?'active':''}" role="tab"
            aria-selected="${taskFilter==='completed'}" onclick="setTaskFilter('completed')">Completed</button>
        </div>
        <select class="form-control" id="task-sort" style="max-width:160px;" aria-label="Sort tasks">
          <option value="dueDate" ${taskSort==='dueDate'?'selected':''}>Sort: Due Date</option>
          <option value="priority" ${taskSort==='priority'?'selected':''}>Sort: Priority</option>
          <option value="created" ${taskSort==='created'?'selected':''}>Sort: Newest</option>
        </select>
      </div>
    </div>

    <!-- Tasks List -->
    <div id="tasks-list" aria-label="Task list" aria-live="polite"></div>

    <!-- Add/Edit Task Modal -->
    ${renderTaskModal()}
  `;

  // Bind search input
  document.getElementById('task-search').addEventListener('input', e => {
    taskSearch = e.target.value;
    renderTaskList();
  });

  // Bind sort select
  document.getElementById('task-sort').addEventListener('change', e => {
    taskSort = e.target.value;
    renderTaskList();
  });

  renderTaskList();
  bindTaskModalEvents();
}

function renderTaskList() {
  const container = document.getElementById('tasks-list');
  if (!container) return;

  let tasks = Storage.getTasks();

  // Filter
  if (taskFilter === 'pending')   tasks = tasks.filter(t => !t.completed);
  if (taskFilter === 'completed') tasks = tasks.filter(t => t.completed);

  // Search
  if (taskSearch) {
    const q = taskSearch.toLowerCase();
    tasks = tasks.filter(t =>
      t.title.toLowerCase().includes(q) ||
      (t.description || '').toLowerCase().includes(q)
    );
  }

  // Sort
  const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };
  if (taskSort === 'dueDate') {
    tasks.sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
  } else if (taskSort === 'priority') {
    tasks.sort((a, b) => (PRIORITY_ORDER[a.priority] || 1) - (PRIORITY_ORDER[b.priority] || 1));
  } else {
    tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  if (tasks.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📝</div>
        <h3>${taskSearch ? 'No tasks found' : 'No tasks yet'}</h3>
        <p>${taskSearch ? 'Try a different search term.' : 'Add your first task to get started!'}</p>
        ${!taskSearch ? `<button class="btn btn-primary" onclick="openAddTaskModal()"><i class="fa-solid fa-plus"></i> Add Task</button>` : ''}
      </div>`;
    return;
  }

  container.innerHTML = tasks.map(task => `
    <div class="task-card ${task.completed ? 'completed' : ''}" id="task-${task.id}">
      <div class="task-checkbox ${task.completed ? 'checked' : ''}"
        onclick="toggleTaskComplete('${task.id}')"
        role="checkbox"
        aria-checked="${task.completed}"
        aria-label="${task.completed ? 'Mark as pending' : 'Mark as completed'}"
        tabindex="0"
        onkeydown="if(event.key==='Enter'||event.key===' ')toggleTaskComplete('${task.id}')"></div>
      <div class="task-body">
        <div class="task-title">${escapeHtml(task.title)}</div>
        ${task.description ? `<div class="task-desc">${escapeHtml(task.description)}</div>` : ''}
        <div class="task-meta">
          ${renderPriorityBadge(task.priority)}
          ${task.dueDate ? `<span class="task-date ${DateUtils.isOverdue(task.dueDate) && !task.completed ? 'overdue' : ''}">
            <i class="fa-regular fa-calendar" aria-hidden="true"></i>
            ${DateUtils.isOverdue(task.dueDate) && !task.completed ? '⚠ Overdue: ' : ''}${DateUtils.formatDate(task.dueDate)}
          </span>` : ''}
        </div>
      </div>
      <div class="task-actions">
        <button class="action-btn edit" onclick="editTask('${task.id}')" title="Edit task" aria-label="Edit task">
          <i class="fa-solid fa-pen" aria-hidden="true"></i>
        </button>
        <button class="action-btn delete" onclick="deleteTaskConfirm('${task.id}')" title="Delete task" aria-label="Delete task">
          <i class="fa-solid fa-trash" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  `).join('');
}

function renderPriorityBadge(priority) {
  const map = {
    high:   `<span class="badge badge-high"><i class="fa-solid fa-circle" style="font-size:6px"></i>High</span>`,
    medium: `<span class="badge badge-medium"><i class="fa-solid fa-circle" style="font-size:6px"></i>Medium</span>`,
    low:    `<span class="badge badge-low"><i class="fa-solid fa-circle" style="font-size:6px"></i>Low</span>`,
  };
  return map[priority] || '';
}

/* ============================================================
   ACTIONS
   ============================================================ */
function setTaskFilter(filter) {
  taskFilter = filter;
  renderTasks();
}

function toggleTaskComplete(id) {
  const task = Storage.getTasks().find(t => t.id === id);
  if (!task) return;
  Storage.updateTask(id, { completed: !task.completed });
  renderTaskList();
  updateSidebarBadges();
  Toast.success(task.completed ? 'Task marked as pending.' : 'Task completed! 🎉');
}

function editTask(id) {
  const task = Storage.getTasks().find(t => t.id === id);
  if (!task) return;
  editingTaskId = id;
  openTaskModal(task);
}

function deleteTaskConfirm(id) {
  const task = Storage.getTasks().find(t => t.id === id);
  if (!task) return;
  showConfirm('Delete Task', `Are you sure you want to delete "<strong>${escapeHtml(task.title)}</strong>"?`, () => {
    Storage.deleteTask(id);
    renderTaskList();
    updateSidebarBadges();
    Toast.success('Task deleted.');
  });
}

/* ============================================================
   MODAL
   ============================================================ */
function renderTaskModal() {
  return `
    <div class="modal-overlay" id="task-modal" role="dialog" aria-modal="true" aria-labelledby="task-modal-title">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title" id="task-modal-title">Add Task</h2>
          <button class="modal-close" aria-label="Close modal"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
        </div>
        <div class="modal-body">
          <form id="task-form" novalidate>
            <div class="form-group">
              <label class="form-label" for="task-title">Task Title *</label>
              <input type="text" id="task-title" class="form-control" placeholder="Enter task title" aria-required="true" aria-describedby="task-title-error" />
              <span class="form-error" id="task-title-error" role="alert"></span>
            </div>
            <div class="form-group">
              <label class="form-label" for="task-description">Description</label>
              <textarea id="task-description" class="form-control" placeholder="Optional details..." rows="3"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="task-priority">Priority</label>
                <select id="task-priority" class="form-control">
                  <option value="high">🔴 High</option>
                  <option value="medium" selected>🟡 Medium</option>
                  <option value="low">🟢 Low</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="task-due-date">Due Date</label>
                <input type="date" id="task-due-date" class="form-control" />
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" onclick="Modal.close('task-modal')">Cancel</button>
          <button class="btn btn-primary" id="task-save-btn" onclick="saveTask()">
            <i class="fa-solid fa-floppy-disk" aria-hidden="true"></i> Save Task
          </button>
        </div>
      </div>
    </div>
  `;
}

function openTaskModal(task = null) {
  const modal = document.getElementById('task-modal');
  if (!modal) { renderTasks(); return; }

  const titleEl = document.getElementById('task-modal-title');
  const titleInput = document.getElementById('task-title');
  const descInput  = document.getElementById('task-description');
  const prioSelect = document.getElementById('task-priority');
  const dateInput  = document.getElementById('task-due-date');
  const saveBtn    = document.getElementById('task-save-btn');

  if (task) {
    titleEl.textContent = 'Edit Task';
    titleInput.value    = task.title;
    descInput.value     = task.description || '';
    prioSelect.value    = task.priority || 'medium';
    dateInput.value     = task.dueDate || '';
    saveBtn.innerHTML   = '<i class="fa-solid fa-floppy-disk"></i> Update Task';
  } else {
    titleEl.textContent = 'Add New Task';
    document.getElementById('task-form').reset();
    prioSelect.value    = 'medium';
    saveBtn.innerHTML   = '<i class="fa-solid fa-floppy-disk"></i> Save Task';
  }

  Modal.open('task-modal');
}

function bindTaskModalEvents() {
  const form = document.getElementById('task-form');
  if (form) {
    form.addEventListener('keydown', e => {
      if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') saveTask();
    });
  }
}

function saveTask() {
  const valid = validateForm({
    'task-title': { required: true, requiredMsg: 'Please enter a task title.' },
  });
  if (!valid) return;

  const data = {
    title:       document.getElementById('task-title').value.trim(),
    description: document.getElementById('task-description').value.trim(),
    priority:    document.getElementById('task-priority').value,
    dueDate:     document.getElementById('task-due-date').value,
  };

  if (editingTaskId) {
    Storage.updateTask(editingTaskId, data);
    Toast.success('Task updated successfully!');
    editingTaskId = null;
  } else {
    Storage.addTask(data);
    Toast.success('Task added successfully!');
  }

  Modal.close('task-modal');
  renderTaskList();
  updateSidebarBadges();
}
