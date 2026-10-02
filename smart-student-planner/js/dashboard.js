/**
 * dashboard.js
 * Dashboard section – stats, welcome banner, quick actions, upcoming items, chart
 */

function initDashboard() {
  // Initial render happens via sectionActivated event from app.js
}

function renderDashboard() {
  const container = document.getElementById('dashboard-content');
  if (!container) return;

  const tasks       = Storage.getTasks();
  const assignments = Storage.getAssignments();
  const exams       = Storage.getExams();
  const user        = Storage.getCurrentUser();

  const totalTasks     = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks   = totalTasks - completedTasks;

  const now = new Date();
  const upcomingAssignments = assignments
    .filter(a => !a.completed && a.deadline && new Date(a.deadline + 'T23:59:59') >= now)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 5);

  const upcomingExams = exams
    .filter(e => e.date && new Date(e.date + 'T23:59:59') >= now)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  const taskCompletion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const assignmentCompletion = assignments.length > 0
    ? Math.round((assignments.filter(a => a.completed).length / assignments.length) * 100) : 0;

  const userName = user ? user.name.split(' ')[0] : 'Student';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  container.innerHTML = `
    <!-- Welcome Banner -->
    <div class="welcome-banner" role="region" aria-label="Welcome">
      <h2>${greeting}, ${escapeHtml(userName)}! 👋</h2>
      <p>${DateUtils.formatDateLong(DateUtils.today())}</p>
      <div class="quick-actions" role="group" aria-label="Quick actions">
        <button class="quick-action-btn" onclick="navigateTo('tasks'); setTimeout(()=>openAddTaskModal(),50)">
          <i class="fa-solid fa-plus" aria-hidden="true"></i> Add Task
        </button>
        <button class="quick-action-btn" onclick="navigateTo('assignments'); setTimeout(()=>openAddAssignmentModal(),50)">
          <i class="fa-solid fa-file-circle-plus" aria-hidden="true"></i> Add Assignment
        </button>
        <button class="quick-action-btn" onclick="navigateTo('calendar'); setTimeout(()=>openAddExamModal(),50)">
          <i class="fa-solid fa-calendar-plus" aria-hidden="true"></i> Add Exam
        </button>
        <button class="quick-action-btn" onclick="navigateTo('timetable')">
          <i class="fa-solid fa-clock" aria-hidden="true"></i> View Timetable
        </button>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid mb-lg" role="region" aria-label="Statistics overview">
      ${renderStatCard('Total Tasks', totalTasks, 'fa-list-check', 'purple')}
      ${renderStatCard('Completed', completedTasks, 'fa-circle-check', 'green')}
      ${renderStatCard('Pending Tasks', pendingTasks, 'fa-hourglass-half', 'orange')}
      ${renderStatCard('Assignments', assignments.length, 'fa-file-lines', 'blue')}
      ${renderStatCard('Upcoming Exams', upcomingExams.length, 'fa-calendar-days', 'pink')}
    </div>

    <!-- Dashboard Row -->
    <div class="dashboard-row">

      <!-- Left: Progress + Upcoming -->
      <div>
        <!-- Progress Card -->
        <div class="card mb-lg">
          <div class="card-header">
            <span class="card-title"><i class="fa-solid fa-chart-pie" aria-hidden="true"></i> Progress Overview</span>
          </div>
          <div class="card-body">
            <div class="subject-progress-item">
              <div class="progress-stat-row">
                <span class="progress-label">Task Completion</span>
                <span class="progress-value">${taskCompletion}%</span>
              </div>
              <div class="progress-wrap"><div class="progress-bar" style="width:${taskCompletion}%"></div></div>
            </div>
            <div class="subject-progress-item mt-md">
              <div class="progress-stat-row">
                <span class="progress-label">Assignment Completion</span>
                <span class="progress-value">${assignmentCompletion}%</span>
              </div>
              <div class="progress-wrap"><div class="progress-bar green" style="width:${assignmentCompletion}%"></div></div>
            </div>
            ${renderWeeklyChart(tasks)}
          </div>
        </div>

        <!-- Upcoming Assignments -->
        <div class="card mb-lg">
          <div class="card-header">
            <span class="card-title"><i class="fa-solid fa-file-lines" aria-hidden="true"></i> Upcoming Assignments</span>
            <button class="btn btn-secondary btn-sm" onclick="navigateTo('assignments')">View All</button>
          </div>
          <div class="card-body">
            ${upcomingAssignments.length === 0
              ? '<p class="text-muted text-sm text-center" style="padding:12px 0">No pending assignments 🎉</p>'
              : upcomingAssignments.map(a => renderUpcomingItem(
                  a.subject + ' – ' + a.title,
                  DateUtils.formatRelative(a.deadline),
                  DateUtils.isOverdue(a.deadline) ? '#ef4444' :
                  DateUtils.isDueSoon(a.deadline) ? '#f59e0b' : '#7c3aed'
                )).join('')
            }
          </div>
        </div>
      </div>

      <!-- Right: Upcoming Exams -->
      <div>
        <div class="card">
          <div class="card-header">
            <span class="card-title"><i class="fa-solid fa-calendar-days" aria-hidden="true"></i> Upcoming Exams</span>
            <button class="btn btn-secondary btn-sm" onclick="navigateTo('calendar')">View All</button>
          </div>
          <div class="card-body">
            ${upcomingExams.length === 0
              ? '<p class="text-muted text-sm text-center" style="padding:12px 0">No upcoming exams 🎉</p>'
              : upcomingExams.map(e => `
                  <div class="upcoming-item">
                    <div class="upcoming-dot" style="background:#7c3aed"></div>
                    <div class="upcoming-info">
                      <div class="upcoming-title">${escapeHtml(e.subject)}</div>
                      <div class="upcoming-sub">${escapeHtml(e.description || '')}</div>
                    </div>
                    <div class="upcoming-date">${DateUtils.formatDate(e.date)}</div>
                  </div>
                `).join('')
            }
          </div>
        </div>

        <!-- Today's tasks -->
        <div class="card mt-lg">
          <div class="card-header">
            <span class="card-title"><i class="fa-solid fa-sun" aria-hidden="true"></i> Today's Focus</span>
          </div>
          <div class="card-body">
            ${renderTodayTasks(tasks)}
          </div>
        </div>
      </div>

    </div><!-- end dashboard-row -->
  `;
}

