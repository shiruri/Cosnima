/* ============================================
   COSNIMA — API Client (Improved)
   ============================================ */

const API = (() => {
  const BASE_URL = 'http://localhost:8080';

  // Token management
  function getToken() {
    return localStorage.getItem('cosnimaToken');
  }

  function getUser() {
    try {
      const userStr = localStorage.getItem('cosnimaUser');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  function setSession(token, user) {
    if (token) localStorage.setItem('cosnimaToken', token);
    if (user) localStorage.setItem('cosnimaUser', JSON.stringify(user));
  }

  function clearSession() {
    localStorage.removeItem('cosnimaToken');
    localStorage.removeItem('cosnimaUser');
  }

  function isLoggedIn() {
    return !!getToken();
  }

  // Core request handler
  async function request(method, endpoint, body = null, auth = false) {
    const headers = { 'Content-Type': 'application/json' };
    
    if (auth) {
      const token = getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const options = { method, headers };
    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, options);

      // Handle 401 globally
      if (res.status === 401) {
        clearSession();
        // Use absolute path to avoid navigation issues
        window.location.href = '/login/login.html';
        return;
      }

      // Parse response based on content type
      const contentType = res.headers.get('content-type');
      let data = {};
      
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        // For non-JSON responses, get text
        const text = await res.text();
        data = text ? { message: text } : {};
      }

      if (!res.ok) {
        throw { 
          status: res.status, 
          data,
          message: data.message || `Request failed with status ${res.status}`
        };
      }

      return data;
    } catch (err) {
      // Network errors or parsing errors
      if (err.status) {
        throw err; // Re-throw HTTP errors
      }
      throw {
        status: 0,
        message: 'Network error. Please check your connection.',
        data: {}
      };
    }
  }

  return {
    get:    (endpoint, auth = true)        => request('GET',    endpoint, null, auth),
  post:   (endpoint, body, auth = false) => request('POST',   endpoint, body, auth),
  put:    (endpoint, body, auth = true)  => request('PUT',    endpoint, body, auth),
  patch:  (endpoint, body, auth = true)  => request('PATCH',  endpoint, body, auth),
  delete: (endpoint, auth = true)        => request('DELETE', endpoint, null, auth),
    // Expose session methods
    getToken, 
    getUser, 
    setSession, 
    clearSession, 
    isLoggedIn,
  };
})();