/**
 * auth.js
 * Authentication logic for Smart Student Planner
 * Uses LocalStorage for demo authentication (not production-grade).
 */

/* ---- Demo account ---- */
const DEMO_ACCOUNT = {
  name: 'Demo Student',
  email: 'demo@student.com',
  password: 'demo1234',
};

/* ---- Ensure demo account exists on load ---- */
function ensureDemoAccount() {
  const existing = Storage.getUserByEmail(DEMO_ACCOUNT.email);
  if (!existing) {
    Storage.saveUser({ ...DEMO_ACCOUNT });
  }
}

/* ============================================================
   LOGIN PAGE
   ============================================================ */
function initLoginPage() {
  ensureDemoAccount();

  // If already logged in, redirect
  if (Storage.getCurrentUser()) {
    window.location.href = 'index.html';
    return;
  }

  const form = document.getElementById('login-form');
  const emailEl = document.getElementById('login-email');
  const passwordEl = document.getElementById('login-password');
  const rememberEl = document.getElementById('remember-me');
  const togglePwd = document.getElementById('toggle-password');
  const demoBtn = document.getElementById('demo-login-btn');

  // Toggle password visibility
  if (togglePwd) {
    togglePwd.addEventListener('click', () => {
      const isText = passwordEl.type === 'text';
      passwordEl.type = isText ? 'password' : 'text';
      togglePwd.querySelector('i').className = `fa-solid ${isText ? 'fa-eye' : 'fa-eye-slash'}`;
      togglePwd.setAttribute('aria-label', isText ? 'Show password' : 'Hide password');
    });
  }

  // Demo login button
  if (demoBtn) {
    demoBtn.addEventListener('click', () => {
      emailEl.value = DEMO_ACCOUNT.email;
      passwordEl.value = DEMO_ACCOUNT.password;
      if (rememberEl) rememberEl.checked = true;
    });
  }

  // Form submit
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();

      const rules = {
        'login-email': { required: true, email: true },
        'login-password': { required: true },
      };

      if (!validateForm(rules)) return;

      const email = emailEl.value.trim().toLowerCase();
      const password = passwordEl.value.trim();

      const user = Storage.getUserByEmail(email);

      if (!user) {
        showFieldError('login-email', 'No account found with this email address.');
        return;
      }

      if (user.password !== password) {
        showFieldError('login-password', 'Incorrect password. Please try again.');
        return;
      }

      // Login success
      Storage.setCurrentUser({ name: user.name, email: user.email });

      // Handle "remember me" (for demo purposes, always persists via localStorage)
      const submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.textContent = 'Logging in...';
        submitBtn.disabled = true;
      }

      setTimeout(() => {
        window.location.href = 'index.html';
      }, 500);
    });
  }

  // Clear errors on input
  ['login-email', 'login-password'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => clearFieldError(id));
  });
}

/* ============================================================
   REGISTER PAGE
   ============================================================ */
function initRegisterPage() {
  ensureDemoAccount();

  // If already logged in, redirect
  if (Storage.getCurrentUser()) {
    window.location.href = 'index.html';
    return;
  }

  const form = document.getElementById('register-form');
  const togglePwd = document.getElementById('toggle-password');
  const toggleConfirm = document.getElementById('toggle-confirm-password');
  const passwordEl = document.getElementById('register-password');
  const confirmEl = document.getElementById('register-confirm');

  // Toggle password visibility
  if (togglePwd) {
    togglePwd.addEventListener('click', () => {
      const isText = passwordEl.type === 'text';
      passwordEl.type = isText ? 'password' : 'text';
      togglePwd.querySelector('i').className = `fa-solid ${isText ? 'fa-eye' : 'fa-eye-slash'}`;
    });
  }

  if (toggleConfirm) {
    toggleConfirm.addEventListener('click', () => {
      const isText = confirmEl.type === 'text';
      confirmEl.type = isText ? 'password' : 'text';
      toggleConfirm.querySelector('i').className = `fa-solid ${isText ? 'fa-eye' : 'fa-eye-slash'}`;
    });
  }

  // Password strength indicator
  if (passwordEl) {
    passwordEl.addEventListener('input', () => {
      updatePasswordStrength(passwordEl.value);
    });
  }

  // Form submit
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();

      const nameEl = document.getElementById('register-name');
      const emailEl = document.getElementById('register-email');

      const rules = {
        'register-name':    { required: true, minLength: 2, minLengthMsg: 'Name must be at least 2 characters.' },
        'register-email':   { required: true, email: true },
        'register-password':{ required: true, minLength: 6, minLengthMsg: 'Password must be at least 6 characters.' },
        'register-confirm': {
          required: true,
          match: 'register-password',
          matchMsg: 'Passwords do not match.',
        },
      };

      if (!validateForm(rules)) return;

      const name  = nameEl.value.trim();
      const email = emailEl.value.trim().toLowerCase();
      const password = passwordEl.value;

      // Check if email already registered
      if (Storage.getUserByEmail(email)) {
        showFieldError('register-email', 'This email is already registered. Please log in.');
        return;
      }

      // Save new user
      Storage.saveUser({ name, email, password });
      Storage.setCurrentUser({ name, email });

      const submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.textContent = 'Creating account...';
        submitBtn.disabled = true;
      }

      setTimeout(() => {
        window.location.href = 'index.html';
      }, 600);
    });
  }

  // Clear errors on input
  ['register-name','register-email','register-password','register-confirm'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => clearFieldError(id));
  });
}

/* ---- Password strength ---- */
function updatePasswordStrength(password) {
  const bar = document.getElementById('strength-bar');
  const label = document.getElementById('strength-label');
  if (!bar || !label) return;

  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { pct: 0,   cls: '',      text: '' },
    { pct: 20,  cls: 'red',   text: 'Very Weak' },
    { pct: 40,  cls: 'orange',text: 'Weak' },
    { pct: 60,  cls: 'orange',text: 'Fair' },
    { pct: 80,  cls: 'green', text: 'Strong' },
    { pct: 100, cls: 'green', text: 'Very Strong' },
  ];
  const level = levels[score] || levels[0];
  bar.style.width = level.pct + '%';
  bar.className = 'progress-bar ' + level.cls;
  label.textContent = level.text;
}

/* ---- Field error helpers ---- */
function showFieldError(fieldId, message) {
  const el = document.getElementById(fieldId);
  const errEl = document.getElementById(fieldId + '-error');
  if (el) el.classList.add('error');
  if (errEl) errEl.textContent = message;
  if (el) el.focus();
}

function clearFieldError(fieldId) {
  const el = document.getElementById(fieldId);
  const errEl = document.getElementById(fieldId + '-error');
  if (el) el.classList.remove('error');
  if (errEl) errEl.textContent = '';
}
