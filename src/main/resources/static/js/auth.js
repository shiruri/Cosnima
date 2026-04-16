/* ============================================
   COSNIMA — Auth Logic
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // Redirect if already logged in
  if (API.isLoggedIn()) {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    if (redirect === 'listing') {
      redirectTo('../listing/view-listing.html');
    } else {
      redirectTo('../index.html');
    }
    return;
  }

  // --- Password toggle — single icon via CSS class ---
  document.querySelectorAll('.pw-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.closest('.pw-field').querySelector('input');
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      // Toggle class on button — CSS handles which SVG is visible
      btn.classList.toggle('showing', isPassword);
      btn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
    });
  });

  // --- Login Form ---
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearErrors();

      const loginVal = document.getElementById('login').value.trim();
      const password  = document.getElementById('password').value;
      let valid = true;

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
          shakeForm(loginForm);
          return;
        }

        API.setSession(result.token, result.user);
        showBanner('Signed in! Redirecting…', 'success');
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect');
        const redirectUrl = redirect === 'listing' ? '../listing/view-listing.html' : '../index.html';
        setTimeout(() => redirectTo(redirectUrl), 900);

      } catch (err) {
        const status = err?.status;
        let msg = err?.message || 'Login failed. Please try again.';
        
        // Sanitize technical errors
        if (msg.includes('java.') || msg.length > 80 || msg.includes('exception')) {
          msg = 'Login failed. Please check your credentials.';
        }
        
        if (status === 401 || status === 403) msg = 'Incorrect email or password.';
        if (status === 0) msg = 'Cannot reach the server. Check your connection.';
        showBanner(msg, 'error');
        shakeForm(loginForm);
      } finally {
        setLoading(btn, false);
      }
    });
  }

  // --- Register Form ---
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearErrors();

      const username = document.getElementById('username').value.trim();
      const email    = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const confirm  = document.getElementById('confirm-password').value;
      let valid = true;

      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!username) {
        setFieldError('username', 'Username is required');
        valid = false;
      } else if (!usernameRegex.test(username)) {
        setFieldError('username', '3–20 characters: letters, numbers, underscores only');
        valid = false;
      }

      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!email) {
        setFieldError('email', 'Email is required');
        valid = false;
      } else if (!emailRegex.test(email)) {
        setFieldError('email', 'Please enter a valid email address');
        valid = false;
      }

      const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!password) {
        setFieldError('password', 'Password is required');
        valid = false;
      } else if (!passwordRegex.test(password)) {
        setFieldError('password', 'Min 8 characters, 1 uppercase, 1 number');
        valid = false;
      }

      if (password && confirm && password !== confirm) {
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

        showBanner('Account created! Redirecting to login…', 'success');
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect');
        const loginUrl = redirect === 'listing' ? '../login/login.html?redirect=listing' : '../login/login.html';
        setTimeout(() => redirectTo(loginUrl), 1500);

      } catch (err) {
        const status = err?.status;
        let msg = err?.message || 'Registration failed. Please try again.';
        
        // Sanitize technical errors
        if (msg.includes('java.') || msg.length > 80 || msg.includes('exception')) {
          msg = 'Registration failed. Please try again.';
        }
        
        if (status === 409) msg = 'Username or email is already taken. Please try another.';
        if (status === 0)   msg = 'Cannot reach the server. Check your connection.';
        showBanner(msg, 'error');
        shakeForm(registerForm);
      } finally {
        setLoading(btn, false);
      }
    });
  }

  // --- Real-time confirm password check ---
  const confirmInput = document.getElementById('confirm-password');
  const passwordInput = document.getElementById('password');
  if (confirmInput && passwordInput) {
    confirmInput.addEventListener('input', () => {
      const group = confirmInput.closest('.field-group');
      const errEl = group?.querySelector('.field-error');
      if (!confirmInput.value) return;
      if (confirmInput.value !== passwordInput.value) {
        group?.classList.add('has-error');
        if (errEl) errEl.textContent = 'Passwords do not match';
      } else {
        group?.classList.remove('has-error');
        if (errEl) errEl.textContent = '';
      }
    });
  }

});

/* ---- Helpers ---- */

function setLoading(btn, loading) {
  if (!btn) return;
  const text   = btn.querySelector('.btn-text');
  const loader = btn.querySelector('.btn-loader');
  btn.disabled = loading;
  btn.classList.toggle('loading', loading);
  if (text)   text.style.display   = loading ? 'none'  : 'inline';
  if (loader) loader.style.display = loading ? 'flex'  : 'none';
}

/**
 * showBanner('message', 'error'|'success'|'info')
 * Uses CSS classes instead of inline styles — no overlap with toast.
 */
function showBanner(msg, type = 'error') {
  const el = document.getElementById('error-msg');
  if (!el) return;

  el.textContent = msg;
  el.className = `show type-${type}`;
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
  if (banner) { banner.className = ''; }
  document.querySelectorAll('.field-group.has-error').forEach(g => {
    g.classList.remove('has-error');
    const errEl = g.querySelector('.field-error');
    if (errEl) errEl.textContent = '';
  });
}

function shakeForm(form) {
  if (!form) return;
  form.classList.remove('shake');
  void form.offsetWidth;
  form.classList.add('shake');
  form.addEventListener('animationend', () => form.classList.remove('shake'), { once: true });
}

function redirectTo(url) {
  document.body.classList.add('fade-out');
  setTimeout(() => { window.location.href = url; }, 280);
} 