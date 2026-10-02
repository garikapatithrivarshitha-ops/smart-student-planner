/**
 * settings.js
 * Profile & Settings section – edit profile, change password, theme toggle, data management
 */

function initSettings() {
  // Nothing at init
}

/* ============================================================
   RENDER
   ============================================================ */
function renderSettings() {
  const container = document.getElementById('settings-content');
  if (!container) return;

  const user     = Storage.getCurrentUser() || {};
  const settings = Storage.getSettings();
  const isDark   = settings.theme === 'dark';

  const initials = user.name
    ? user.name.split(' ').map(p => p.charAt(0).toUpperCase()).slice(0, 2).join('')
    : 'S';

  container.innerHTML = `
    <!-- Header -->
    <div class="section-header">
      <div>
        <h2 class="section-title">Profile & Settings</h2>
        <p class="section-subtitle">Manage your account and application preferences</p>
      </div>
    </div>

    <!-- Profile Card -->
    <div class="settings-section">
      <div class="settings-section-header">
        <i class="fa-solid fa-user" aria-hidden="true"></i> Profile Information
      </div>
      <div class="profile-avatar-section">
        <div class="profile-avatar" aria-hidden="true" id="profile-avatar-display">${escapeHtml(initials)}</div>
        <div class="profile-avatar-info">
          <h3 id="profile-name-display">${escapeHtml(user.name || 'Student')}</h3>
          <p id="profile-email-display">${escapeHtml(user.email || '')}</p>
          <span class="badge badge-purple mt-sm"><i class="fa-solid fa-graduation-cap"></i> Student</span>
        </div>
      </div>

      <!-- Edit Profile Form -->
      <div style="padding: var(--spacing-lg); border-top: 1px solid var(--border);">
        <form id="profile-form" novalidate>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="profile-name">Full Name</label>
              <input type="text" id="profile-name" class="form-control"
                value="${escapeHtml(user.name || '')}" placeholder="Your full name"
                aria-describedby="profile-name-error" />
              <span class="form-error" id="profile-name-error" role="alert"></span>
            </div>
            <div class="form-group">
              <label class="form-label" for="profile-email">Email Address</label>
              <input type="email" id="profile-email" class="form-control"
                value="${escapeHtml(user.email || '')}" placeholder="your@email.com"
                aria-describedby="profile-email-error" />
              <span class="form-error" id="profile-email-error" role="alert"></span>
            </div>
          </div>
          <button type="button" class="btn btn-primary" onclick="saveProfile()">
            <i class="fa-solid fa-floppy-disk" aria-hidden="true"></i> Save Profile
          </button>
        </form>
      </div>
    </div>

    <!-- Change Password -->
    <div class="settings-section">
      <div class="settings-section-header">
        <i class="fa-solid fa-lock" aria-hidden="true"></i> Change Password
      </div>
      <div style="padding: var(--spacing-lg);">
        <form id="password-form" novalidate>
          <div class="form-group">
            <label class="form-label" for="current-password">Current Password</label>
            <div class="input-group">
              <i class="fa-solid fa-lock input-icon" aria-hidden="true"></i>
              <input type="password" id="current-password" class="form-control" placeholder="Current password"
                aria-describedby="current-password-error" />
              <button type="button" class="input-action" onclick="togglePwdVisibility('current-password', this)" aria-label="Show password">
                <i class="fa-solid fa-eye" aria-hidden="true"></i>
              </button>
            </div>
            <span class="form-error" id="current-password-error" role="alert"></span>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="new-password">New Password</label>
              <div class="input-group">
                <i class="fa-solid fa-lock input-icon" aria-hidden="true"></i>
                <input type="password" id="new-password" class="form-control" placeholder="At least 6 characters"
                  aria-describedby="new-password-error" />
              </div>
              <span class="form-error" id="new-password-error" role="alert"></span>
            </div>
            <div class="form-group">
              <label class="form-label" for="confirm-new-password">Confirm New Password</label>
              <div class="input-group">
                <i class="fa-solid fa-lock input-icon" aria-hidden="true"></i>
                <input type="password" id="confirm-new-password" class="form-control" placeholder="Repeat new password"
                  aria-describedby="confirm-new-password-error" />
              </div>
              <span class="form-error" id="confirm-new-password-error" role="alert"></span>
            </div>
          </div>
          <button type="button" class="btn btn-primary" onclick="changePassword()">
            <i class="fa-solid fa-key" aria-hidden="true"></i> Update Password
          </button>
        </form>
      </div>
    </div>

    <!-- Appearance -->
    <div class="settings-section">
      <div class="settings-section-header">
        <i class="fa-solid fa-palette" aria-hidden="true"></i> Appearance
      </div>
      <div class="settings-item">
        <div class="settings-item-info">
          <div class="settings-item-title">Dark Mode</div>
          <div class="settings-item-desc">Switch between light and dark themes</div>
        </div>
        <label class="toggle-switch" aria-label="Toggle dark mode">
          <input type="checkbox" id="dark-mode-toggle" ${isDark ? 'checked' : ''} onchange="toggleDarkMode(this.checked)" />
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>

    <!-- Data Management -->
    <div class="settings-section">
      <div class="settings-section-header">
        <i class="fa-solid fa-database" aria-hidden="true"></i> Data Management
      </div>

      <div class="settings-item">
        <div class="settings-item-info">
          <div class="settings-item-title">Reload Sample Data</div>
          <div class="settings-item-desc">Re-add sample tasks, assignments, timetable, and exams for demonstration</div>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="reloadSampleData()">
          <i class="fa-solid fa-rotate" aria-hidden="true"></i> Reload Samples
        </button>
      </div>

      <div class="settings-item">
        <div class="settings-item-info">
          <div class="settings-item-title">Clear Application Data</div>
          <div class="settings-item-desc">Delete all tasks, assignments, timetable entries and exams. Your account remains.</div>
        </div>
        <button class="btn btn-danger btn-sm" onclick="clearAllDataConfirm()">
          <i class="fa-solid fa-trash" aria-hidden="true"></i> Clear Data
        </button>
      </div>

      <div class="settings-item">
        <div class="settings-item-info">
          <div class="settings-item-title">Logout</div>
          <div class="settings-item-desc">Sign out of your account</div>
        </div>
        <button class="btn btn-ghost btn-sm" onclick="confirmLogout()">
          <i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i> Logout
        </button>
      </div>
    </div>

    <!-- App Info -->
    <div class="settings-section">
      <div class="settings-section-header">
        <i class="fa-solid fa-circle-info" aria-hidden="true"></i> About
      </div>
      <div class="settings-item">
        <div class="settings-item-info">
          <div class="settings-item-title">Smart Student Planner</div>
          <div class="settings-item-desc">Version 1.0 &nbsp;·&nbsp; UID Project &nbsp;·&nbsp; Frontend-only application using LocalStorage</div>
        </div>
        <span class="badge badge-purple">v1.0</span>
      </div>
    </div>
  `;
}

