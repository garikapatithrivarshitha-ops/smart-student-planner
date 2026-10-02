/**
 * progress.js
 * Study Progress Tracker – stats, progress bars, subject breakdown, charts
 * All data is derived from actual user data in LocalStorage.
 */

function initProgress() {
  // No persistent state needed
}

function renderProgress() {
  const container = document.getElementById('progress-content');
  if (!container) return;

  const tasks       = Storage.getTasks();
  const assignments = Storage.getAssignments();
  const exams       = Storage.getExams();
  const timetable   = Storage.getTimetable();

  // --- Calculations ---
  const totalTasks      = tasks.length;
  const completedTasks  = tasks.filter(t => t.completed).length;
  const pendingTasks    = totalTasks - completedTasks;
  const taskPct         = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalAssign     = assignments.length;
  const completedAssign = assignments.filter(a => a.completed).length;
  const overdueAssign   = assignments.filter(a => !a.completed && DateUtils.isOverdue(a.deadline)).length;
  const assignPct       = totalAssign > 0 ? Math.round((completedAssign / totalAssign) * 100) : 0;

  const upcomingExams   = exams.filter(e => e.date >= DateUtils.today()).length;
  const totalExams      = exams.length;
  const pastExams       = totalExams - upcomingExams;

  // Subject-wise progress (from assignments)
  const subjectMap = {};
  assignments.forEach(a => {
    if (!a.subject) return;
    if (!subjectMap[a.subject]) subjectMap[a.subject] = { total: 0, completed: 0 };
    subjectMap[a.subject].total++;
    if (a.completed) subjectMap[a.subject].completed++;
  });

  // Weekly productivity (tasks completed per weekday)
  const weekCounts = [0,0,0,0,0,0,0]; // Mon-Sun
  tasks.filter(t => t.completed && t.updatedAt).forEach(t => {
    const d = new Date(t.updatedAt);
    let idx = d.getDay() - 1;
    if (idx < 0) idx = 6;
    weekCounts[idx]++;
  });
  const maxWeek = Math.max(...weekCounts, 1);
  const weekDays = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  // Priority breakdown of pending tasks
  const highCount   = tasks.filter(t => !t.completed && t.priority === 'high').length;
  const mediumCount = tasks.filter(t => !t.completed && t.priority === 'medium').length;
  const lowCount    = tasks.filter(t => !t.completed && t.priority === 'low').length;

  container.innerHTML = `
    <!-- Header -->
    <div class="section-header">
      <div>
        <h2 class="section-title">Study Progress</h2>
        <p class="section-subtitle">Track your academic performance and productivity</p>
      </div>
    </div>

    ${totalTasks === 0 && totalAssign === 0 ? `
      <div class="empty-state">
        <div class="empty-icon">📊</div>
        <h3>No data yet</h3>
        <p>Start adding tasks and assignments to see your progress here.</p>
        <button class="btn btn-primary" onclick="navigateTo('tasks')"><i class="fa-solid fa-plus"></i> Add Tasks</button>
      </div>
    ` : `

    <!-- Stats Grid -->
    <div class="stats-grid mb-lg">
      ${progressStat('Tasks Done', completedTasks + '/' + totalTasks, 'fa-circle-check', 'green')}
      ${progressStat('Assignments Done', completedAssign + '/' + totalAssign, 'fa-clipboard-check', 'blue')}
      ${progressStat('Pending Tasks', pendingTasks, 'fa-hourglass-half', 'orange')}
      ${progressStat('Overdue Assignments', overdueAssign, 'fa-triangle-exclamation', 'red')}
      ${progressStat('Upcoming Exams', upcomingExams, 'fa-calendar-days', 'purple')}
      ${progressStat('Exams Passed', pastExams, 'fa-trophy', 'pink')}
    </div>

    <div class="dashboard-row">

      <!-- Left -->
      <div>
        <!-- Overall Progress Card -->
        <div class="card mb-lg">
          <div class="card-header">
            <span class="card-title"><i class="fa-solid fa-chart-pie" aria-hidden="true"></i> Overall Progress</span>
          </div>
          <div class="card-body">
            <div class="subject-progress-item">
              <div class="progress-stat-row">
                <span class="progress-label">Task Completion Rate</span>
                <span class="progress-value">${taskPct}%</span>
              </div>
              <div class="progress-wrap"><div class="progress-bar" style="width:${taskPct}%"></div></div>
              <div style="font-size:11px; color:var(--text-muted); margin-top:3px;">${completedTasks} of ${totalTasks} tasks completed</div>
            </div>

            <div class="subject-progress-item mt-md">
              <div class="progress-stat-row">
                <span class="progress-label">Assignment Completion Rate</span>
                <span class="progress-value">${assignPct}%</span>
              </div>
              <div class="progress-wrap"><div class="progress-bar green" style="width:${assignPct}%"></div></div>
              <div style="font-size:11px; color:var(--text-muted); margin-top:3px;">${completedAssign} of ${totalAssign} assignments completed</div>
            </div>

            ${overdueAssign > 0 ? `
              <div style="background:var(--red-light); border:1px solid var(--red); border-radius:var(--radius-md); padding:10px 14px; margin-top:var(--spacing-md); display:flex; align-items:center; gap:8px;">
                <i class="fa-solid fa-triangle-exclamation" style="color:var(--red);" aria-hidden="true"></i>
                <span style="font-size:13px; color:var(--red); font-weight:600;">You have ${overdueAssign} overdue assignment${overdueAssign > 1 ? 's' : ''}. Please submit soon!</span>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Weekly Activity Chart -->
        <div class="card mb-lg">
          <div class="card-header">
            <span class="card-title"><i class="fa-solid fa-chart-bar" aria-hidden="true"></i> Weekly Productivity</span>
          </div>
          <div class="card-body">
            <p style="font-size:12px; color:var(--text-muted); margin-bottom:var(--spacing-md);">Number of tasks completed per day of the week</p>
            <div style="display:flex; align-items:flex-end; gap:8px; height:100px;">
              ${weekDays.map((day, i) => {
                const h = Math.round((weekCounts[i] / maxWeek) * 80);
                const isToday = new Date().getDay() === (i + 1) % 7 || (i === 6 && new Date().getDay() === 0);
                return `
                  <div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:4px;">
                    <span style="font-size:10px; color:var(--text-muted);">${weekCounts[i]||''}</span>
                    <div style="width:100%; height:${h||4}px; background:${isToday ? 'var(--primary)' : 'var(--primary-200)'}; border-radius:4px 4px 0 0; transition:height 0.3s ease;" title="${weekCounts[i]} tasks on ${day}"></div>
                    <span style="font-size:11px; color:var(--text-muted); font-weight:600;">${day}</span>
                  </div>`;
              }).join('')}
            </div>
            ${weekCounts.every(c => c === 0) ? `<p class="text-muted text-sm text-center mt-md">Complete tasks to see your weekly activity.</p>` : ''}
          </div>
        </div>

        <!-- Priority Breakdown -->
        ${pendingTasks > 0 ? `
          <div class="card">
            <div class="card-header">
              <span class="card-title"><i class="fa-solid fa-flag" aria-hidden="true"></i> Priority Breakdown (Pending)</span>
            </div>
            <div class="card-body">
              ${renderPriorityBar('High Priority', highCount, pendingTasks, 'red')}
              ${renderPriorityBar('Medium Priority', mediumCount, pendingTasks, 'orange')}
              ${renderPriorityBar('Low Priority', lowCount, pendingTasks, 'green')}
            </div>
          </div>
        ` : ''}
      </div>

      <!-- Right -->
      <div>
        <!-- Subject-wise Progress -->
        <div class="card mb-lg">
          <div class="card-header">
            <span class="card-title"><i class="fa-solid fa-book-open" aria-hidden="true"></i> Subject-wise Progress</span>
          </div>
          <div class="card-body">
            ${Object.keys(subjectMap).length === 0
              ? `<p class="text-muted text-sm text-center" style="padding:12px 0;">No subject data yet. Add assignments with subjects to track progress.</p>`
              : Object.entries(subjectMap).map(([subject, data]) => {
                  const pct = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
                  return `
                    <div class="subject-progress-item">
                      <div class="progress-stat-row">
                        <span class="progress-label">${escapeHtml(subject)}</span>
                        <span class="progress-value">${pct}%</span>
                      </div>
                      <div class="progress-wrap">
                        <div class="progress-bar ${pct >= 80 ? 'green' : pct >= 50 ? '' : 'orange'}" style="width:${pct}%"></div>
                      </div>
                      <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">${data.completed}/${data.total} assignments</div>
                    </div>
                  `;
                }).join('')
            }
          </div>
        </div>

        <!-- Timetable Summary -->
        ${timetable.length > 0 ? `
          <div class="card">
            <div class="card-header">
              <span class="card-title"><i class="fa-solid fa-clock" aria-hidden="true"></i> Schedule Summary</span>
            </div>
            <div class="card-body">
              <div style="display:flex; flex-direction:column; gap:8px;">
                ${renderTimetableSummary(timetable)}
              </div>
            </div>
          </div>
        ` : ''}
      </div>

    </div>
    `}
  `;
}

function progressStat(label, value, icon, color) {
  return `
    <div class="stat-card">
      <div class="stat-icon ${color}"><i class="fa-solid ${icon}" aria-hidden="true"></i></div>
      <div class="stat-info">
        <div class="stat-value">${value}</div>
        <div class="stat-label">${label}</div>
      </div>
    </div>
  `;
}

function renderPriorityBar(label, count, total, color) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return `
    <div class="subject-progress-item">
      <div class="progress-stat-row">
        <span class="progress-label">${label} (${count})</span>
        <span class="progress-value">${pct}%</span>
      </div>
      <div class="progress-wrap"><div class="progress-bar ${color}" style="width:${pct}%"></div></div>
    </div>
  `;
}

function renderTimetableSummary(timetable) {
  const subjectCount = {};
  timetable.forEach(e => {
    subjectCount[e.subject] = (subjectCount[e.subject] || 0) + 1;
  });
  return Object.entries(subjectCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([subject, count]) => `
      <div style="display:flex; justify-content:space-between; align-items:center; font-size:13px;">
        <span style="color:var(--text-primary); font-weight:500;">${escapeHtml(subject)}</span>
        <span class="badge badge-purple">${count} session${count > 1 ? 's' : ''}/week</span>
      </div>
    `).join('');
}
