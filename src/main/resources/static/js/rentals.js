/* ============================================
   COSNIMA — Rentals Dashboard Module
   Endpoints:
     GET  /api/rental/mine              → renter sees own rentals
     GET  /api/rental/my-listings       → owner sees rentals for their listings
     GET  /api/rental/{id}              → single rental details
     POST /api/rental/{id}/approve     → owner approves
     POST /api/rental/{id}/reject      → owner rejects
     POST /api/rental/{id}/complete    → owner marks complete
     POST /api/rental/{id}/cancel      → renter cancels
   ============================================ */

function formatPrice(p) {
  if (p == null || p === '') return '—';
  return '₱' + Number(p).toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date)) return '';
    const diffMs  = Date.now() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr  = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);
    if (diffMin < 1)  return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr  < 24) return `${diffHr}h ago`;
    if (diffDay < 7)  return `${diffDay}d ago`;
    return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
  } catch { return ''; }
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return '—'; }
}

function escH(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function rentalStatusChip(status) {
  const map = {
    PENDING:   { cls: 'rental-chip-pending',   label: 'Pending' },
    ACCEPTED:  { cls: 'rental-chip-accepted',  label: 'Active' },
    COMPLETED: { cls: 'rental-chip-completed', label: 'Completed' },
    REJECTED:  { cls: 'rental-chip-rejected',  label: 'Declined' },
    CANCELLED: { cls: 'rental-chip-cancelled', label: 'Cancelled' },
  };
  const s = map[status] || { cls: 'rental-chip-pending', label: status || 'Unknown' };
  return `<span class="rental-status-chip ${s.cls}">${s.label}</span>`;
}

/* ── My Rentals (as Renter) ── */
async function loadMyRentalsDashboard() {
  const container = document.getElementById('my-rentals-container');
  if (!container) return;

  container.innerHTML = `
    <div style="text-align:center;padding:var(--space-xl);color:var(--ink-faint);">
      <div class="loader-dots" style="justify-content:center;margin-bottom:var(--space-md);">
        <span></span><span></span><span></span>
      </div>
      <p>Loading your rentals...</p>
    </div>`;

  try {
    const rentals = await API.get('/api/rental/mine', true) || [];
    renderMyRentals(rentals, container);
  } catch (err) {
    container.innerHTML = `
      <div class="rental-empty">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <p>Could not load rentals. Please try again.</p>
        <button class="btn btn-outline" onclick="loadMyRentalsDashboard()" style="margin-top:var(--space-md);font-size:0.8rem;">Retry</button>
      </div>`;
  }
}

function renderMyRentals(rentals, container) {
  if (!rentals.length) {
    container.innerHTML = `
      <div class="rental-empty">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
        <p>No rental requests yet.</p>
        <a href="../listing/listings.html" class="btn btn-outline" style="margin-top:var(--space-md);font-size:0.8rem;padding:0.4rem 0.9rem;">Browse Rentals</a>
      </div>`;
    return;
  }

  container.innerHTML = rentals.map(r => buildMyRentalCard(r)).join('');

  // Add click handlers to open chat
  container.querySelectorAll('.rental-card-clickable').forEach(card => {
    card.addEventListener('click', () => {
      if (r.conversationId) {
        window.location.href = `../messages/messages.html?conversation=${r.conversationId}`;
      }
    });
  });
}

function buildMyRentalCard(r) {
  const status = r.status || 'PENDING';
  const startDate = r.startDate ? formatDate(r.startDate) : '—';
  const endDate = r.endDate ? formatDate(r.endDate) : '—';
  const totalPrice = r.totalPrice || r.listing?.price || 0;
  const listingTitle = r.listingTitle || r.listing?.title || 'Rental Item';
  const listingImage = r.listingImage || r.listing?.images?.[0]?.imageUrl || '';

  return `
    <div class="incoming-rental-card rental-card-clickable" data-rental-id="${escHtml(r.id)}" style="cursor:pointer;">
      <div class="rental-card-top">
        <div class="rental-card-listing-thumb">
          ${listingImage ? `<img src="${escHtml(listingImage)}" alt="${escHtml(listingTitle)}">` : ''}
        </div>
        <div class="rental-card-listing-info">
          <div class="rental-card-listing-title">${escHtml(listingTitle)}</div>
          <div style="font-size:0.72rem;color:var(--ink-faint);margin-top:2px;">Click to view in chat</div>
        </div>
        ${rentalStatusChip(status)}
      </div>
      <div class="rental-card-body">
        <div class="rental-card-meta">
          <div class="rental-dates-info">
            <div class="rental-date-item">
              <div class="rental-date-label">From</div>
              <div class="rental-date-value">${startDate}</div>
            </div>
            <div class="rental-date-item">
              <div class="rental-date-label">To</div>
              <div class="rental-date-value">${endDate}</div>
            </div>
          </div>
        </div>
        <div class="rental-price-total">${formatPrice(totalPrice)}</div>
      </div>
    </div>`;
}

/* ── Incoming Rentals (as Owner) ── */
async function loadIncomingRentalsDashboard() {
  const container = document.getElementById('incoming-rentals-container');
  if (!container) return;

  container.innerHTML = `
    <div style="text-align:center;padding:var(--space-xl);color:var(--ink-faint);">
      <div class="loader-dots" style="justify-content:center;margin-bottom:var(--space-md);">
        <span></span><span></span><span></span>
      </div>
      <p>Loading incoming rentals...</p>
    </div>`;

  try {
    const rentals = await API.get('/api/rental/my-listings', true) || [];
    renderIncomingRentals(rentals, container);
  } catch (err) {
    container.innerHTML = `
      <div class="rental-empty">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <p>Could not load rentals. Please try again.</p>
        <button class="btn btn-outline" onclick="loadIncomingRentalsDashboard()" style="margin-top:var(--space-md);font-size:0.8rem;">Retry</button>
      </div>`;
  }
}

function renderIncomingRentals(rentals, container) {
  if (!rentals.length) {
    container.innerHTML = `
      <div class="rental-empty">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
        <p>No incoming rental requests.</p>
      </div>`;
    return;
  }

  container.innerHTML = rentals.map(r => buildIncomingRentalCard(r)).join('');

  // Attach action handlers
  container.querySelectorAll('.accept-rental-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const rentalId = btn.dataset.rentalId;
      const listingId = btn.dataset.listingId;
      const renterId = btn.dataset.renterId;
      const listingTitle = btn.dataset.listingTitle;
      await handleRentalAccept(rentalId, listingId, renterId, listingTitle, btn);
    });
  });

  container.querySelectorAll('.reject-rental-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const rentalId = btn.dataset.rentalId;
      const listingId = btn.dataset.listingId;
      const renterId = btn.dataset.renterId;
      const listingTitle = btn.dataset.listingTitle;
      await handleRentalReject(rentalId, listingId, renterId, listingTitle, btn);
    });
  });
}

