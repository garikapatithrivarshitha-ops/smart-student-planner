/**
 * assignments.js
 * Assignment Tracker section – add, edit, delete, complete, filter assignments
 */

let assignmentFilter = 'all';
let editingAssignmentId = null;

function initAssignments() {
  window.openAddAssignmentModal = function() {
    editingAssignmentId = null;
    openAssignmentModal();
  };
}

/* ============================================================
   RENDER
   ============================================================ */
function renderAssignments() {
  const container = document.getElementById('assignments-content');
  if (!container) return;

  const all         = Storage.getAssignments();
  const pending     = all.filter(a => !a.completed && !DateUtils.isOverdue(a.deadline));
  const overdue     = all.filter(a => !a.completed && DateUtils.isOverdue(a.deadline));
  const completed   = all.filter(a => a.completed);

  container.innerHTML = `
    <!-- Header -->
    <div class="section-header">
      <div>
        <h2 class="section-title">Assignments</h2>
        <p class="section-subtitle">Track and manage your academic assignments</p>
      </div>
      <button class="btn btn-primary" onclick="openAddAssignmentModal()" aria-label="Add assignment">
        <i class="fa-solid fa-plus" aria-hidden="true"></i> Add Assignment
      </button>
    </div>

    <!-- Stats Row -->
    <div class="stats-grid mb-lg" style="grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));">
      ${assignmentStatCard('Total', all.length, 'blue')}
      ${assignmentStatCard('Pending', pending.length, 'orange')}
      ${assignmentStatCard('Overdue', overdue.length, 'red')}
      ${assignmentStatCard('Completed', completed.length, 'green')}
    </div>

    <!-- Filter Tabs -->
    <div class="card mb-lg" style="padding: var(--spacing-md);">
      <div class="filter-tabs" role="tablist" aria-label="Filter assignments">
        <button class="filter-tab ${assignmentFilter==='all'?'active':''}" role="tab" onclick="setAssignmentFilter('all')">All (${all.length})</button>
        <button class="filter-tab ${assignmentFilter==='pending'?'active':''}" role="tab" onclick="setAssignmentFilter('pending')">Pending (${pending.length})</button>
        <button class="filter-tab ${assignmentFilter==='overdue'?'active':''}" role="tab" onclick="setAssignmentFilter('overdue')">Overdue (${overdue.length})</button>
        <button class="filter-tab ${assignmentFilter==='completed'?'active':''}" role="tab" onclick="setAssignmentFilter('completed')">Completed (${completed.length})</button>
      </div>
    </div>

    <!-- List -->
    <div id="assignments-list" aria-live="polite"></div>

    <!-- Modal -->
    ${renderAssignmentModal()}
  `;

  renderAssignmentList();
  bindAssignmentModalEvents();
}

function assignmentStatCard(label, value, color) {
  const icons = { blue: 'fa-file-lines', orange: 'fa-hourglass-half', red: 'fa-triangle-exclamation', green: 'fa-circle-check' };
  return `
    <div class="stat-card">
      <div class="stat-icon ${color}"><i class="fa-solid ${icons[color]}" aria-hidden="true"></i></div>
      <div class="stat-info">
        <div class="stat-value">${value}</div>
        <div class="stat-label">${label}</div>
      </div>
    </div>
  `;
}

