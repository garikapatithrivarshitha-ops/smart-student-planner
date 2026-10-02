/**
 * calendar.js
 * Exam Calendar section – monthly calendar view, add/edit/delete exam events
 */

let calYear  = new Date().getFullYear();
let calMonth = new Date().getMonth(); // 0-indexed
let editingExamId = null;

function initCalendar() {
  window.openAddExamModal = function(dateStr = '') {
    editingExamId = null;
    openExamModal(null, dateStr);
  };
}

/* ============================================================
   RENDER
   ============================================================ */
function renderCalendar() {
  const container = document.getElementById('calendar-content');
  if (!container) return;

  const exams = Storage.getExams();
  const today = DateUtils.today();

  container.innerHTML = `
    <!-- Header -->
    <div class="section-header">
      <div>
        <h2 class="section-title">Exam Calendar</h2>
        <p class="section-subtitle">View and manage your examination schedule</p>
      </div>
      <button class="btn btn-primary" onclick="openAddExamModal()" aria-label="Add exam">
        <i class="fa-solid fa-plus" aria-hidden="true"></i> Add Exam
      </button>
    </div>

    <!-- Main layout: calendar + sidebar -->
    <div style="display:grid; grid-template-columns: 1fr min(320px, 100%); gap: var(--spacing-lg); align-items:start;"
         class="calendar-layout">

      <!-- Calendar Card -->
      <div class="card">
        <div class="card-header">
          <div class="calendar-nav" style="width:100%; margin:0;">
            <button class="btn btn-ghost btn-sm" onclick="changeCalendarMonth(-1)" aria-label="Previous month">
              <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
            </button>
            <span class="calendar-month-year" aria-live="polite">${DateUtils.getMonthYear(calYear, calMonth)}</span>
            <button class="btn btn-ghost btn-sm" onclick="changeCalendarMonth(1)" aria-label="Next month">
              <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
            </button>
          </div>
        </div>
        <div class="card-body">
          ${renderCalendarGrid(calYear, calMonth, exams, today)}
        </div>
      </div>

      <!-- Upcoming Exams sidebar -->
      <div>
        <div class="card">
          <div class="card-header">
            <span class="card-title"><i class="fa-solid fa-clock" aria-hidden="true"></i> Upcoming Exams</span>
          </div>
          <div class="card-body">
            ${renderUpcomingExams(exams, today)}
          </div>
        </div>

        <!-- Legend -->
        <div class="card mt-lg" style="padding: var(--spacing-md);">
          <div style="font-weight:700; font-size:13px; margin-bottom:8px; color:var(--text-primary);">Legend</div>
          <div style="display:flex; flex-direction:column; gap:6px; font-size:12px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <div style="width:14px;height:14px;border-radius:50%;background:var(--primary);flex-shrink:0;"></div>
              <span>Today</span>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <div style="width:14px;height:14px;border-radius:3px;background:var(--primary-200);flex-shrink:0;"></div>
              <span>Has exam(s)</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- All Exams list -->
    <div class="card mt-lg">
      <div class="card-header">
        <span class="card-title"><i class="fa-solid fa-list" aria-hidden="true"></i> All Exams (${exams.length})</span>
      </div>
      <div class="card-body">
        ${renderAllExams(exams, today)}
      </div>
    </div>

    <!-- Modal -->
    ${renderExamModal()}
  `;

  bindExamModalEvents();
}