function buildIncomingRentalCard(r) {
  const status = r.status || 'PENDING';
  const startDate = r.startDate ? formatDate(r.startDate) : '—';
  const endDate = r.endDate ? formatDate(r.endDate) : '—';
  const totalPrice = r.totalPrice || r.listing?.price || 0;
  const listingTitle = r.listingTitle || r.listing?.title || 'Rental Item';
  const listingImage = r.listingImage || r.listing?.images?.[0]?.imageUrl || '';
  const renterName = r.renterUsername || r.renter?.username || 'Renter';
  const renterId = r.renterId || r.renter?.id;

  const canRespond = status === 'PENDING';

  return `
    <div class="incoming-rental-card" data-rental-id="${escHtml(r.id)}">
      <div class="rental-card-top">
        <div class="rental-card-listing-thumb">
          ${listingImage ? `<img src="${escHtml(listingImage)}" alt="${escHtml(listingTitle)}">` : ''}
        </div>
        <div class="rental-card-listing-info">
          <div class="rental-card-listing-title">${escHtml(listingTitle)}</div>
          <a href="../profile/public-profile.html?id=${renterId}" class="offer-card-listing-link" style="font-size:0.74rem;">From: ${escHtml(renterName)}</a>
        </div>
        ${rentalStatusChip(status)}
      </div>
      <div class="rental-card-body">
        <div class="rental-card-meta">
          <div class="rental-dates-info">
            <div class="rental-date-item">
              <div class="rental-date-label">From</div>
              <div class="rental-date-value">${startDate}</div>
            </div>
            <div class="rental-date-item">
              <div class="rental-date-label">To</div>
              <div class="rental-date-value">${endDate}</div>
            </div>
          </div>
          ${r.deposit ? `<div style="font-size:0.75rem;color:var(--ink-muted);margin-top:var(--space-xs);">Deposit: ${formatPrice(r.deposit)}</div>` : ''}
        </div>
        <div class="rental-price-total">${formatPrice(totalPrice)}</div>
      </div>
      ${canRespond ? `
      <div style="padding:0 var(--space-lg) var(--space-lg);display:flex;gap:var(--space-sm);">
        <button class="btn accept-rental-btn" data-rental-id="${escHtml(r.id)}" data-listing-id="${escHtml(r.listingId)}" data-renter-id="${renterId}" data-listing-title="${escHtml(listingTitle)}" style="flex:1;justify-content:center;background:var(--success);color:white;border-color:var(--success);">
          Accept
        </button>
        <button class="btn reject-rental-btn" data-rental-id="${escHtml(r.id)}" data-listing-id="${escHtml(r.listingId)}" data-renter-id="${renterId}" data-listing-title="${escHtml(listingTitle)}" style="flex:1;justify-content:center;background:transparent;color:var(--error);border-color:var(--error);">
          Decline
        </button>
      </div>` : ''}
    </div>`;
}
async function handleRentalAccept(rentalId, listingId, renterId, listingTitle, btn) {
  const allBtns = btn.parentElement.querySelectorAll('.btn');
  allBtns.forEach(b => { b.disabled = true; b.style.opacity = '0.5'; });

  try {
    const currentUser = API.getUser();
    const sellerId = currentUser?.id;

    if (!sellerId) {
      showToast('Please log in to continue.', 'error');
      allBtns.forEach(b => { b.disabled = false; b.style.opacity = '1'; });
      return;
    }

    const msgContent = `I've accepted your rental request for "${listingTitle}". Let's arrange the exchange!`;

    await API.post('/api/conversations/messages/send/auto', {
      senderId: sellerId,
      recieverId: renterId,   // ✅ keep backend spelling
      listingId: String(listingId),
      content: msgContent     // ✅ FIXED (was msgContent before)
    }, true);

    showToast('Rental accepted!', 'success');
    loadIncomingRentalsDashboard();

  } catch (err) {
    const msg = err?.message || 'Could not accept rental.';
    showToast(msg, 'error');
    allBtns.forEach(b => { b.disabled = false; b.style.opacity = '1'; });
  }
}

