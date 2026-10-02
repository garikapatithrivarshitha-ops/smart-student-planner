/**
 * timetable.js
 * Study Timetable section – weekly grid, add/edit/delete entries
 */

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
const DAY_LABELS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

let editingSlotId = null;

function initTimetable() {
  // Nothing special at init
}

/* ============================================================
   RENDER
   ============================================================ */
function renderTimetable() {
  const container = document.getElementById('timetable-content');
  if (!container) return;

  const today = DateUtils.getCurrentDay();
  const entries = Storage.getTimetable();

  container.innerHTML = `
    <!-- Header -->
    <div class="section-header">
      <div>
        <h2 class="section-title">Study Timetable</h2>
        <p class="section-subtitle">Your weekly class and study schedule</p>
      </div>
      <button class="btn btn-primary" onclick="openAddSlotModal()" aria-label="Add timetable entry">
        <i class="fa-solid fa-plus" aria-hidden="true"></i> Add Entry
      </button>
    </div>

    <!-- Timetable Grid -->
    <div class="card mb-lg">
      <div class="card-body" style="overflow-x:auto; padding: var(--spacing-md);">
        <div class="timetable-grid" id="timetable-grid" role="grid" aria-label="Weekly timetable">
          ${DAYS.map((day, i) => `
            <div class="day-column" role="gridcell">
              <div class="day-header ${day === today ? 'today' : ''}" aria-current="${day === today ? 'date' : 'false'}">
                ${DAY_LABELS[i].substring(0,3)}
                ${day === today ? '<br><span style="font-size:9px; opacity:0.8">Today</span>' : ''}
              </div>
              ${entries
                .filter(e => e.day === day)
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map(e => renderSlot(e))
                .join('')}
              <button class="timetable-slot" style="background:var(--gray-100); color:var(--text-muted); border:1.5px dashed var(--gray-300); text-align:center; justify-content:center; width:100%; display:flex; align-items:center; font-size:12px; cursor:pointer;"
                onclick="openAddSlotModal('${day}')" aria-label="Add entry for ${DAY_LABELS[i]}">
                <i class="fa-solid fa-plus" aria-hidden="true" style="margin-right:4px;"></i> Add
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- Entry list for mobile / summary view -->
    <div class="card">
      <div class="card-header">
        <span class="card-title"><i class="fa-solid fa-list" aria-hidden="true"></i> All Entries (${entries.length})</span>
      </div>
      <div class="card-body">
        ${entries.length === 0
          ? `<div class="empty-state"><div class="empty-icon">📅</div>
              <h3>No timetable entries yet</h3>
              <p>Add your class schedule to get started.</p>
              <button class="btn btn-primary" onclick="openAddSlotModal()"><i class="fa-solid fa-plus"></i> Add Entry</button>
             </div>`
          : `<div style="display:flex; flex-direction:column; gap:8px;">
              ${entries
                .sort((a,b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || a.startTime.localeCompare(b.startTime))
                .map(e => renderSlotListItem(e))
                .join('')}
             </div>`
        }
      </div>
    </div>

    <!-- Add/Edit Modal -->
    ${renderSlotModal()}
  `;

  bindSlotModalEvents();
}

function renderSlot(entry) {
  return `
    <div class="timetable-slot slot-color-${entry.colorIndex % 8}"
      onclick="editSlot('${entry.id}')"
      role="button"
      tabindex="0"
      aria-label="Edit ${escapeHtml(entry.subject)} slot"
      onkeydown="if(event.key==='Enter')editSlot('${entry.id}')">
      <div class="slot-subject">${escapeHtml(entry.subject)}</div>
      <div class="slot-time">${DateUtils.formatTime(entry.startTime)} – ${DateUtils.formatTime(entry.endTime)}</div>
      ${entry.room ? `<div class="slot-room"><i class="fa-solid fa-location-dot" aria-hidden="true"></i>${escapeHtml(entry.room)}</div>` : ''}
    </div>
  `;
}

function renderSlotListItem(entry) {
  const dayLabel = DAY_LABELS[DAYS.indexOf(entry.day)] || entry.day;
  const today = DateUtils.getCurrentDay();
  return `
    <div style="display:flex; align-items:center; gap:12px; padding:10px; border-radius:var(--radius-md); border:1.5px solid var(--border); background:var(--bg-card);">
      <div class="stat-icon slot-color-${entry.colorIndex % 8}" style="width:40px; height:40px; font-size:14px; border-radius:var(--radius-md);">
        <i class="fa-solid fa-book-open" aria-hidden="true"></i>
      </div>
      <div style="flex:1; min-width:0;">
        <div style="font-weight:700; font-size:14px;">${escapeHtml(entry.subject)}</div>
        <div style="font-size:12px; color:var(--text-muted);">
          <span style="font-weight:600; color:${entry.day === today ? 'var(--primary)' : 'var(--text-secondary)'};">${dayLabel}</span>
          &nbsp;·&nbsp; ${DateUtils.formatTime(entry.startTime)} – ${DateUtils.formatTime(entry.endTime)}
          ${entry.room ? `&nbsp;·&nbsp; <i class="fa-solid fa-location-dot" aria-hidden="true"></i> ${escapeHtml(entry.room)}` : ''}
        </div>
      </div>
      <div style="display:flex; gap:4px;">
        <button class="action-btn edit" onclick="editSlot('${entry.id}')" title="Edit" aria-label="Edit ${escapeHtml(entry.subject)}">
          <i class="fa-solid fa-pen" aria-hidden="true"></i>
        </button>
        <button class="action-btn delete" onclick="deleteSlotConfirm('${entry.id}')" title="Delete" aria-label="Delete ${escapeHtml(entry.subject)}">
          <i class="fa-solid fa-trash" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  `;
}

/* ============================================================
   ACTIONS
   ============================================================ */
function openAddSlotModal(day = '') {
  editingSlotId = null;
  const modal = document.getElementById('slot-modal');
  if (!modal) return;
  document.getElementById('slot-modal-title').textContent = 'Add Timetable Entry';
  document.getElementById('slot-form').reset();
  if (day) document.getElementById('slot-day').value = day;
  document.getElementById('slot-color').value = '0';
  Modal.open('slot-modal');
}

function editSlot(id) {
  const entry = Storage.getTimetable().find(e => e.id === id);
  if (!entry) return;
  editingSlotId = id;
  document.getElementById('slot-modal-title').textContent = 'Edit Timetable Entry';
  document.getElementById('slot-subject').value   = entry.subject;
  document.getElementById('slot-day').value       = entry.day;
  document.getElementById('slot-start').value     = entry.startTime;
  document.getElementById('slot-end').value       = entry.endTime;
  document.getElementById('slot-room').value      = entry.room || '';
  document.getElementById('slot-color').value     = String(entry.colorIndex || 0);
  Modal.open('slot-modal');
}

function deleteSlotConfirm(id) {
  const entry = Storage.getTimetable().find(e => e.id === id);
  if (!entry) return;
  showConfirm('Delete Entry', `Delete "<strong>${escapeHtml(entry.subject)}</strong>" from timetable?`, () => {
    Storage.deleteTimetableEntry(id);
    renderTimetable();
    Toast.success('Entry deleted.');
  });
}

/* ============================================================
   MODAL
   ============================================================ */
function renderSlotModal() {
  const colorOptions = [
    { v: '0', label: 'Purple' },
    { v: '1', label: 'Blue'   },
    { v: '2', label: 'Green'  },
    { v: '3', label: 'Orange' },
    { v: '4', label: 'Pink'   },
    { v: '5', label: 'Sky'    },
    { v: '6', label: 'Lime'   },
    { v: '7', label: 'Amber'  },
  ];

  return `
    <div class="modal-overlay" id="slot-modal" role="dialog" aria-modal="true" aria-labelledby="slot-modal-title">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title" id="slot-modal-title">Add Timetable Entry</h2>
          <button class="modal-close" aria-label="Close modal"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
        </div>
        <div class="modal-body">
          <form id="slot-form" novalidate>
            <div class="form-group">
              <label class="form-label" for="slot-subject">Subject *</label>
              <input type="text" id="slot-subject" class="form-control" placeholder="e.g. Data Structures" aria-required="true" aria-describedby="slot-subject-error" />
              <span class="form-error" id="slot-subject-error" role="alert"></span>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="slot-day">Day *</label>
                <select id="slot-day" class="form-control" aria-required="true">
                  ${DAYS.map((d, i) => `<option value="${d}">${DAY_LABELS[i]}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="slot-room">Room / Location</label>
                <input type="text" id="slot-room" class="form-control" placeholder="e.g. CS-101" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="slot-start">Start Time *</label>
                <input type="time" id="slot-start" class="form-control" aria-required="true" aria-describedby="slot-start-error" />
                <span class="form-error" id="slot-start-error" role="alert"></span>
              </div>
              <div class="form-group">
                <label class="form-label" for="slot-end">End Time *</label>
                <input type="time" id="slot-end" class="form-control" aria-required="true" aria-describedby="slot-end-error" />
                <span class="form-error" id="slot-end-error" role="alert"></span>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label" for="slot-color">Color Theme</label>
              <select id="slot-color" class="form-control">
                ${colorOptions.map(c => `<option value="${c.v}">${c.label}</option>`).join('')}
              </select>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" onclick="Modal.close('slot-modal')">Cancel</button>
          <button class="btn btn-primary" onclick="saveSlot()">
            <i class="fa-solid fa-floppy-disk" aria-hidden="true"></i> Save Entry
          </button>
        </div>
      </div>
    </div>
  `;
}

function bindSlotModalEvents() {
  const form = document.getElementById('slot-form');
  if (form) {
    form.addEventListener('keydown', e => {
      if (e.key === 'Enter' && e.target.tagName !== 'SELECT') saveSlot();
    });
  }
}

function saveSlot() {
  const valid = validateForm({
    'slot-subject': { required: true, requiredMsg: 'Subject name is required.' },
    'slot-start':   { required: true, requiredMsg: 'Start time is required.'   },
    'slot-end':     { required: true, requiredMsg: 'End time is required.'     },
  });
  if (!valid) return;

  const start = document.getElementById('slot-start').value;
  const end   = document.getElementById('slot-end').value;
  if (start >= end) {
    const errEl = document.getElementById('slot-end-error');
    if (errEl) errEl.textContent = 'End time must be after start time.';
    document.getElementById('slot-end').classList.add('error');
    return;
  }

  const data = {
    subject:    document.getElementById('slot-subject').value.trim(),
    day:        document.getElementById('slot-day').value,
    startTime:  start,
    endTime:    end,
    room:       document.getElementById('slot-room').value.trim(),
    colorIndex: parseInt(document.getElementById('slot-color').value) || 0,
  };

  if (editingSlotId) {
    Storage.updateTimetableEntry(editingSlotId, data);
    Toast.success('Entry updated!');
    editingSlotId = null;
  } else {
    Storage.addTimetableEntry(data);
    Toast.success('Entry added to timetable!');
  }

  Modal.close('slot-modal');
  renderTimetable();
}
