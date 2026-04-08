/* ============================================
   COSNIMA — Auth Logic (login.html + register.html)
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Redirect if already logged in
  if (API.isLoggedIn()) {
    window.location.href = 'index.html';
    return;
  }

  // ── Password toggle ──────────────────────────────
  document.querySelectorAll('.pw-toggle').forEach(btn => {
    const input = btn.closest('.pw-field').querySelector('input');
    btn.addEventListener('click', () => {
      const isText = input.type === 'text';
      input.type = isText ? 'password' : 'text';
      // Toggle icon
      btn.querySelector('.eye-open').style.display  = isText ? 'block' : 'none';
      btn.querySelector('.eye-close').style.display = isText ? 'none'  : 'block';
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

      if (!loginVal) { setFieldError('login', 'Email or username is required'); valid = false; }
      if (!password)  { setFieldError('password', 'Password is required'); valid = false; }
      if (!valid) return;

      const btn = document.getElementById('submit-btn');
      setLoading(btn, true);

      try {
        const result = await API.post('/api/auth/login', { login: loginVal, password });

        if (!result || !result.token) {
          showBanner('Invalid credentials. Please try again.');
          return;
        }

        API.setSession(result.token, result.user);
        redirectTo('index.html');

      } catch (err) {
        const msg = err?.data?.message || 'Something went wrong. Please try again.';
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

      const username  = document.getElementById('username').value.trim();
      const email     = document.getElementById('email').value.trim();
      const password  = document.getElementById('password').value;
      const confirm   = document.getElementById('confirm-password').value;
      let valid = true;

      if (!username || username.length < 3) {
        setFieldError('username', 'Username must be at least 3 characters');
        valid = false;
      }
      if (!email || !email.includes('@')) {
        setFieldError('email', 'Please enter a valid email');
        valid = false;
      }
      if (!password || password.length < 6) {
        setFieldError('password', 'Password must be at least 6 characters');
        valid = false;
      }
      if (password !== confirm) {
        setFieldError('confirm-password', 'Passwords do not match');
        valid = false;
      }
      if (!valid) return;

      const btn = document.getElementById('submit-btn');
      setLoading(btn, true);

      try {
        // Backend field is named passwordHash but receives plain password
        await API.post('/api/auth/register', {
          username,
          email,
          passwordHash: password
        });

        showBanner('Account created! Redirecting to login…', 'success');
        setTimeout(() => redirectTo('login.html'), 1500);

      } catch (err) {
        const msg = err?.data?.message || 'Registration failed. The username or email may already be taken.';
        showBanner(msg);
        shakeForm(registerForm);
      } finally {
        setLoading(btn, false);
      }
    });
  }
});

/* ── Helpers ──────────────────────────────────────── */

function setLoading(btn, loading) {
  const text   = btn.querySelector('.btn-text');
  const loader = btn.querySelector('.btn-loader');
  btn.classList.toggle('loading', loading);
  if (text)   text.style.display   = loading ? 'none'  : 'inline';
  if (loader) loader.style.display = loading ? 'flex'  : 'none';
}

function showBanner(msg, type = 'error') {
  const el = document.getElementById('error-msg');
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
  el.className = type === 'success'
    ? 'error-banner'
    : 'error-banner';
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
  const group = document.getElementById(fieldId)?.closest('.field-group');
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
  form.classList.remove('shake');
  void form.offsetWidth; // reflow to restart animation
  form.classList.add('shake');
  form.addEventListener('animationend', () => form.classList.remove('shake'), { once: true });
}

function redirectTo(url) {
  document.body.classList.add('fade-out');
  setTimeout(() => { window.location.href = url; }, 280);
}