async function handleRentalReject(rentalId, listingId, renterId, listingTitle, btn) {
  const allBtns = btn.parentElement.querySelectorAll('.btn');
  allBtns.forEach(b => { b.disabled = true; b.style.opacity = '0.5'; });

  try {
    const currentUser = API.getUser();
    const sellerId = currentUser?.id;

    if (!sellerId) {
      showToast('Please log in to continue.', 'error');
      allBtns.forEach(b => { b.disabled = false; b.style.opacity = '1'; });
      return;
    }

    await API.post(`/api/rental/${rentalId}/reject`, null, true);

    const msgContent = `I've declined your rental request for "${listingTitle}".`;

    await API.post('/api/conversations/messages/send/auto', {
      senderId: sellerId,
      recieverId: renterId,   // ✅ keep backend spelling
      listingId: String(listingId),
      content: msgContent     // ✅ FIXED
    }, true);

    showToast('Rental declined.', 'success');
    loadIncomingRentalsDashboard();

  } catch (err) {
    const msg = err?.message || 'Could not decline rental.';
    showToast(msg, 'error');
    allBtns.forEach(b => { b.disabled = false; b.style.opacity = '1'; });
  }
}


// Expose functions globally
window.loadMyRentalsDashboard = loadMyRentalsDashboard;
window.loadIncomingRentalsDashboard = loadIncomingRentalsDashboard;