function renderStatCard(label, value, icon, color) {
  return `
    <div class="stat-card">
      <div class="stat-icon ${color}">
        <i class="fa-solid ${icon}" aria-hidden="true"></i>
      </div>
      <div class="stat-info">
        <div class="stat-value">${value}</div>
        <div class="stat-label">${label}</div>
      </div>
    </div>
  `;
}

function renderUpcomingItem(title, sub, color) {
  return `
    <div class="upcoming-item">
      <div class="upcoming-dot" style="background:${color}"></div>
      <div class="upcoming-info">
        <div class="upcoming-title">${escapeHtml(title)}</div>
        <div class="upcoming-sub" style="color:${color}; font-weight:600;">${escapeHtml(sub)}</div>
      </div>
    </div>
  `;
}

function renderTodayTasks(tasks) {
  const today = DateUtils.today();
  const todayTasks = tasks.filter(t => t.dueDate === today && !t.completed);
  if (todayTasks.length === 0) {
    return '<p class="text-muted text-sm text-center" style="padding:12px 0">No tasks due today ✅</p>';
  }
  return todayTasks.slice(0, 4).map(t => `
    <div class="upcoming-item">
      <div class="upcoming-dot" style="background:${
        t.priority === 'high' ? 'var(--red)' :
        t.priority === 'medium' ? 'var(--orange)' : 'var(--green)'}"></div>
      <div class="upcoming-info">
        <div class="upcoming-title">${escapeHtml(t.title)}</div>
        <div class="upcoming-sub">${priorityBadgeText(t.priority)}</div>
      </div>
    </div>
  `).join('');
}

function priorityBadgeText(p) {
  const map = { high: '🔴 High Priority', medium: '🟡 Medium Priority', low: '🟢 Low Priority' };
  return map[p] || p;
}

function renderWeeklyChart(tasks) {
  // Build a simple bar chart showing tasks completed by day of week
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const counts = [0, 0, 0, 0, 0, 0, 0];

  tasks.filter(t => t.completed && t.updatedAt).forEach(t => {
    const d = new Date(t.updatedAt);
    let dayIdx = d.getDay() - 1; // 0=Mon
    if (dayIdx < 0) dayIdx = 6;
    counts[dayIdx]++;
  });

  const max = Math.max(...counts, 1);

  return `
    <div class="mt-lg">
      <div class="progress-stat-row mb-sm">
        <span class="progress-label">Weekly Activity (Tasks Completed)</span>
      </div>
      <div style="display:flex; align-items:flex-end; gap:8px; height:80px;">
        ${days.map((day, i) => {
          const h = Math.round((counts[i] / max) * 70);
          const isToday = new Date().getDay() === (i + 1) % 7 || (i === 6 && new Date().getDay() === 0);
          return `
            <div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:4px;">
              <div style="width:100%; height:${h || 4}px; background:${isToday ? 'var(--primary)' : 'var(--primary-200)'}; border-radius:4px 4px 0 0; transition:height 0.3s ease;" title="${counts[i]} tasks on ${day}"></div>
              <span style="font-size:10px; color:var(--text-muted); font-weight:600;">${day}</span>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}