/* ============================================================
   ACTIONS
   ============================================================ */
function confirmLogout() {
  showConfirm('Logout', 'Are you sure you want to logout?', () => {
    Storage.clearCurrentUser();
    window.location.href = 'login.html';
  }, false);
}

function saveProfile() {
  const valid = validateForm({
    'profile-name':  { required: true, minLength: 2, minLengthMsg: 'Name must be at least 2 characters.' },
    'profile-email': { required: true, email: true },
  });
  if (!valid) return;

  const name  = document.getElementById('profile-name').value.trim();
  const email = document.getElementById('profile-email').value.trim().toLowerCase();

  const currentUser = Storage.getCurrentUser();

  // If email changed, check it doesn't conflict with another account
  if (email !== currentUser.email) {
    const existing = Storage.getUserByEmail(email);
    if (existing && existing.email !== currentUser.email) {
      const errEl = document.getElementById('profile-email-error');
      if (errEl) errEl.textContent = 'This email is already in use.';
      document.getElementById('profile-email').classList.add('error');
      return;
    }
  }

  Storage.updateCurrentUser({ name, email });

  // Update sidebar display
  const nameEl   = document.getElementById('sidebar-user-name');
  const avatarEl = document.getElementById('sidebar-avatar');
  if (nameEl)   nameEl.textContent   = name;
  if (avatarEl) avatarEl.textContent = name.charAt(0).toUpperCase();

  // Update display in settings
  const nameDisplay = document.getElementById('profile-name-display');
  const emailDisplay = document.getElementById('profile-email-display');
  const avatarDisplay = document.getElementById('profile-avatar-display');
  if (nameDisplay) nameDisplay.textContent = name;
  if (emailDisplay) emailDisplay.textContent = email;
  if (avatarDisplay) {
    const initials = name.split(' ').map(p => p.charAt(0).toUpperCase()).slice(0, 2).join('');
    avatarDisplay.textContent = initials;
  }

  Toast.success('Profile updated successfully!');
}

