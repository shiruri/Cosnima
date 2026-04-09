/* ============================================
   COSNIMA — API Client
   ============================================ */

const API = (() => {
  const BASE_URL = 'http://localhost:8080';

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

  // Resolve redirect path relative to static root
  function rootPath(path) {
    return path;
  }

  async function request(method, endpoint, body = null, auth = false, isMultipart = false) {
    const headers = {};

    if (!isMultipart) {
      headers['Content-Type'] = 'application/json';
    }

    if (auth) {
      const token = getToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    const options = { method, headers };
    if (body) {
      options.body = isMultipart ? body : JSON.stringify(body);
    }

    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, options);

      if (res.status === 401) {
        clearSession();
        window.location.href = '/login/login.html';
        return;
      }

      const contentType = res.headers.get('content-type');
      let data = {};
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        data = text ? { message: text } : {};
      }

      if (!res.ok) {
        throw {
          status: res.status,
          data,
          message: data.message || `Request failed (${res.status})`
        };
      }

      return data;
    } catch (err) {
      if (err.status) throw err;
      throw {
        status: 0,
        message: 'Network error. Please check your connection.',
        data: {}
      };
    }
  }

  return {
    get:       (endpoint, auth = true)              => request('GET',    endpoint, null, auth),
    post:      (endpoint, body, auth = false)        => request('POST',   endpoint, body, auth),
    put:       (endpoint, body, auth = true)         => request('PUT',    endpoint, body, auth),
    patch:     (endpoint, body, auth = true)         => request('PATCH',  endpoint, body, auth),
    patchForm: (endpoint, formData)                  => request('PATCH',  endpoint, formData, true, true),
    delete:    (endpoint, auth = true)               => request('DELETE', endpoint, null, auth),
    getToken, getUser, setSession, clearSession, isLoggedIn, rootPath
  };
})();