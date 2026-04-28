/* ============================================
   COSNIMA — API Client (FIXED)
   - Better 401/403 handling
   - Network timeout support
   - Consistent error shapes
   - Automatic toast on API errors
   ============================================ */

const API = (() => {
const BASE_URL = "https://cosnima-production.up.railway.app";
  const TIMEOUT_MS = 15000;
  const TOAST_ON_ERROR = false;

// Expose showToast globally
if (typeof window !== 'undefined') {
  window.showToast = showToast;
}

  function getToken() {
    return localStorage.getItem('cosnimaToken');
  }

  function getUser() {
    try {
      const s = localStorage.getItem('cosnimaUser');
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  }

  function setSession(token, user) {
    if (token) localStorage.setItem('cosnimaToken', token);
    if (user)  localStorage.setItem('cosnimaUser', JSON.stringify(user));
  }

  function clearSession() {
    localStorage.removeItem('cosnimaToken');
    localStorage.removeItem('cosnimaUser');
  }

  function isLoggedIn() {
    return !!getToken();
  }

  function withTimeout(promise, ms) {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject({ status: 0, message: 'Request timed out. Please try again.' }), ms)
      )
    ]);
  }

  function getErrorMessage(err) {
    // Extract message from various error formats
    if (err?.data?.message) return err.data.message;
    if (err?.message) return err.message;
    if (typeof err === 'string') return err;
    return 'An error occurred';
  }

  async function request(method, endpoint, body = null, auth = false, isMultipart = false, showToastOnError = TOAST_ON_ERROR) {
    const headers = {};

    if (!isMultipart) headers['Content-Type'] = 'application/json';

    if (auth) {
      const token = getToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    const options = { method, headers };
    if (body) options.body = isMultipart ? body : JSON.stringify(body);

    try {
      const res = await withTimeout(
        fetch(`${BASE_URL}${endpoint}`, options),
        TIMEOUT_MS
      );

      if (res.status === 401) {
        clearSession();
        const path = window.location.pathname;
        if (!path.includes('/login/') && !path.includes('/signup/')) {
          const prefix = (path.includes('/listing/') || path.includes('/profile/') ||
                          path.includes('/offers/') || path.includes('/messages/') ||
                          path.includes('/rentals/') || path.includes('/error/')) ? '../' : '';
          window.location.href = prefix + 'login/login.html';
        }
        return null;
      }

      const contentType = res.headers.get('content-type') || '';
      let data;
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      if (!res.ok) {
        let errorMsg = '';
        if (data && typeof data === 'object' && data.message) {
          errorMsg = data.message;
        } else if (typeof data === 'string' && data.length > 0) {
          errorMsg = data;
        } else if (res.status === 401) {
          errorMsg = 'Session expired. Please log in again.';
        } else if (res.status === 403) {
          errorMsg = 'You do not have permission for this action.';
        } else if (res.status === 404) {
          errorMsg = 'The requested resource was not found.';
        } else if (res.status === 409) {
          errorMsg = 'Conflict: ' + (data?.message || 'Action cannot be completed.');
        } else if (res.status >= 500) {
          errorMsg = 'Server error. Please try again later.';
        } else {
          errorMsg = `Request failed (${res.status})`;
        }
        
        const error = {
          status: res.status,
          data,
          message: errorMsg
        };
        
        // Auto-show toast for API errors
        if (showToastOnError) {
          const msg = getErrorMessage(error);
          const type = res.status === 404 ? 'info' : 'error';
          showToast(msg, type);
        }
        
        throw error;
      }

      return data;
    } catch (err) {
      if (err.status !== undefined) throw err;
      throw {
        status: 0,
        message: 'Network error. Please check your connection.',
        data: {}
      };
    }
  }

  return {
    get:       (endpoint, auth = true)        => request('GET',    endpoint, null, auth),
    post:      (endpoint, body, auth = true)  => request('POST',   endpoint, body, auth),
    put:       (endpoint, body, auth = true)  => request('PUT',    endpoint, body, auth),
    patch:     (endpoint, body, auth = true)  => request('PATCH',  endpoint, body, auth),
    patchForm: (endpoint, formData)           => request('PATCH',  endpoint, formData, true, true),
    delete:    (endpoint, auth = true)        => request('DELETE', endpoint, null, auth),
    postForm:  (endpoint, formData)           => request('POST',   endpoint, formData, true, true),
    getToken, getUser, setSession, clearSession, isLoggedIn
  };
})();

/* ============================================
   Toast Notification System
   ============================================ */
function showToast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = {
    success: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M20 6L9 17l-5-5"/></svg>`,
    error:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M12 8v4M12 16h.01"/></svg>`,
    info:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M12 16v-4M12 8h.01"/></svg>`
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `${icons[type] || icons.info}<span>${escapeToast(message)}</span>`;
  container.appendChild(toast);

  const remove = () => {
    toast.classList.add('hide');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  };

  const timer = setTimeout(remove, duration);
  toast.addEventListener('click', () => { clearTimeout(timer); remove(); });
}

function escapeToast(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ============================================
   API Error Handler
   ============================================ */
function handleApiError(err, options = {}) {
  const { 
    showToast = true, 
    defaultMsg = 'Something went wrong. Please try again.',
    onAuthError = null 
  } = options;
  
  const status = err?.status;
  let rawMsg = err?.message || '';
  
  // Sanitize error message - don't show raw technical errors
  let msg = rawMsg;
  
  // If message contains technical keywords, use default
  const technicalKeywords = [
    'java.', 'exception', 'trace', 'nullpointer', 
    'sql', 'database', 'constraint', 'violation',
    'hibernate', 'jpa', 'at com.', 'stacktrace'
  ];
  
  const isTechnical = technicalKeywords.some(kw => 
    rawMsg.toLowerCase().includes(kw.toLowerCase())
  );
  
  if (isTechnical || rawMsg.length > 100) {
    msg = defaultMsg;
  }
  
  // Handle specific known errors
  if (rawMsg.includes('username') && rawMsg.includes('already')) {
    msg = 'Username is already taken. Please choose another.';
  } else if (rawMsg.includes('email') && rawMsg.includes('already')) {
    msg = 'Email is already in use. Please use another email.';
  }
  
  // Handle 401 - Auth errors
  if (status === 401) {
    if (onAuthError) {
      onAuthError();
    }
    return;
  }
  
  // Map status to toast type
  let toastType = 'error';
  if (status === 404) toastType = 'info';
  if (status === 403) toastType = 'error';
  if (status === 409) toastType = 'error';
  
  // Show toast if enabled
  if (showToast) {
    showToast(msg, toastType);
  }
  
  return { status, message: msg };
}
