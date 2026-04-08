/* ============================================
   COSNIMA — Auth Logic (Improved)
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Redirect if already logged in
  if (API.isLoggedIn()) {
    window.location.href = '/index.html';
    return;
  }

  // ── Password toggle ──────────────────────────────
  document.querySelectorAll('.pw-toggle').forEach(btn => {
    const input = btn.closest('.pw-field').querySelector('input');
    btn.addEventListener('click', () => {
      const isText = input.type === 'text';
      input.type = isText ? 'password' : 'text';
      // Toggle icon visibility
      const eyeOpen = btn.querySelector('.eye-open');
      const eyeClose = btn.querySelector('.eye-close');
      if (eyeOpen && eyeClose) {
        eyeOpen.style.display = isText ? 'block' : 'none';
        eyeClose.style.display = isText ? 'none' : 'block';
      }
    });
  });

  // ── Login Form ───────────────────────────────────
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearErrors();

      const loginVal = document.getElementById('login').value.trim();
      const password = document.getElementById('password').value;
      let valid = true;

      // Validation
      if (!loginVal) { 
        setFieldError('login', 'Email or username is required'); 
        valid = false; 
      }
      if (!password) { 
        setFieldError('password', 'Password is required'); 
        valid = false; 
      }
      
      if (!valid) return;

      const btn = document.getElementById('submit-btn');
      setLoading(btn, true);

      try {
        const result = await API.post('/api/auth/login', { 
          login: loginVal, 
          password 
        });

        if (!result || !result.token) {
          showBanner('Invalid credentials. Please try again.');
          return;
        }

        API.setSession(result.token, result.user);
        
        // Success - redirect with fade
        showBanner('Login successful! Redirecting...', 'success');
        setTimeout(() => redirectTo('/index.html'), 800);
        
      } catch (err) {
        const msg = err?.data?.message || err?.message || 'Login failed. Please try again.';
        showBanner(msg);
        shakeForm(loginForm);
      } finally {
        setLoading(btn, false);
      }
    });
  }

  // ── Register Form ────────────────────────────────
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearErrors();

      const username = document.getElementById('username').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const confirm = document.getElementById('confirm-password').value;
      let valid = true;

      // 1. Username validation: 3-20 chars, alphanumeric and underscores
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!username) {
        setFieldError('username', 'Username is required');
        valid = false;
      } else if (!usernameRegex.test(username)) {
        setFieldError('username', '3-20 characters (letters, numbers, underscores only)');
        valid = false;
      }

      // 2. Email validation
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!email) {
        setFieldError('email', 'Email is required');
        valid = false;
      } else if (!emailRegex.test(email)) {
        setFieldError('email', 'Please enter a valid email address');
        valid = false;
      }

      // 3. Password strength: Min 8 chars, 1 uppercase, 1 number
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!password) {
        setFieldError('password', 'Password is required');
        valid = false;
      } else if (!passwordRegex.test(password)) {
        setFieldError('password', 'Min 8 characters, 1 uppercase, 1 number');
        valid = false;
      }

      // 4. Confirm password
      if (password !== confirm) {
        setFieldError('confirm-password', 'Passwords do not match');
        valid = false;
      }

      if (!valid) return;

      const btn = document.getElementById('submit-btn');
      setLoading(btn, true);

      try {
        await API.post('/api/auth/register', {
          username,
          email,
          passwordHash: password
        });

        showBanner('Account created! Redirecting to login...', 'success');
        setTimeout(() => redirectTo('/login/login.html'), 1500);
        
      } catch (err) {
        const msg = err?.data?.message || err?.message || 'Registration failed. Username or email may be taken.';
        showBanner(msg);
        shakeForm(registerForm);
      } finally {
        setLoading(btn, false);
      }
    });
  }
});

/* ── Helper Functions ────────────────────────────── */

function setLoading(btn, loading) {
  if (!btn) return;
  const text = btn.querySelector('.btn-text');
  const loader = btn.querySelector('.btn-loader');
  
  btn.classList.toggle('loading', loading);
  btn.disabled = loading;
  
  if (text) text.style.display = loading ? 'none' : 'inline';
  if (loader) loader.style.display = loading ? 'flex' : 'none';
}

function showBanner(msg, type = 'error') {
  const el = document.getElementById('error-msg');
  if (!el) return;
  
  el.textContent = msg;
  el.style.display = 'block';
  
  if (type === 'success') {
    el.style.background = '#f0fdf4';
    el.style.borderColor = '#bbf7d0';
    el.style.color = '#16a34a';
  } else {
    el.style.background = '';
    el.style.borderColor = '';
    el.style.color = '';
  }
}

function setFieldError(fieldId, msg) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  
  const group = field.closest('.field-group');
  if (!group) return;
  
  group.classList.add('has-error');
  const errEl = group.querySelector('.field-error');
  if (errEl) errEl.textContent = msg;
}

function clearErrors() {
  const banner = document.getElementById('error-msg');
  if (banner) banner.style.display = 'none';
  
  document.querySelectorAll('.field-group.has-error').forEach(g => {
    g.classList.remove('has-error');
  });
}

function shakeForm(form) {
  if (!form) return;
  form.classList.remove('shake');
  void form.offsetWidth; // Trigger reflow
  form.classList.add('shake');
  form.addEventListener('animationend', () => {
    form.classList.remove('shake');
  }, { once: true });
}

function redirectTo(url) {
  document.body.classList.add('fade-out');
  setTimeout(() => { 
    window.location.href = url; 
  }, 280);
}