function changePassword() {
  const currentPwd = document.getElementById('current-password').value;
  const newPwd     = document.getElementById('new-password').value;
  const confirmPwd = document.getElementById('confirm-new-password').value;

  // Clear errors
  ['current-password','new-password','confirm-new-password'].forEach(id => {
    const el = document.getElementById(id);
    const errEl = document.getElementById(id + '-error');
    if (el) el.classList.remove('error');
    if (errEl) errEl.textContent = '';
  });

  let valid = true;

  if (!currentPwd) {
    setSettingsError('current-password', 'Current password is required.');
    valid = false;
  }
  if (newPwd.length < 6) {
    setSettingsError('new-password', 'New password must be at least 6 characters.');
    valid = false;
  }
  if (newPwd !== confirmPwd) {
    setSettingsError('confirm-new-password', 'Passwords do not match.');
    valid = false;
  }
  if (!valid) return;

  const user = Storage.getCurrentUser();
  const storedUser = Storage.getUserByEmail(user.email);
  if (!storedUser || storedUser.password !== currentPwd) {
    setSettingsError('current-password', 'Current password is incorrect.');
    return;
  }

  Storage.saveUser({ ...storedUser, password: newPwd });
  document.getElementById('password-form').reset();
  Toast.success('Password changed successfully!');
}

function toggleDarkMode(enabled) {
  if (enabled) {
    document.documentElement.setAttribute('data-theme', 'dark');
    Storage.saveSettings({ theme: 'dark' });
    Toast.info('Dark mode enabled 🌙');
  } else {
    document.documentElement.removeAttribute('data-theme');
    Storage.saveSettings({ theme: 'light' });
    Toast.info('Light mode enabled ☀️');
  }
}

function reloadSampleData() {
  showConfirm('Reload Sample Data',
    'This will add sample tasks, assignments, timetable and exams to your existing data.',
    () => {
      // Use the proper API to clear the sample-loaded flag
      Storage.resetSampleFlag();
      // loadSampleData() checks isSampleLoaded() — now returns false, so it will run
      loadSampleData();
      Toast.success('Sample data reloaded successfully!');
    },
    false
  );
}

function clearAllDataConfirm() {
  showConfirm(
    'Clear All Data',
    'This will permanently delete all your tasks, assignments, timetable entries, and exam events. Your account will remain. This action cannot be undone.',
    () => {
      Storage.clearAllData();
      Toast.success('All application data cleared.');
      // Re-render all sections
      renderSettings();
    },
    true
  );
}

function togglePwdVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isText = input.type === 'text';
  input.type = isText ? 'password' : 'text';
  btn.querySelector('i').className = `fa-solid ${isText ? 'fa-eye' : 'fa-eye-slash'}`;
}

function setSettingsError(fieldId, message) {
  const el = document.getElementById(fieldId);
  const errEl = document.getElementById(fieldId + '-error');
  if (el) el.classList.add('error');
  if (errEl) errEl.textContent = message;
}
