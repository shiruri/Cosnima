/* ============================================
   COSNIMA — View Listing: Owner Actions & Status
   Drop this into view-listing.js or include separately
   ============================================ */

/**
 * Renders the owner action bar with inline status update.
 * Call this after listing data is loaded if isOwner === true.
 *
 * @param {object} listing  - The listing response object
 * @param {string} container - Selector of where to prepend the bar
 */
function renderOwnerBar(listing, containerSelector = '.listing-main') {
  const existing = document.getElementById('owner-bar');
  if (existing) existing.remove();

  const container = document.querySelector(containerSelector);
  if (!container) return;

  const currentStatus = listing.status || 'AVAILABLE';

  const statuses = [
    {
      value: 'AVAILABLE',
      label: 'Available',
      dotClass: 'dot-available',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
               <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
             </svg>`
    },
    {
      value: 'SOLD',
      label: 'Sold',
      dotClass: 'dot-sold',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
               <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
             </svg>`
    },
    {
      value: 'RENTED',
      label: 'Rented',
      dotClass: 'dot-rented',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
               <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
             </svg>`
    },
    {
      value: 'ARCHIVED',
      label: 'Archive',
      dotClass: 'dot-archived',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
               <path stroke-linecap="round" stroke-linejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
             </svg>`
    },
  ];

  const buttonsHtml = statuses.map(s => `
    <button
      class="status-btn ${s.value === currentStatus ? 'active-status' : ''}"
      data-status="${s.value}"
      title="Mark as ${s.label}"
    >
      ${s.icon}
      <span class="status-dot ${s.dotClass}"></span>
      ${s.label}
    </button>
  `).join('');

  const bar = document.createElement('div');
  bar.id        = 'owner-bar';
  bar.className = 'owner-actions-bar';
  bar.innerHTML = `
    <div>
      <div class="bar-label">Your Listing</div>
      <div class="bar-title">${escapeHtmlSafe(listing.title || 'Untitled')}</div>
    </div>
    <div class="status-picker" id="status-picker">
      ${buttonsHtml}
    </div>
    <div class="bar-actions">
      <a href="update-listing.html?id=${listing.id}" class="btn btn-outline" style="padding:0.5rem 1rem;font-size:0.84rem;">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;">
          <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
        </svg>
        Edit
      </a>
      <button onclick="confirmDeleteListing('${listing.id}')" class="btn btn-ghost" style="padding:0.5rem 1rem;font-size:0.84rem;color:var(--error);border-color:rgba(192,57,43,0.2);">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
        Delete
      </button>
    </div>
  `;

  container.insertAdjacentElement('beforebegin', bar);

  // Wire status buttons
  bar.querySelectorAll('.status-btn').forEach(btn => {
    btn.addEventListener('click', () => updateListingStatus(listing.id, btn.dataset.status, btn));
  });
}

/* ── Update listing status ── */
async function updateListingStatus(listingId, newStatus, clickedBtn) {
  console.log('Function called:', listingId, newStatus);
  const picker = document.getElementById('status-picker');
  console.log('Picker found:', picker);
  if (!picker) {
    console.error('Status picker not found in DOM');
    return;
  }

  // Disable all while saving
  picker.querySelectorAll('.status-btn').forEach(b => b.classList.add('saving'));

  try {
    const url = `/api/listings/${listingId}/status?status=${newStatus}`;
    console.log('=== STATUS UPDATE DEBUG ===');
    console.log('URL:', url);
    console.log('Method: POST');
    console.log('Token exists:', !!API.getToken());
    console.log('================================');
    
    const result = await API.post(url, {}, true);
    console.log('Status update success:', result);

    // Update active state
    picker.querySelectorAll('.status-btn').forEach(b => {
      b.classList.remove('active-status', 'saving');
    });
    clickedBtn.classList.add('active-status');

    // Update the inline status badge on the page if present
    const statusBadge = document.getElementById('listing-status-badge');
    if (statusBadge) {
      statusBadge.textContent = newStatus.charAt(0) + newStatus.slice(1).toLowerCase();
      statusBadge.className = `status-badge status-${newStatus.toLowerCase()}`;
    }

    showToast(`Status updated to ${newStatus.charAt(0) + newStatus.slice(1).toLowerCase()}`, 'success');

  } catch (err) {
    picker.querySelectorAll('.status-btn').forEach(b => b.classList.remove('saving'));
    console.error('Status update error:', err);
    
    let errMsg = err?.message || '';
    if (!errMsg) {
      if (err?.status === 401) errMsg = 'Session expired. Please log in again.';
      else if (err?.status === 403) errMsg = 'You do not have permission to update this listing.';
      else if (err?.status === 404) errMsg = 'Listing not found.';
      else if (err?.status === 409) errMsg = err?.data?.message || 'This listing cannot be updated in its current state.';
      else if (err?.status >= 500) errMsg = 'Server error. Please try again later.';
      else errMsg = 'Failed to update status. Please try again.';
    }
    errMsg = String(errMsg).replace(/<[^>]*>/g, '').replace(/&/g, '&amp;').trim();
    showToast(errMsg, 'error');
  }
}

/* ── Confirm delete ── */
function confirmDeleteListing(listingId) {
  // Simple confirm — can be replaced with a modal
  if (!confirm('Delete this listing? This cannot be undone.')) return;
  deleteListing(listingId);
}

async function deleteListing(listingId) {
  try {
    await API.delete(`/api/listings/${listingId}`);
    showToast('Listing deleted', 'success');
    setTimeout(() => { window.location.href = '../profile/profile.html'; }, 1200);
  } catch (err) {
    showToast('Could not delete listing. Please try again.', 'error');
  }
}

function escapeHtmlSafe(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}