function renderAssignmentList() {
  const container = document.getElementById('assignments-list');
  if (!container) return;

  let assignments = Storage.getAssignments();

  if (assignmentFilter === 'pending') {
    assignments = assignments.filter(a => !a.completed && !DateUtils.isOverdue(a.deadline));
  } else if (assignmentFilter === 'overdue') {
    assignments = assignments.filter(a => !a.completed && DateUtils.isOverdue(a.deadline));
  } else if (assignmentFilter === 'completed') {
    assignments = assignments.filter(a => a.completed);
  }

  // Sort: overdue first, then by deadline
  assignments.sort((a, b) => {
    if (DateUtils.isOverdue(a.deadline) && !a.completed && !DateUtils.isOverdue(b.deadline)) return -1;
    if (!DateUtils.isOverdue(a.deadline) && DateUtils.isOverdue(b.deadline) && !b.completed) return 1;
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return new Date(a.deadline) - new Date(b.deadline);
  });

  if (assignments.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📚</div>
        <h3>${assignmentFilter === 'overdue' ? 'No overdue assignments' : 'No assignments here'}</h3>
        <p>${assignmentFilter === 'overdue' ? "You're all caught up! 🎉" : 'Add your first assignment to get started.'}</p>
        ${assignmentFilter === 'all' ? `<button class="btn btn-primary" onclick="openAddAssignmentModal()"><i class="fa-solid fa-plus"></i> Add Assignment</button>` : ''}
      </div>`;
    return;
  }

  container.innerHTML = assignments.map(a => {
    const isOverdue = !a.completed && DateUtils.isOverdue(a.deadline);
    const isDueSoon = !a.completed && !isOverdue && DateUtils.isDueSoon(a.deadline, 3);
    const statusClass = a.completed ? 'completed' : isOverdue ? 'overdue' : isDueSoon ? 'due-soon' : '';
    const days = DateUtils.daysUntil(a.deadline);

    return `
      <div class="assignment-card ${statusClass}" id="assignment-${a.id}">
        <div class="assignment-header">
          <div style="flex:1; min-width:0;">
            <div class="assignment-subject">${escapeHtml(a.subject)}</div>
            <div class="assignment-title">${escapeHtml(a.title)}</div>
          </div>
          <div style="display:flex; gap:4px; flex-shrink:0;">
            ${renderPriorityBadge(a.priority)}
          </div>
        </div>
        ${a.description ? `<div class="assignment-desc">${escapeHtml(a.description)}</div>` : ''}
        <div class="assignment-footer">
          <div class="deadline-info ${isOverdue ? 'overdue' : isDueSoon ? 'due-soon' : ''}">
            <i class="fa-regular fa-calendar" aria-hidden="true"></i>
            ${a.deadline ? `<span>Due: ${DateUtils.formatDate(a.deadline)}</span>` : '<span>No deadline</span>'}
            ${a.deadline && !a.completed ? `<span class="badge ${isOverdue ? 'badge-overdue' : isDueSoon ? 'badge-medium' : 'badge-pending'}">
              ${isOverdue ? `⚠ ${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : days === 1 ? 'Due tomorrow' : `${days}d left`}
            </span>` : ''}
            ${a.completed ? `<span class="badge badge-done">✓ Completed</span>` : ''}
          </div>
          <div style="display:flex; gap:4px; align-items:center;">
            ${!a.completed ? `
              <button class="btn btn-success btn-sm" onclick="completeAssignment('${a.id}')" aria-label="Mark as completed">
                <i class="fa-solid fa-check" aria-hidden="true"></i> Complete
              </button>
            ` : `
              <button class="btn btn-ghost btn-sm" onclick="undoCompleteAssignment('${a.id}')" aria-label="Mark as pending">
                <i class="fa-solid fa-rotate-left" aria-hidden="true"></i> Undo
              </button>
            `}
            <button class="action-btn edit" onclick="editAssignment('${a.id}')" title="Edit" aria-label="Edit assignment">
              <i class="fa-solid fa-pen" aria-hidden="true"></i>
            </button>
            <button class="action-btn delete" onclick="deleteAssignmentConfirm('${a.id}')" title="Delete" aria-label="Delete assignment">
              <i class="fa-solid fa-trash" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/* ============================================================
   ACTIONS
   ============================================================ */
function setAssignmentFilter(filter) {
  assignmentFilter = filter;
  renderAssignments();
}

function completeAssignment(id) {
  Storage.updateAssignment(id, { completed: true });
  renderAssignmentList();
  renderAssignments();
  updateSidebarBadges();
  Toast.success('Assignment marked as completed! 🎉');
}

function undoCompleteAssignment(id) {
  Storage.updateAssignment(id, { completed: false });
  renderAssignments();
  updateSidebarBadges();
  Toast.info('Assignment marked as pending.');
}

function editAssignment(id) {
  const a = Storage.getAssignments().find(x => x.id === id);
  if (!a) return;
  editingAssignmentId = id;
  openAssignmentModal(a);
}

function deleteAssignmentConfirm(id) {
  const a = Storage.getAssignments().find(x => x.id === id);
  if (!a) return;
  showConfirm('Delete Assignment', `Delete "<strong>${escapeHtml(a.title)}</strong>"?`, () => {
    Storage.deleteAssignment(id);
    renderAssignments();
    updateSidebarBadges();
    Toast.success('Assignment deleted.');
  });
}

/* ============================================================
   MODAL
   ============================================================ */
function renderAssignmentModal() {
  return `
    <div class="modal-overlay" id="assignment-modal" role="dialog" aria-modal="true" aria-labelledby="assignment-modal-title">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title" id="assignment-modal-title">Add Assignment</h2>
          <button class="modal-close" aria-label="Close modal"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
        </div>
        <div class="modal-body">
          <form id="assignment-form" novalidate>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="assignment-subject">Subject *</label>
                <input type="text" id="assignment-subject" class="form-control" placeholder="e.g. Data Structures" aria-required="true" aria-describedby="assignment-subject-error" />
                <span class="form-error" id="assignment-subject-error" role="alert"></span>
              </div>
              <div class="form-group">
                <label class="form-label" for="assignment-priority">Priority</label>
                <select id="assignment-priority" class="form-control">
                  <option value="high">🔴 High</option>
                  <option value="medium" selected>🟡 Medium</option>
                  <option value="low">🟢 Low</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label" for="assignment-title">Assignment Title *</label>
              <input type="text" id="assignment-title" class="form-control" placeholder="Enter assignment title" aria-required="true" aria-describedby="assignment-title-error" />
              <span class="form-error" id="assignment-title-error" role="alert"></span>
            </div>
            <div class="form-group">
              <label class="form-label" for="assignment-description">Description</label>
              <textarea id="assignment-description" class="form-control" placeholder="Optional details..." rows="3"></textarea>
            </div>
            <div class="form-group">
              <label class="form-label" for="assignment-deadline">Deadline</label>
              <input type="date" id="assignment-deadline" class="form-control" />
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" onclick="Modal.close('assignment-modal')">Cancel</button>
          <button class="btn btn-primary" onclick="saveAssignment()">
            <i class="fa-solid fa-floppy-disk" aria-hidden="true"></i> Save
          </button>
        </div>
      </div>
    </div>
  `;
}

function openAssignmentModal(assignment = null) {
  const modal = document.getElementById('assignment-modal');
  if (!modal) { renderAssignments(); return; }

  if (assignment) {
    document.getElementById('assignment-modal-title').textContent = 'Edit Assignment';
    document.getElementById('assignment-subject').value     = assignment.subject;
    document.getElementById('assignment-title').value       = assignment.title;
    document.getElementById('assignment-description').value = assignment.description || '';
    document.getElementById('assignment-deadline').value    = assignment.deadline || '';
    document.getElementById('assignment-priority').value    = assignment.priority || 'medium';
  } else {
    document.getElementById('assignment-modal-title').textContent = 'Add Assignment';
    document.getElementById('assignment-form').reset();
    document.getElementById('assignment-priority').value = 'medium';
  }

  Modal.open('assignment-modal');
}

function bindAssignmentModalEvents() {
  // handled by inline onclick
}

function saveAssignment() {
  const valid = validateForm({
    'assignment-subject': { required: true, requiredMsg: 'Subject is required.' },
    'assignment-title':   { required: true, requiredMsg: 'Title is required.'   },
  });
  if (!valid) return;

  const data = {
    subject:     document.getElementById('assignment-subject').value.trim(),
    title:       document.getElementById('assignment-title').value.trim(),
    description: document.getElementById('assignment-description').value.trim(),
    deadline:    document.getElementById('assignment-deadline').value,
    priority:    document.getElementById('assignment-priority').value,
  };

  if (editingAssignmentId) {
    Storage.updateAssignment(editingAssignmentId, data);
    Toast.success('Assignment updated!');
    editingAssignmentId = null;
  } else {
    Storage.addAssignment(data);
    Toast.success('Assignment added!');
  }

  Modal.close('assignment-modal');
  renderAssignments();
  updateSidebarBadges();
}