function renderCalendarGrid(year, month, exams, today) {
  const daysInMonth   = DateUtils.getDaysInMonth(year, month);
  const firstDay      = DateUtils.getFirstDayOfMonth(year, month); // 0=Sun

  // Map exam dates for fast lookup
  const examMap = {};
  exams.forEach(e => {
    if (e.date) {
      if (!examMap[e.date]) examMap[e.date] = [];
      examMap[e.date].push(e);
    }
  });

  const dayHeaders = DateUtils.SHORT_DAYS;
  let cells = '';

  // Day header row
  const headerRow = dayHeaders.map(d => `<div class="calendar-day-header">${d}</div>`).join('');

  // Blank cells before first day
  for (let i = 0; i < firstDay; i++) {
    cells += `<div class="calendar-day other-month"><span class="day-number"></span></div>`;
  }

  // Day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${DateUtils.pad(month + 1)}-${DateUtils.pad(day)}`;
    const isToday = dateStr === today;
    const dayExams = examMap[dateStr] || [];
    const hasEvents = dayExams.length > 0;

    cells += `
      <div class="calendar-day ${isToday ? 'today' : ''} ${hasEvents ? 'has-events' : ''}"
        onclick="openAddExamModal('${dateStr}')"
        role="button"
        tabindex="0"
        aria-label="${day} ${DateUtils.MONTHS[month]}${isToday ? ' (Today)' : ''}${hasEvents ? `, ${dayExams.length} exam(s)` : ''}"
        onkeydown="if(event.key==='Enter')openAddExamModal('${dateStr}')">
        <span class="day-number">${day}</span>
        <div class="day-events">
          ${dayExams.slice(0, 2).map(e => `
            <div class="day-event-dot" title="${escapeHtml(e.subject)}">${escapeHtml(e.subject)}</div>
          `).join('')}
          ${dayExams.length > 2 ? `<div class="day-event-dot">+${dayExams.length - 2} more</div>` : ''}
        </div>
      </div>
    `;
  }

  // Fill remaining cells
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  for (let i = firstDay + daysInMonth; i < totalCells; i++) {
    cells += `<div class="calendar-day other-month"><span class="day-number"></span></div>`;
  }

  return `
    <div class="calendar-grid" role="grid" aria-label="Calendar grid">
      ${headerRow}
      ${cells}
    </div>
  `;
}

