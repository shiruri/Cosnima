/* ============================================
    ADMIN DASHBOARD JavaScript
    ============================================ */

let currentUser = null;
let usersPage = 0;
let listingsPage = 0;
let pageSize = 10;
let charts = {};

// ========== INIT ==========
async function init() {
  // Frontend Auth Guard - check localStorage directly
  const storedUser = localStorage.getItem('cosnimaUser');
  let user = null;
  try { user = storedUser ? JSON.parse(storedUser) : null; } catch { user = null; }

  if (!storedUser || !user) {
    window.location.href = '../login/login.html';
    return;
  }

  // Check banned status
  if (user.isBanned) {
    API.clearSession();
    window.location.href = '../login/login.html';
    return;
  }

  // Check role - must be ADMIN or MODERATOR
  if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
    showToast('Admin access required', 'error');
    window.location.href = '../index.html';
    return;
  }

  currentUser = user;
  renderNavAuth(document.getElementById('nav-auth'));

  await Promise.all([
    loadStats(),
    loadUsers(),
    loadListings()
  ]);

  document.getElementById('loading-screen').classList.add('hide');
}

window.addEventListener('DOMContentLoaded', init);

// ========== STATS ==========
async function loadStats() {
  const statIds = [
    'stat-total-users', 'stat-new-users', 'stat-listings', 'stat-rentals',
    'stat-messages', 'stat-reports', 'stat-active-users', 'stat-banned-users',
    'stat-active-listings', 'stat-sold-listings', 'stat-pending-listings',
    'stat-completed-rentals', 'stat-resolved-reports'
  ];

  // Show loading state
  statIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '...';
  });

  try {
    const stats = await API.get('/api/admin/stats', true);
    if (!stats) throw new Error('No data');

    // Map stats to elements
    const map = {
      'stat-total-users': stats.totalUsers,
      'stat-new-users': stats.newUsersToday,
      'stat-listings': stats.totalListings,
      'stat-rentals': stats.totalRentals,
      'stat-messages': stats.totalMessages,
      'stat-reports': stats.pendingReports,
      'stat-active-users': stats.activeUsers,
      'stat-banned-users': stats.bannedUsers,
      'stat-active-listings': stats.activeListings,
      'stat-sold-listings': stats.soldListings,
      'stat-pending-listings': stats.pendingListings,
      'stat-completed-rentals': stats.completedRentals,
      'stat-resolved-reports': stats.resolvedReports
    };

    Object.entries(map).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val != null ? Number(val).toLocaleString() : '0';
    });
  } catch (err) {
    console.error('Stats error:', err);
    statIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '—';
    });
  }
}

// ========== USERS ==========
async function loadUsers(page = 0) {
  usersPage = page;
  const tbody = document.getElementById('users-table-body');
  tbody.innerHTML = '<tr><td colspan="5" class="loading-cell">Loading...</td></tr>';

  try {
    const result = await API.get(`/api/admin/users?page=${page}&size=${pageSize}`, true);
    if (!result) throw new Error('No response');
    renderUsers(result.content || result);
    renderPagination('users', result.totalPages || 1, page);
  } catch (err) {
    console.error('Load users error:', err);
    tbody.innerHTML = `<tr><td colspan="5" class="loading-cell">Error loading users. <button onclick="loadUsers(${page})">Retry</button></td></tr>`;
  }
}

