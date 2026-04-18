/* ============================================
   ADMIN DASHBOARD JavaScript
   ============================================ */

let currentUser = null;
let usersPage = 0;
let listingsPage = 0;
let pageSize = 10;

// ========== INIT ==========
async function init() {
  if (!API.isLoggedIn()) {
    window.location.href = '../login/login.html';
    return;
  }
  
  currentUser = API.getUser();
  if (currentUser?.role !== 'ADMIN' && currentUser?.role !== 'MODERATOR') {
    showToast('Admin access required', 'error');
    window.location.href = '../index.html';
    return;
  }
  
  renderNavAuth(document.getElementById('nav-auth'));
  
  await Promise.all([
    loadStats(),
    loadUsers(),
    loadListings(),
    loadReports()
  ]);
  
  document.getElementById('loading-screen').classList.add('hide');
}

window.addEventListener('DOMContentLoaded', init);

// ========== STATS ==========
async function loadStats() {
  try {
    const stats = await API.get('/api/admin/stats', true);
    
    document.getElementById('stat-total-users').textContent = stats.totalUsers?.toLocaleString() || '0';
    document.getElementById('stat-new-users').textContent = stats.newUsersToday?.toLocaleString() || '0';
    document.getElementById('stat-listings').textContent = stats.totalListings?.toLocaleString() || '0';
    document.getElementById('stat-rentals').textContent = stats.totalRentals?.toLocaleString() || '0';
    document.getElementById('stat-messages').textContent = stats.totalMessages?.toLocaleString() || '0';
    document.getElementById('stat-reports').textContent = (stats.pendingReports || 0).toLocaleString() || '0';
  } catch (err) {
    console.error('Failed to load stats:', err);
  }
}

// ========== USERS ==========
async function loadUsers(page = 0) {
  usersPage = page;
  const tbody = document.getElementById('users-table-body');
  tbody.innerHTML = '<tr><td colspan="5" class="loading-cell">Loading...</td></tr>';
  
  try {
    const result = await API.get(`/api/admin/users?page=${page}&size=${pageSize}`, true);
    renderUsers(result.content || result);
    renderPagination('users', result.totalPages || 1, page);
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="5" class="loading-cell">Failed to load users</td></tr>';
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
    const statusClass = user.isBanned ? 'banned' : 'active';
    const statusText = user.isBanned ? 'Banned' : 'Active';
    const roleClass = user.role?.toLowerCase() || 'user';
    const banBtnLabel = user.isBanned ? 'Unban' : 'Ban';
    const banBtnClass = user.isBanned ? 'unban' : 'ban';
    
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
        <td><span class="role-chip ${roleClass}">${user.role}</span></td>
        <td><span class="status-chip ${statusClass}">${statusText}</span></td>
        <td>${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</td>
        <td>
          <div class="action-btns">
            <button class="btn-action view" onclick="viewUser('${user.id}')">View</button>
            <button class="btn-action ${banBtnClass}" onclick="openBanModal('${user.id}', ${user.isBanned})">${banBtnLabel}</button>
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
    renderListings(result.content || result);
    renderPagination('listings', result.totalPages || 1, page);
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">Failed to load listings</td></tr>';
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
  if (!confirm('Delete this listing? This cannot be undone.')) return;
  
  try {
    await API.delete(`/api/admin/${listingId}`, true);
    showToast('Listing deleted', 'success');
    loadListings(listingsPage);
    loadStats();
  } catch (err) {
    showToast(err?.message || 'Failed to delete listing', 'error');
  }
}

// ========== REPORTS ==========
async function loadReports() {
  const container = document.getElementById('reports-list');
  container.innerHTML = '<div class="loading-cell">Loading...</div>';
  
  try {
    const result = await API.get('/api/admin/reports?page=0&size=20', true);
    const reports = result.content || result;
    
    if (!reports?.length) {
      container.innerHTML = '<div class="empty-state"><h3>No reports</h3><p>All clear!</p></div>';
      return;
    }
    
    container.innerHTML = reports.map(report => {
      const statusClass = report.status?.toLowerCase().replace('_', '-') || 'pending';
      const canReview = report.status === 'PENDING' || report.status === 'UNDER_REVIEW';
      
      return `
        <div class="report-card">
          <div class="report-header">
            <span class="report-type">${report.targetType}</span>
            <span class="report-status ${statusClass}">${report.status}</span>
          </div>
          <div class="report-content">
            <p><strong>Reason:</strong> ${report.reason}</p>
            ${report.description ? `<p>${escH(report.description)}</p>` : ''}
          </div>
          <div class="report-meta">
            <span>Reported by: ${escH(report.reporterName || 'Anonymous')}</span>
            <span>${report.createdAt ? new Date(report.createdAt).toLocaleDateString() : ''}</span>
          </div>
          ${canReview ? `
            <div class="action-btns" style="margin-top:var(--space-md);">
              <button class="btn-action view" onclick="resolveReport('${report.id}', 'RESOLVED')">Resolve</button>
              <button class="btn-action ban" onclick="resolveReport('${report.id}', 'REJECTED')">Reject</button>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  } catch (err) {
    container.innerHTML = '<div class="empty-state"><h3>Failed to load reports</h3></div>';
  }
}

async function resolveReport(reportId, status) {
  try {
    await API.post(`/api/admin/reports/${reportId}/review`, { status, adminNote: '' }, true);
    showToast(`Report ${status.toLowerCase()}`, 'success');
    loadReports();
    loadStats();
  } catch (err) {
    showToast(err?.message || 'Failed to process report', 'error');
  }
}

// ========== BAN MODAL ==========
function openBanModal(userId, isCurrentlyBanned) {
  document.getElementById('ban-user-id').value = userId;
  document.getElementById('ban-form').dataset.unban = isCurrentlyBanned;
  document.getElementById('ban-modal').style.display = 'flex';
}

function closeBanModal() {
  document.getElementById('ban-modal').style.display = 'none';
  document.getElementById('ban-form').reset();
}

document.getElementById('ban-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const userId = document.getElementById('ban-user-id').value;
  const isUnban = document.getElementById('ban-form').dataset.unban === 'true';
  const reason = document.getElementById('ban-reason').value;
  const notes = document.getElementById('ban-notes').value;
  
  try {
    if (isUnban) {
      await API.post(`/api/admin/${userId}/unban`, {}, true);
      showToast('User unbanned', 'success');
    } else {
      await API.post(`/api/admin/${userId}/ban`, { banReason: reason + (notes ? ': ' + notes : '') }, true);
      showToast('User banned', 'success');
    }
    
    closeBanModal();
    loadUsers(usersPage);
    loadStats();
  } catch (err) {
    showToast(err?.message || 'Failed to update user', 'error');
  }
});

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
}

// ========== UTILITIES ==========
function escH(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Expose to window
window.loadUsers = loadUsers;
window.loadListings = loadListings;
window.switchTab = switchTab;
window.searchUsers = searchUsers;
window.searchListings = searchListings;
window.viewUser = viewUser;
window.viewListing = viewListing;
window.deleteListing = deleteListing;
window.openBanModal = openBanModal;
window.closeBanModal = closeBanModal;
window.resolveReport = resolveReport;