function renderUpcomingExams(exams, today) {
  const upcoming = exams
    .filter(e => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6);

  if (upcoming.length === 0) {
    return `<p class="text-muted text-sm text-center" style="padding:12px 0;">No upcoming exams! 🎉</p>`;
  }

  return upcoming.map(e => {
    const d = new Date(e.date + 'T00:00:00');
    const days = DateUtils.daysUntil(e.date);
    return `
      <div class="exam-item" id="exam-item-${e.id}">
        <div class="exam-date-badge">
          <div class="day">${d.getDate()}</div>
          <div class="month">${DateUtils.SHORT_MONTHS[d.getMonth()]}</div>
        </div>
        <div class="exam-details" style="flex:1; min-width:0;">
          <div class="exam-subject">${escapeHtml(e.subject)}</div>
          <div class="exam-desc">${escapeHtml(e.description || '')}</div>
          <div style="margin-top:4px;">
            <span class="badge ${days <= 3 ? 'badge-high' : days <= 7 ? 'badge-medium' : 'badge-pending'}">
              ${days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `In ${days} days`}
            </span>
          </div>
        </div>
        <div style="display:flex; flex-direction:column; gap:4px;">
          <button class="action-btn edit" onclick="editExam('${e.id}')" title="Edit" aria-label="Edit exam">
            <i class="fa-solid fa-pen" aria-hidden="true"></i>
          </button>
          <button class="action-btn delete" onclick="deleteExamConfirm('${e.id}')" title="Delete" aria-label="Delete exam">
            <i class="fa-solid fa-trash" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function renderAllExams(exams, today) {
  if (exams.length === 0) {
    return `
      <div class="empty-state">
        <div class="empty-icon">📅</div>
        <h3>No exams scheduled yet</h3>
        <p>Add your first exam date to stay prepared!</p>
        <button class="btn btn-primary" onclick="openAddExamModal()"><i class="fa-solid fa-plus"></i> Add Exam</button>
      </div>`;
  }

  const sorted = [...exams].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  return `
    <div style="display:flex; flex-direction:column; gap:var(--spacing-sm);">
      ${sorted.map(e => {
        const isPast = e.date < today;
        return `
          <div style="display:flex; align-items:center; gap:var(--spacing-md); padding:var(--spacing-md); border-radius:var(--radius-md); border:1.5px solid var(--border); background:var(--bg-card); opacity:${isPast ? 0.6 : 1};">
            <div style="flex:1; min-width:0;">
              <div style="font-weight:700; font-size:14px; color:var(--primary);">${escapeHtml(e.subject)}</div>
              <div style="font-size:13px; color:var(--text-primary); margin:2px 0;">${escapeHtml(e.description || 'No description')}</div>
              <div style="font-size:12px; color:var(--text-muted);">
                <i class="fa-regular fa-calendar" aria-hidden="true"></i> ${DateUtils.formatDateLong(e.date)}
                ${isPast ? '<span class="badge badge-overdue" style="margin-left:6px;">Past</span>' : ''}
              </div>
            </div>
            <div style="display:flex; gap:4px;">
              <button class="action-btn edit" onclick="editExam('${e.id}')" title="Edit" aria-label="Edit exam">
                <i class="fa-solid fa-pen" aria-hidden="true"></i>
              </button>
              <button class="action-btn delete" onclick="deleteExamConfirm('${e.id}')" title="Delete" aria-label="Delete exam">
                <i class="fa-solid fa-trash" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

/* ============================================================
   CALENDAR NAVIGATION
   ============================================================ */
function changeCalendarMonth(delta) {
  calMonth += delta;
  if (calMonth < 0)  { calMonth = 11; calYear--; }
  if (calMonth > 11) { calMonth = 0;  calYear++; }
  renderCalendar();
}

/* ============================================================
   ACTIONS
   ============================================================ */
function editExam(id) {
  const exam = Storage.getExams().find(e => e.id === id);
  if (!exam) return;
  editingExamId = id;
  openExamModal(exam);
}

function deleteExamConfirm(id) {
  const exam = Storage.getExams().find(e => e.id === id);
  if (!exam) return;
  showConfirm('Delete Exam', `Delete exam "<strong>${escapeHtml(exam.subject)}</strong>"?`, () => {
    Storage.deleteExam(id);
    renderCalendar();
    Toast.success('Exam deleted.');
  });
}

/* ============================================================
   MODAL
   ============================================================ */
function renderExamModal() {
  return `
    <div class="modal-overlay" id="exam-modal" role="dialog" aria-modal="true" aria-labelledby="exam-modal-title">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title" id="exam-modal-title">Add Exam</h2>
          <button class="modal-close" aria-label="Close modal"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
        </div>
        <div class="modal-body">
          <form id="exam-form" novalidate>
            <div class="form-group">
              <label class="form-label" for="exam-subject">Subject *</label>
              <input type="text" id="exam-subject" class="form-control" placeholder="e.g. Data Structures" aria-required="true" aria-describedby="exam-subject-error" />
              <span class="form-error" id="exam-subject-error" role="alert"></span>
            </div>
            <div class="form-group">
              <label class="form-label" for="exam-date">Exam Date *</label>
              <input type="date" id="exam-date" class="form-control" aria-required="true" aria-describedby="exam-date-error" />
              <span class="form-error" id="exam-date-error" role="alert"></span>
            </div>
            <div class="form-group">
              <label class="form-label" for="exam-description">Notes / Description</label>
              <textarea id="exam-description" class="form-control" placeholder="e.g. Covers chapters 1-6, bring calculator" rows="3"></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" onclick="Modal.close('exam-modal')">Cancel</button>
          <button class="btn btn-primary" onclick="saveExam()">
            <i class="fa-solid fa-floppy-disk" aria-hidden="true"></i> Save Exam
          </button>
        </div>
      </div>
    </div>
  `;
}

function openExamModal(exam = null, dateStr = '') {
  const modal = document.getElementById('exam-modal');
  if (!modal) return;

  if (exam) {
    document.getElementById('exam-modal-title').textContent = 'Edit Exam';
    document.getElementById('exam-subject').value      = exam.subject;
    document.getElementById('exam-date').value         = exam.date;
    document.getElementById('exam-description').value  = exam.description || '';
  } else {
    document.getElementById('exam-modal-title').textContent = 'Add Exam';
    document.getElementById('exam-form').reset();
    if (dateStr) document.getElementById('exam-date').value = dateStr;
  }

  Modal.open('exam-modal');
}

function bindExamModalEvents() {
  const form = document.getElementById('exam-form');
  if (form) {
    form.addEventListener('keydown', e => {
      if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') saveExam();
    });
  }
}

function saveExam() {
  const valid = validateForm({
    'exam-subject': { required: true, requiredMsg: 'Subject is required.' },
    'exam-date':    { required: true, requiredMsg: 'Date is required.'    },
  });
  if (!valid) return;

  const data = {
    subject:     document.getElementById('exam-subject').value.trim(),
    date:        document.getElementById('exam-date').value,
    description: document.getElementById('exam-description').value.trim(),
  };

  if (editingExamId) {
    Storage.updateExam(editingExamId, data);
    Toast.success('Exam updated!');
    editingExamId = null;
  } else {
    Storage.addExam(data);
    Toast.success('Exam added to calendar!');
  }

  Modal.close('exam-modal');
  renderCalendar();
}
