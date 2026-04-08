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
      return JSON.parse(localStorage.getItem('cosnimaUser'));
    } catch {
      return null;
    }
  }

  function setSession(token, user) {
    localStorage.setItem('cosnimaToken', token);
    localStorage.setItem('cosnimaUser', JSON.stringify(user));
  }

  function clearSession() {
    localStorage.removeItem('cosnimaToken');
    localStorage.removeItem('cosnimaUser');
  }

  function isLoggedIn() {
    return !!getToken();
  }

  async function request(method, endpoint, body = null, auth = false) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth) {
      const token = getToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`${BASE_URL}${endpoint}`, options);

    // Handle 401 globally - Use absolute path to avoid "login/login.html" issues
    if (res.status === 401) {
      clearSession();
      window.location.href = '/login/login.html'; 
      return;
    }

    // --- FIX FOR LINE 43 ---
    // Check if there is content to parse before calling .json()
    const contentType = res.headers.get("content-type");
    let data = {};
    if (contentType && contentType.includes("application/json")) {
      data = await res.json().catch(() => ({}));
    } else {
      // If it's not JSON, get the text instead (or default to empty object)
      const text = await res.text().catch(() => "");
      data = { message: text };
    }

    if (!res.ok) throw { status: res.status, data };
    return data;
  }

  return {
    get:    (endpoint, auth = true)        => request('GET',    endpoint, null, auth),
    post:   (endpoint, body, auth = false) => request('POST',   endpoint, body, auth),
    put:    (endpoint, body, auth = true)  => request('PUT',    endpoint, body, auth),
    delete: (endpoint, auth = true)        => request('DELETE', endpoint, null, auth),
    getToken, getUser, setSession, clearSession, isLoggedIn,
  };
})();