function renderUsers(users) {
  const tbody = document.getElementById('users-table-body');
  if (!users?.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="loading-cell">No users found</td></tr>';
    return;
  }

  tbody.innerHTML = users.map(user => {
    const initial = (user.username || 'U').charAt(0).toUpperCase();
    const isBanned = user.isBanned;
    const roleClass = (user.role || 'USER').toLowerCase();

    return `
      <tr>
        <td>
          <div class="user-cell">
            <div class="user-avatar">${initial}</div>
            <div>
              <div class="user-name">${escH(user.username)}</div>
              <div class="user-email">${escH(user.email)}</div>
            </div>
          </div>
        </td>
        <td><span class="role-chip ${roleClass}">${user.role || 'USER'}</span></td>
        <td><span class="status-chip ${isBanned ? 'banned' : 'active'}">${isBanned ? 'Banned' : 'Active'}</span></td>
        <td>${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</td>
        <td>
          <div class="action-btns">
            <button class="btn-action view" onclick="viewUser('${user.id}')">View</button>
            <button class="btn-action ${isBanned ? 'unban' : 'ban'}" onclick="toggleBan('${user.id}', ${isBanned})">${isBanned ? 'Unban' : 'Ban'}</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function searchUsers() {
  const query = document.getElementById('user-search').value.toLowerCase();
  const rows = document.querySelectorAll('#users-table-body tr');
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(query) ? '' : 'none';
  });
}

function viewUser(userId) {
  window.location.href = `../profile/public-profile.html?id=${userId}`;
}

// ========== LISTINGS ==========
async function loadListings(page = 0) {
  listingsPage = page;
  const tbody = document.getElementById('listings-table-body');
  tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">Loading...</td></tr>';

  try {
    const result = await API.get(`/api/admin/listings?page=${page}&size=${pageSize}`, true);
    if (!result) throw new Error('No response');
    renderListings(result.content || result);
    renderPagination('listings', result.totalPages || 1, page);
  } catch (err) {
    console.error('Load listings error:', err);
    tbody.innerHTML = `<tr><td colspan="6" class="loading-cell">Error loading. <button onclick="loadListings(${page})">Retry</button></td></tr>`;
  }
}

function renderListings(listings) {
  const tbody = document.getElementById('listings-table-body');
  if (!listings?.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">No listings found</td></tr>';
    return;
  }
  
  tbody.innerHTML = listings.map(listing => {
    const thumb = listing.images?.[0]?.imageUrl;
    const thumbHtml = thumb 
      ? `<img src="${thumb}" alt="">`
      : `<div class="listing-thumb-placeholder"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg></div>`;
    
    const statusClass = listing.status?.toLowerCase() || 'available';
    const typeClass = listing.type === 'RENT' ? 'rented' : 'sold';
    
    return `
      <tr>
        <td>
          <div class="listing-cell">
            <div class="listing-thumb">${thumbHtml}</div>
            <div class="listing-info">
              <div class="listing-title">${escH(listing.title)}</div>
              <div class="listing-price">₱${Number(listing.price).toLocaleString()}</div>
            </div>
          </div>
        </td>
        <td>${escH(listing.sellerName || listing.seller?.username || '—')}</td>
        <td><span class="status-chip ${typeClass}">${listing.type}</span></td>
        <td><span class="status-chip ${statusClass}">${listing.status}</span></td>
        <td>${listing.viewCount || 0}</td>
        <td>
          <div class="action-btns">
            <button class="btn-action view" onclick="viewListing('${listing.id}')">View</button>
            <button class="btn-action delete" onclick="deleteListing('${listing.id}')">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function searchListings() {
  const query = document.getElementById('listing-search').value.toLowerCase();
  const rows = document.querySelectorAll('#listings-table-body tr');
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(query) ? '' : 'none';
  });
}

function viewListing(listingId) {
  window.location.href = `../listing/view-listing.html?id=${listingId}`;
}

async function deleteListing(listingId) {
  if (!listingId) return;
  if (!confirm('Delete this listing? This cannot be undone.')) return;

  try {
    await API.delete(`/api/admin/${listingId}`, true);
    showToast('Listing deleted', 'success');
    loadListings(listingsPage);
    loadStats();
  } catch (err) {
    console.error('Delete listing error:', err);
    showToast(err?.message || 'Failed to delete', 'error');
  }
}

// ========== REPORTS ==========
async function loadReports() {
  const container = document.getElementById('reports-list');
  if (!container) return;

  container.innerHTML = '<div class="loading-cell">Loading...</div>';

  try {
    const result = await API.get('/api/admin/reports?page=0&size=20', true);
    const reports = result?.content || [];

    if (!reports || reports.length === 0) {
      container.innerHTML = '<div class="empty-state"><h3>No reports</h3><p>All clear!</p></div>';
      return;
    }

    let html = '';
    for (const report of reports) {
      if (!report || !report.id) continue;

      const reportId = report.id;
      const status = report.status || 'PENDING';

      html += `<div class="report-card">
        <div class="report-header">
          <span class="report-type">${report.targetType || '?'}</span>
          <span class="report-status ${status.toLowerCase()}">${status}</span>
        </div>
        <div class="report-content">
          <p><strong>Reason:</strong> ${report.reason || 'N/A'}</p>
          ${report.description ? `<p>${report.description}</p>` : ''}
        </div>
        <div class="report-meta">
          <span>By: ${report.reporterId || 'Anonymous'}</span>
          <span>${report.createdAt || ''}</span>
        </div>
        ${status === 'PENDING' ? `<div class="action-btns"><button class="btn-action view" onclick="resolveReport('${reportId}','RESOLVED')">Mark Resolved</button><button class="btn-action delete" onclick="resolveReport('${reportId}','REJECTED')">Reject</button></div>` : ''}
      </div>`;
    }

    container.innerHTML = html || '<div class="empty-state"><h3>No reports</h3></div>';
  } catch (err) {
    container.innerHTML = '<div class="empty-state"><h3>Error: ' + (err?.message || 'Failed to load') + '</h3></div>';
  }
}

async function resolveReport(reportId, status) {
  if (!reportId) return;
  const note = prompt('Add admin note (optional):');
  if (note === null) return;
  try {
    await API.post(`/api/admin/reports/${reportId}/review`, { status, adminNote: note || '' }, true);
    showToast(`Report ${status?.toLowerCase() || 'done'}`, 'success');
    loadReports();
    loadStats();
  } catch (err) {
    console.error('Resolve report error:', err);
    showToast(err?.message || 'Failed to process', 'error');
  }
}

// ========== BAN/UNBAN ==========
async function toggleBan(userId, isCurrentlyBanned) {
  if (!userId) {
    showToast('Invalid user', 'error');
    return;
  }
  const action = isCurrentlyBanned ? 'unban' : 'ban';
  if (!confirm(`Are you sure you want to ${action} this user?`)) return;

  try {
    if (isCurrentlyBanned) {
      await API.post(`/api/admin/${userId}/unban`, {}, true);
      showToast('User unbanned', 'success');
    } else {
      const reason = prompt('Ban reason (optional):') || '';
      await API.post(`/api/admin/${userId}/ban`, { banReason: reason }, true);
      showToast('User banned', 'success');
    }
    loadUsers(usersPage);
    loadStats();
  } catch (err) {
    console.error('Toggle ban error:', err);
    showToast(err?.message || 'Failed to update user', 'error');
  }
}

// ========== PAGINATION ==========
function renderPagination(type, totalPages, currentPage) {
  const container = document.getElementById(`${type}-pagination`);
  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }
  
  let html = '';
  
  // Prev button
  html += `<button class="page-btn" ${currentPage === 0 ? 'disabled' : ''} onclick="load${type.charAt(0).toUpperCase() + type.slice(1)}(${currentPage - 1})">Prev</button>`;
  
  // Page numbers
  for (let i = 0; i < Math.min(totalPages, 5); i++) {
    html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="load${type.charAt(0).toUpperCase() + type.slice(1)}(${i})">${i + 1}</button>`;
  }
  
  // Next button
  html += `<button class="page-btn" ${currentPage >= totalPages - 1 ? 'disabled' : ''} onclick="load${type.charAt(0).toUpperCase() + type.slice(1)}(${currentPage + 1})">Next</button>`;
  
  container.innerHTML = html;
}

// ========== TABS ==========
function switchTab(tab) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.querySelectorAll('.admin-section').forEach(s => s.classList.toggle('active', s.id === `${tab}-section`));

  // Lazy load reports when tab is clicked
  if (tab === 'reports') {
    loadReports();
  }
}

// ========== UTILITIES ==========
function escH(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container') || document.body;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Expose globally
window.switchTab = switchTab;
window.loadUsers = loadUsers;
window.loadListings = loadListings;
window.searchUsers = searchUsers;
window.searchListings = searchListings;
window.viewUser = viewUser;
window.viewListing = viewListing;
window.deleteListing = deleteListing;
window.toggleBan = toggleBan;
window.resolveReport = resolveReport;
window.showToast = showToast;