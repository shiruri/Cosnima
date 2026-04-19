/* ============================================
   COSNIMA — Offers Module
   Endpoints:
     GET  /api/offers/listing/{id}         → seller sees listing's offers
     GET  /api/offers/mine                 → buyer sees ALL own offers
     GET  /api/offers/me?status=X          → buyer sees filtered offers
     POST /api/offers/{id}/accept          → seller accepts
     POST /api/offers/{id}/reject          → seller rejects
     POST /api/offers/{id}/cancel          → buyer cancels
     POST /api/offers/listing/{id}         → buyer makes offer
   ============================================ */

/* ── Shared Utilities ── */
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

function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function offerStatusChip(status) {
  const map = {
    PENDING:   { cls: 'chip-pending',   label: 'Pending' },
    ACCEPTED:  { cls: 'chip-accepted',  label: 'Accepted' },
    REJECTED:  { cls: 'chip-rejected',  label: 'Declined' },
    CANCELLED: { cls: 'chip-cancelled', label: 'Cancelled' },
  };
  const s = map[status] || { cls: 'chip-pending', label: status || 'Unknown' };
  return `<span class="offer-status-chip ${s.cls}">${s.label}</span>`;
}

/* ──────────────────────────────────────────
   MAKE OFFER FORM — Buyer view (view-listing)
   ────────────────────────────────────────── */
async function renderMakeOfferForm(listingId, listedPrice, container, isOwner = false) {
  if (!container) return;
  container.innerHTML = '';

  if (isOwner) return;

  if (!API.isLoggedIn()) {
    container.innerHTML = `
      <div class="offer-login-prompt">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
        <p>
          <a href="../login/login.html">Sign in</a> to make an offer on this listing.
          New here? <a href="../signup/register.html">Create a free account</a>.
        </p>
      </div>`;
    return;
  }

  container.innerHTML = `<div style="padding:var(--space-lg);text-align:center;color:var(--ink-faint);font-size:0.85rem;">Checking offers…</div>`;

  // Check for existing PENDING offer — try /me?status=PENDING first, fall back to /mine
  let alreadyOffered = false;
  try {
    const myPending = await API.get('/api/offers/me?status=PENDING', true);
    if (Array.isArray(myPending)) {
      alreadyOffered = myPending.some(o => String(o.listingId) === String(listingId));
    }
  } catch {
    try {
      const myOffers = await API.get('/api/offers/mine', true);
      if (Array.isArray(myOffers)) {
        alreadyOffered = myOffers.some(o =>
          String(o.listingId) === String(listingId) && o.status === 'PENDING'
        );
      }
    } catch { /* proceed anyway */ }
  }

  if (alreadyOffered) {
    container.innerHTML = `
      <div class="offer-already-made">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
        </svg>
        You already have a pending offer on this listing.
        <a href="../offers/offers.html" style="color:var(--accent);font-weight:800;text-decoration:underline;text-underline-offset:2px;margin-left:4px;">View my offers →</a>
      </div>`;
    return;
  }

  container.innerHTML = `
    <div class="offer-form-card">
      <h3 class="offer-form-title">Make an Offer</h3>
      <p class="offer-form-subtitle">Negotiate directly with the seller. They'll accept or decline your offer.</p>

      <div class="offer-field" id="offer-price-field">
        <label for="offer-price">Your Offer Price</label>
        <div class="price-input-wrap">
          <span class="currency-prefix">₱</span>
          <input type="number" id="offer-price"
            placeholder="${listedPrice ? Number(listedPrice).toFixed(0) : '0'}"
            min="1" step="1" autocomplete="off" inputmode="numeric">
        </div>
        ${listedPrice ? `
          <div class="listed-price-ref">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Listed at ${formatPrice(listedPrice)}
          </div>` : ''}
        <span class="offer-field-error" id="offer-price-error">Please enter a valid price greater than ₱0.</span>
      </div>

      <div class="offer-field">
        <label for="offer-message">Message <span style="font-weight:400;text-transform:none;letter-spacing:0;">(optional)</span></label>
        <textarea id="offer-message" rows="3"
          placeholder="Any details you'd like to share with the seller…"
          maxlength="500"></textarea>
        <div class="offer-field-hint">Max 500 characters</div>
      </div>

      <button class="offer-submit-btn" id="offer-submit-btn">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
        </svg>
        <span class="btn-text">Send Offer</span>
        <span class="btn-loader" style="display:none;width:16px;height:16px;border:2px solid white;border-top-color:transparent;border-radius:50%;animation:spin 0.6s linear infinite;"></span>
      </button>

      <div id="offer-form-status" style="display:none;margin-top:var(--space-sm);font-size:0.84rem;font-weight:600;border-radius:var(--radius);padding:0.7rem 1rem;"></div>
    </div>`;

  document.getElementById('offer-submit-btn').addEventListener('click', () => submitOffer(listingId, container));
}

async function submitOffer(listingId, container) {
  const priceInput = document.getElementById('offer-price');
  const msgInput   = document.getElementById('offer-message');
  const priceField = document.getElementById('offer-price-field');
  const statusEl   = document.getElementById('offer-form-status');
  const btn        = document.getElementById('offer-submit-btn');

  // Prevent spam - limit submissions
  if (btn?.disabled) return;
  btn.disabled = true;

  priceField?.classList.remove('has-error');
  if (statusEl) statusEl.style.display = 'none';

  const price = parseFloat(priceInput?.value);
  if (!priceInput?.value || isNaN(price) || price <= 0) {
    priceField?.classList.add('has-error');
    priceInput?.focus();
    btn.disabled = false;
    return;
  }

  const btnText   = btn?.querySelector('.btn-text');
  const btnLoader = btn?.querySelector('.btn-loader');
  if (btnText)   btnText.style.display   = 'none';
  if (btnLoader) btnLoader.style.display = 'inline-block';

  try {
    await API.post(`/api/offers/listing/${listingId}`, {
      offeredPrice: price,
      message: msgInput?.value?.trim() || null,
    }, true);

    container.innerHTML = `
      <div class="offer-already-made">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
        </svg>
        Offer of ${formatPrice(price)} sent! The seller will review it.
        <a href="../offers/offers.html" style="color:var(--accent);font-weight:800;text-decoration:underline;text-underline-offset:2px;margin-left:4px;">View my offers →</a>
      </div>`;

    if (typeof showToast === 'function') showToast('Offer sent successfully! 🎉', 'success');

  } catch (err) {
    if (btn) btn.disabled = false;
    if (btnText)   btnText.style.display   = 'inline';
    if (btnLoader) btnLoader.style.display = 'none';

    const msg = err?.message || 'Failed to send offer. Please try again.';

    if (err?.status === 409 || msg.toLowerCase().includes('already')) {
      container.innerHTML = `
        <div class="offer-already-made">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
          You already have a pending offer on this listing.
          <a href="../offers/offers.html" style="color:var(--accent);font-weight:800;text-decoration:underline;margin-left:4px;">View it →</a>
        </div>`;
      return;
    }

    if (statusEl) {
      statusEl.textContent      = msg;
      statusEl.style.display    = 'block';
      statusEl.style.background = 'rgba(192,57,43,0.08)';
      statusEl.style.border     = '1.5px solid rgba(192,57,43,0.2)';
      statusEl.style.color      = 'var(--error)';
    }
  }
}

/* ──────────────────────────────────────────
   INCOMING OFFERS — Seller view (view-listing)
   ────────────────────────────────────────── */
async function renderIncomingOffers(listingId, container) {
  if (!container || !API.isLoggedIn()) return;

  container.innerHTML = `
    <div class="offers-panel">
      <div class="offers-panel-header">
        <h3 class="offers-panel-title">Incoming Offers</h3>
        <span class="offers-count-badge" id="offers-count">…</span>
      </div>
      <div id="offers-list">${offerSkeletonRow()}${offerSkeletonRow()}</div>
    </div>`;

  try {
    const offers = await API.get(`/api/offers/listing/${listingId}`, true);
    const list   = document.getElementById('offers-list');
    const badge  = document.getElementById('offers-count');

    if (!Array.isArray(offers) || !offers.length) {
      if (badge) badge.textContent = '0';
      if (list) list.innerHTML = `
        <div class="offers-empty">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
          </svg>
          No offers yet. Share your listing to attract buyers!
        </div>`;
      return;
    }

    if (badge) badge.textContent = offers.length;
    if (list) {
      list.innerHTML = offers.map(offer => buildIncomingOfferRow(offer)).join('');
      list.querySelectorAll('[data-accept]').forEach(btn =>
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          handleAcceptOffer(btn.dataset.accept, btn.dataset.buyerId, btn.dataset.listingId, btn.dataset.listingTitle, btn);
        })
      );
      list.querySelectorAll('[data-reject]').forEach(btn =>
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          handleRejectOffer(btn.dataset.reject, btn.dataset.buyerId, btn.dataset.listingId, btn.dataset.listingTitle, btn);
        })
      );
    }
  } catch (err) {
    const list  = document.getElementById('offers-list');
    const badge = document.getElementById('offers-count');
    if (badge) badge.textContent = '—';
    if (list) list.innerHTML = `
      <div class="offers-empty">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        Could not load offers.
        <button onclick="location.reload()" style="text-decoration:underline;font-weight:700;color:var(--accent);background:none;border:none;cursor:pointer;font-family:inherit;">Refresh</button>
      </div>`;
  }
}

function buildIncomingOfferRow(offer) {
  const initial   = (offer.buyerUsername || 'B').charAt(0).toUpperCase();
  const isPending = offer.status === 'PENDING';
  const actionsHtml = isPending
    ? `<div class="offer-row-actions">
        <button class="offer-action-btn accept" data-accept="${escHtml(String(offer.id))}" data-buyer-id="${offer.buyerId || ''}" data-listing-id="${escHtml(String(offer.listingId))}" data-listing-title="${escHtml(offer.listingTitle || '')}">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
          Accept
        </button>
        <button class="offer-action-btn reject" data-reject="${escHtml(String(offer.id))}" data-buyer-id="${offer.buyerId || ''}" data-listing-id="${escHtml(String(offer.listingId))}" data-listing-title="${escHtml(offer.listingTitle || '')}">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
          Decline
        </button>
      </div>`
    : `<div class="offer-row-actions">${offerStatusChip(offer.status)}</div>`;

  return `
    <div class="offer-row" id="offer-row-${escHtml(String(offer.id))}">
      <div class="offer-row-buyer">
        <div class="offer-row-ava">${escHtml(initial)}</div>
        <div>
          <div class="offer-row-name">${escHtml(offer.buyerUsername || 'Buyer')}</div>
          <div class="offer-row-time">${formatRelativeTime(offer.createdAt)}</div>
        </div>
      </div>
      ${offer.message
        ? `<div class="offer-row-message">"${escHtml(offer.message)}"</div>`
        : '<div class="offer-row-message" style="opacity:0.35;font-style:italic;">No message</div>'}
      <div class="offer-row-price">${formatPrice(offer.offeredPrice)}</div>
      ${actionsHtml}
    </div>`;
}
async function handleAcceptOffer(offerId, buyerId, listingId, listingTitle, btn) {
  const row = document.getElementById(`offer-row-${offerId}`) 
           || document.getElementById(`incoming-offer-card-${offerId}`);

  const allBtns = row?.querySelectorAll('.offer-action-btn');
  allBtns?.forEach(b => { b.disabled = true; b.style.opacity = '0.6'; });

  try {
    const currentUser = API.getUser();
    const sellerId = currentUser?.id;

    if (!sellerId) {
      showToast('Please log in to continue.', 'error');
      return;
    }

    // ✅ Accept the offer in backend first
    await API.post(`/api/offers/${offerId}/accept`, {}, true);

    const msgContent = `I've accepted your offer for "${listingTitle}". Let's arrange the exchange!`;

    await API.post('/api/conversations/messages/send/auto', {
      senderId: sellerId,
      recieverId: buyerId,   // ✅ KEEP BACKEND SPELLING
      listingId: String(listingId),
      content: msgContent
    }, true);

    // Update local state
    const idx = allIncomingOffers.findIndex(o => String(o.id) === String(offerId));
    if (idx > -1) allIncomingOffers[idx].status = 'ACCEPTED';

    if (row) {
      row.innerHTML = `
        <div style="display:flex;align-items:center;gap:var(--space-sm);width:100%;padding:var(--space-xs) 0;flex-wrap:wrap;">
          ${offerStatusChip('ACCEPTED')}
          <span style="font-size:0.84rem;color:var(--ink-muted);font-weight:600;">
            Offer accepted — contact the buyer to arrange the exchange.
          </span>
        </div>`;
    }

    showToast('Offer accepted! 🎉', 'success');

  } catch (err) {
    allBtns?.forEach(b => { b.disabled = false; b.style.opacity = '1'; });

    const msg = err?.message || 'Could not accept offer. Please try again.';
    showToast(msg, 'error');
  }
}
async function handleRejectOffer(offerId, buyerId, listingId, listingTitle, btn) {
  const row = document.getElementById(`offer-row-${offerId}`);
  const allBtns = row?.querySelectorAll('.offer-action-btn');

  allBtns?.forEach(b => { b.disabled = true; b.style.opacity = '0.6'; });

  try {
    const currentUser = API.getUser();
    const sellerId = currentUser?.id;

    if (!sellerId) {
      showToast('Please log in to continue.', 'error');
      return;
    }

    // ✅ FIXED ENDPOINT
    await API.post(`/api/offers/${offerId}/reject`, {}, true);

    // Update local state
    const idx = allIncomingOffers.findIndex(o => String(o.id) === String(offerId));
    if (idx > -1) allIncomingOffers[idx].status = 'REJECTED';

    const msgContent = `I've declined your offer for "${listingTitle}".`;

    await API.post('/api/conversations/messages/send/auto', {
      senderId: sellerId,
      recieverId: buyerId,   // ✅ KEEP BACKEND SPELLING
      listingId: String(listingId),
      content: msgContent
    }, true);

    if (row) {
      row.style.transition = 'opacity 0.3s, transform 0.3s';
      row.style.opacity = '0';
      row.style.transform = 'translateX(12px)';

      setTimeout(() => {
        row.remove();

        const badge = document.getElementById('offers-count');
        if (badge) {
          badge.textContent = Math.max(0, (parseInt(badge.textContent) || 1) - 1);
        }
      }, 320);
    }

    showToast('Offer declined.', 'info');

  } catch (err) {
    allBtns?.forEach(b => { b.disabled = false; b.style.opacity = '1'; });

    const msg = err?.message || 'Could not decline offer.';
    showToast(msg, 'error');
  }
}

function offerSkeletonRow() {
  return `
    <div class="offer-row" style="opacity:0.5;pointer-events:none;">
      <div class="offer-row-buyer">
        <div class="offer-row-ava" style="background:var(--border);"></div>
        <div>
          <div style="width:80px;height:10px;background:var(--border);border-radius:4px;margin-bottom:5px;"></div>
          <div style="width:50px;height:8px;background:var(--border);border-radius:4px;"></div>
        </div>
      </div>
      <div style="flex:2;height:10px;background:var(--border);border-radius:4px;"></div>
      <div style="width:70px;height:16px;background:var(--border);border-radius:4px;"></div>
      <div style="width:120px;height:32px;background:var(--border);border-radius:var(--radius-pill);"></div>
    </div>`;
}

/* ──────────────────────────────────────────
   MY OFFERS PAGE — offers.html
   Uses /api/offers/me?status=X for filtered tabs,
   falls back to client-side filtering of allMyOffers
   ────────────────────────────────────────── */
let allMyOffers    = [];
let activeFilter   = 'ALL';
let isLoadingFilter = false;
let activeAnalyticsFilter = 'ALL';
let activeIncomingFilter = 'ALL';
let allIncomingOffers = [];

document.addEventListener('DOMContentLoaded', async () => {
  if (!document.getElementById('my-offers-container')) return;

  if (!API.isLoggedIn()) {
    window.location.href = '../login/login.html';
    return;
  }

  ['sell-link', 'mobile-sell-link'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = '';
  });

  showOfferSkeletons();
  await loadMyOffers();
  wireFilterTabs();
});

async function loadMyOffers() {
  try {
    // /mine returns all statuses for the user — no status filter
    const offers = await API.get('/api/offers/mine', true);
    allMyOffers  = Array.isArray(offers) ? offers : [];
    renderFilteredOffers();
  } catch (err) {
    const container = document.getElementById('my-offers-container');
    if (container) {
      container.innerHTML = `
        <div class="offers-page-empty">
          <div class="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <h3>Could not load offers</h3>
          <p>${err?.status === 0 ? 'Check your internet connection and try again.' : 'Something went wrong on our end.'}</p>
          <button onclick="loadMyOffers()" class="btn btn-outline" style="margin-top:var(--space-md);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M1 4v6h6M23 20v-6h-6"/>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
            </svg>
            Retry
          </button>
        </div>`;
    }
  }
}

/**
 * For non-ALL filters, try GET /api/offers/me?status=X first.
 * If that fails, fall back to client-side filtering of allMyOffers.
 */
async function loadFilteredOffers(status) {
  if (isLoadingFilter) return;
  isLoadingFilter = true;

  const container = document.getElementById('my-offers-container');
  const countEl   = document.getElementById('offers-total-count');
  
  // Add transition class for smooth swap
  if (container) container.classList.add('content-transition');
  
  showOfferSkeletons();

  try {
    let filtered = [];
    try {
      const result = await API.get(`/api/offers/me?status=${status}`, true);
      filtered = Array.isArray(result) ? result : [];
    } catch {
      // /me endpoint unavailable — fall back to local data
      filtered = allMyOffers.filter(o => o.status === status);
    }

    if (countEl) countEl.textContent = `${filtered.length} offer${filtered.length !== 1 ? 's' : ''}`;

    if (!container) return;
    if (!filtered.length) {
      // Small delay to let skeletons render before swapping
      setTimeout(() => {
        container.innerHTML = buildEmptyState(status);
        // Remove transition class after content settles
        setTimeout(() => container.classList.remove('content-transition'), 200);
      }, 100);
      return;
    }

    // Small delay to let skeletons render before swapping
    setTimeout(() => {
      container.innerHTML = `<div class="offers-grid">${filtered.map(o => buildMyOfferCard(o)).join('')}</div>`;
      wireCardCancelButtons(container);
      // Remove transition class after content settles
      setTimeout(() => container.classList.remove('content-transition'), 200);
    }, 100);

  } finally {
    isLoadingFilter = false;
  }
}

function wireFilterTabs() {
  document.querySelectorAll('.offers-filter-tab').forEach(tab => {
    tab.addEventListener('click', () => setFilter(tab.dataset.filter || 'ALL'));
  });
  
  document.querySelectorAll('.dashboard-filter-tab').forEach(tab => {
    tab.addEventListener('click', () => setAnalyticsFilter(tab.dataset.analyticsFilter || 'ALL'));
  });
  
  document.querySelectorAll('.incoming-filter-tab').forEach(tab => {
    tab.addEventListener('click', () => setIncomingFilter(tab.dataset.incomingFilter || 'ALL'));
  });
}

function setAnalyticsFilter(filter) {
  document.querySelectorAll('.dashboard-filter-tab').forEach(t =>
    t.classList.toggle('active', t.dataset.analyticsFilter === filter)
  );
  activeAnalyticsFilter = filter;
  loadOfferAnalytics();
}

function setIncomingFilter(filter) {
  document.querySelectorAll('.incoming-filter-tab').forEach(t =>
    t.classList.toggle('active', t.dataset.incomingFilter === filter)
  );
  activeIncomingFilter = filter;
  renderFilteredIncomingOffers();
}

function renderFilteredIncomingOffers() {
  const container = document.getElementById('incoming-offers-container');
  if (!container) return;
  
  container.classList.add('fade-in');
  
  setTimeout(() => container.classList.remove('fade-in'), 300);
  
  const filtered = activeIncomingFilter === 'ALL'
    ? allIncomingOffers
    : allIncomingOffers.filter(o => o.status === activeIncomingFilter);
  
  if (!filtered.length) {
    container.innerHTML = `
      <div class="incoming-empty">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
        </svg>
        <p>No incoming offers${activeIncomingFilter !== 'ALL' ? ' with this status' : ''}.</p>
      </div>`;
    return;
  }
  
  container.innerHTML = filtered.map(o => buildIncomingOfferCard(o)).join('');
  wireIncomingOfferActions(container);
}

function wireIncomingOfferActions(container) {
  container.querySelectorAll('[data-accept]').forEach(btn =>
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleAcceptOffer(btn.dataset.accept, btn.dataset.buyerId, btn.dataset.listingId, btn.dataset.listingTitle, btn);
    })
  );
  container.querySelectorAll('[data-reject]').forEach(btn =>
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleRejectOffer(btn.dataset.reject, btn.dataset.buyerId, btn.dataset.listingId, btn.dataset.listingTitle, btn);
    })
  );
}

async function loadOfferAnalytics() {
  const container = document.getElementById('analytics-stats');
  const topListings = document.getElementById('top-listings-chart');
  const statusChart = document.getElementById('status-chart');
  
  container.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:var(--space-md);">
      <div class="skeleton-card" style="height:100px;border-radius:var(--radius-lg);"></div>
      <div class="skeleton-card" style="height:100px;border-radius:var(--radius-lg);"></div>
      <div class="skeleton-card" style="height:100px;border-radius:var(--radius-lg);"></div>
      <div class="skeleton-card" style="height:100px;border-radius:var(--radius-lg);"></div>
    </div>
    <div class="skeleton-card" style="height:200px;border-radius:var(--radius-lg);margin-top:var(--space-md);"></div>
  `;
  
  const analyticsContainer = document.getElementById('dashboard-panel');
  if (analyticsContainer) {
    analyticsContainer.classList.add('fade-in');
    setTimeout(() => analyticsContainer.classList.remove('fade-in'), 400);
  }
  
  try {
    let offers = [], myOffers = [];
    
    if (activeAnalyticsFilter === 'ALL' || activeAnalyticsFilter === 'INCOMING') {
      offers = await API.get('/api/offers/incoming', true) || [];
    }
    if (activeAnalyticsFilter === 'ALL' || activeAnalyticsFilter === 'OUTGOING') {
      myOffers = await API.get('/api/offers/mine', true) || [];
    }
    
    const allOffers = [...offers, ...myOffers];
    
    const total = allOffers.length;
    const pending = allOffers.filter(o => o.status === 'PENDING').length;
    const accepted = allOffers.filter(o => o.status === 'ACCEPTED').length;
    const rejected = allOffers.filter(o => o.status === 'REJECTED' || o.status === 'CANCELLED').length;

    container.innerHTML = `
      <div class="analytics-stat-card">
        <div class="analytics-stat-icon total">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
        </div>
        <div class="analytics-stat-value">${total}</div>
        <div class="analytics-stat-label">Total Offers</div>
      </div>
      <div class="analytics-stat-card">
        <div class="analytics-stat-icon pending">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <div class="analytics-stat-value">${pending}</div>
        <div class="analytics-stat-label">Pending</div>
      </div>
      <div class="analytics-stat-card">
        <div class="analytics-stat-icon accepted">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <div class="analytics-stat-value">${accepted}</div>
        <div class="analytics-stat-label">Accepted</div>
      </div>
      <div class="analytics-stat-card">
        <div class="analytics-stat-icon rejected">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <div class="analytics-stat-value">${rejected}</div>
        <div class="analytics-stat-label">Declined</div>
      </div>`;

    topListings.innerHTML = '';
    const byListing = {};
    allOffers.forEach(o => {
      const id = o.listingId;
      byListing[id] = byListing[id] || { count: 0, title: o.listingTitle, image: o.listingImageUrl };
      byListing[id].count++;
    });
    Object.entries(byListing).sort((a, b) => b[1].count - a[1].count).slice(0, 5).forEach(([id, data]) => {
      topListings.innerHTML += `
        <div class="analytics-list-item">
          <div class="analytics-list-thumb">
            ${data.image ? `<img src="${escHtml(data.image)}" alt="">` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--ink-faint);"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" style="width:20px;height:20px;"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg></div>`}
          </div>
          <div class="analytics-list-info">
            <div class="analytics-list-title">${escHtml(data.title || 'Listing')}</div>
            <div class="analytics-list-meta">ID: ${id}</div>
          </div>
          <div class="analytics-list-value">${data.count}</div>
        </div>`;
    });

    const pendingPct = total ? Math.round((pending / total) * 100) : 0;
    const acceptedPct = total ? Math.round((accepted / total) * 100) : 0;
    const rejectedPct = total ? Math.round((rejected / total) * 100) : 0;

    statusChart.innerHTML = total ? `
      <div class="status-bar">
        <div class="status-bar-segment" style="flex:${pendingPct || 1};background:#e67e22;">${pendingPct > 10 ? pendingPct + '%' : ''}</div>
        <div class="status-bar-segment" style="flex:${acceptedPct || 1};background:#27ae60;">${acceptedPct > 10 ? acceptedPct + '%' : ''}</div>
        <div class="status-bar-segment" style="flex:${rejectedPct || 1};background:var(--error);">${rejectedPct > 10 ? rejectedPct + '%' : ''}</div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--ink-faint);">
        <span><span style="display:inline-block;width:10px;height:10px;background:#e67e22;border-radius:50%;margin-right:4px;"></span>Pending (${pending})</span>
        <span><span style="display:inline-block;width:10px;height:10px;background:#27ae60;border-radius:50%;margin-right:4px;"></span>Accepted (${accepted})</span>
        <span><span style="display:inline-block;width:10px;height:10px;background:var(--error);border-radius:50%;margin-right:4px;"></span>Declined (${rejected})</span>
      </div>
    ` : '<div style="text-align:center;padding:20px;color:var(--ink-faint);">No offers yet</div>';

  container.classList.add('fade-in');
  setTimeout(() => container.classList.remove('fade-in'), 400);

  } catch (err) {
    container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--ink-faint);">Failed to load analytics. Please refresh.</div>';
    if (typeof showToast === 'function') showToast('Could not load analytics. Please try again.', 'error');
  }
}

function setFilter(filter) {
  document.querySelectorAll('.offers-filter-tab').forEach(t =>
    t.classList.toggle('active', t.dataset.filter === filter)
  );
  activeFilter = filter;

  if (filter === 'ALL') {
    renderFilteredOffers();
  } else {
    loadFilteredOffers(filter);
  }
}

function renderFilteredOffers() {
  const container = document.getElementById('my-offers-container');
  const countEl   = document.getElementById('offers-total-count');
  if (!container) return;

  const filtered = activeFilter === 'ALL'
    ? allMyOffers
    : allMyOffers.filter(o => o.status === activeFilter);

  if (countEl) countEl.textContent = `${filtered.length} offer${filtered.length !== 1 ? 's' : ''}`;

  if (!filtered.length) {
    container.innerHTML = buildEmptyState(activeFilter);
    return;
  }

  container.innerHTML = `<div class="offers-grid">${filtered.map(o => buildMyOfferCard(o)).join('')}</div>`;
  wireCardCancelButtons(container);
}

function wireCardCancelButtons(container) {
  container.querySelectorAll('[data-cancel-offer]').forEach(btn => {
    btn.addEventListener('click', () => handleCancelOffer(btn.dataset.cancelOffer, btn));
  });
}

function buildEmptyState(filter) {
  const isAll  = filter === 'ALL';
  const label  = filter === 'REJECTED' ? 'declined' : filter.toLowerCase();
  return `
    <div class="offers-page-empty">
      <div class="empty-icon">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
        </svg>
      </div>
      <h3>${isAll ? 'No offers yet' : `No ${label} offers`}</h3>
      <p>${isAll ? 'Browse listings and make your first offer!' : 'Try a different filter to see other offers.'}</p>
      ${isAll ? `
        <a href="../listing/listings.html" class="btn btn-primary" style="margin-top:var(--space-md);">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          Browse Listings
        </a>` : ''}
    </div>`;
}

function buildMyOfferCard(offer) {
  const listingThumb = offer.listingImageUrl
    ? `<img src="${escHtml(offer.listingImageUrl)}" alt="${escHtml(offer.listingTitle || '')}" onerror="this.style.display='none'">`
    : `<div class="offer-card-listing-thumb-placeholder">
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" style="width:24px;height:24px;">
           <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
         </svg>
       </div>`;

  const canCancel  = offer.status === 'PENDING';
  const isAccepted = offer.status === 'ACCEPTED';

  return `
    <div class="offer-card${isAccepted ? ' offer-card--accepted' : ''}" id="my-offer-card-${escHtml(String(offer.id))}" data-offer-id="${escHtml(String(offer.id))}" onclick="openOfferModal('${escHtml(String(offer.id))}')" style="cursor:pointer;">
      <div class="offer-card-top">
        <div class="offer-card-listing-thumb">${listingThumb}</div>
        <div class="offer-card-listing-info">
          <div class="offer-card-listing-title">${escHtml(offer.listingTitle || 'Listing')}</div>
          <a class="offer-card-listing-link" href="../listing/view-listing.html?id=${escHtml(String(offer.listingId))}">
            View Listing
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
          </a>
          ${offer.sellerUsername ? `<div class="offer-seller-info">Seller: ${escHtml(offer.sellerUsername)}</div>` : ''}
        </div>
        ${offerStatusChip(offer.status)}
      </div>

      ${isAccepted ? `
        <div class="offer-card-accepted-banner">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" style="width:16px;height:16px;flex-shrink:0;">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
          Your offer was accepted! ${offer.sellerUsername ? `Contact ${escHtml(offer.sellerUsername)} to arrange the exchange.` : 'Reach out to the seller to arrange the exchange.'}
        </div>` : ''}

      <div class="offer-card-body">
        <div class="offer-card-meta">
          <div class="offer-price-row">
            <span class="offer-my-price">${formatPrice(offer.offeredPrice)}</span>
            ${offer.listedPrice ? `<span class="offer-listed-price">${formatPrice(offer.listedPrice)} listed</span>` : ''}
          </div>
          ${offer.message ? `<div class="offer-message-preview">"${escHtml(offer.message)}"</div>` : ''}
          <div class="offer-card-time">Sent ${formatRelativeTime(offer.createdAt)}</div>
        </div>
        <div class="offer-card-actions">
          ${canCancel ? `
            <button class="offer-cancel-btn" data-cancel-offer="${escHtml(String(offer.id))}">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
              Cancel Offer
            </button>` : ''}
          ${isAccepted && offer.sellerUsername ? `
            <a href="../listing/message-seller.html?listing=${escHtml(String(offer.listingId))}&seller=${offer.sellerId || ''}" class="btn btn-primary" style="padding:0.45rem 1rem;font-size:0.78rem;">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width:13px;height:13px;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
              Message Seller
            </a>` : ''}
        </div>
      </div>
    </div>`;
}

async function handleCancelOffer(offerId, btn) {
  if (!confirm('Cancel this offer? This cannot be undone.')) return;

  const originalHtml = btn.innerHTML;
  btn.disabled    = true;
  btn.textContent = 'Cancelling…';

  try {
    await API.post(`/api/offers/${offerId}/cancel`, {}, true);
    const idx = allMyOffers.findIndex(o => String(o.id) === String(offerId));
    if (idx > -1) allMyOffers[idx].status = 'CANCELLED';

    if (activeFilter === 'ALL') {
      renderFilteredOffers();
    } else {
      await loadFilteredOffers(activeFilter);
    }

    if (typeof showToast === 'function') showToast('Offer cancelled.', 'info');
  } catch (err) {
    btn.disabled  = false;
    btn.innerHTML = originalHtml;
    const msg = err?.message || 'Could not cancel. Please try again.';
    if (typeof showToast === 'function') showToast(msg, 'error');
  }
}

function showOfferSkeletons() {
  const container = document.getElementById('my-offers-container');
  if (!container) return;
  container.innerHTML = `
    <div class="offers-grid">
      ${Array(3).fill(`
        <div class="offer-skeleton">
          <div class="offer-skeleton-top"></div>
          <div class="offer-skeleton-body">
            <div class="offer-skeleton-line w-40"></div>
            <div class="offer-skeleton-line w-60"></div>
            <div class="offer-skeleton-line w-80"></div>
          </div>
        </div>`).join('')}
    </div>`;
}/* ──────────────────────────────────────────
   INCOMING OFFERS DASHBOARD (seller)
   GET /api/offers/incoming
   Renders cards similar to "My Offers"
   ────────────────────────────────────────── */
async function loadIncomingOffersDashboard() {
  const container = document.getElementById('incoming-offers-container');
  if (!container) return;

  container.innerHTML = `
    <div class="incoming-empty">
      <div class="skeleton-card" style="height:120px;border-radius:var(--radius-lg);margin-bottom:var(--space-md);"></div>
      <div class="skeleton-card" style="height:120px;border-radius:var(--radius-lg);margin-bottom:var(--space-md);"></div>
      Loading incoming offers...
    </div>`;

  try {
    const offers = await API.get('/api/offers/incoming', true);
    allIncomingOffers = Array.isArray(offers) ? offers : [];
    
    renderFilteredIncomingOffers();

  } catch (err) {
    container.innerHTML = `
      <div class="incoming-empty">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        Could not load incoming offers.
        <button onclick="loadIncomingOffersDashboard()" class="btn btn-outline" style="margin-top:var(--space-md);display:inline-block;">Retry</button>
      </div>`;
  }
}

/**
 * Builds a card for an incoming offer (seller view)
 * Assumes the offer object contains:
 *   id, buyerUsername, offeredPrice, message, createdAt, status,
 *   listingId, listingTitle, listingImageUrl
 */
function buildIncomingOfferCard(offer) {
  const listingThumb = offer.listingImageUrl
    ? `<img src="${escHtml(offer.listingImageUrl)}" alt="${escHtml(offer.listingTitle || 'Listing')}" onerror="this.style.display='none'">`
    : `<div class="offer-card-listing-thumb-placeholder">
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" style="width:24px;height:24px;">
           <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
         </svg>
       </div>`;

  const isPending = offer.status === 'PENDING';
  const actionsHtml = isPending
    ? `<div class="offer-card-actions">
        <button class="offer-action-btn accept" data-accept="${escHtml(String(offer.id))}" data-buyer-id="${offer.buyerId || ''}" data-listing-id="${escHtml(String(offer.listingId))}" data-listing-title="${escHtml(offer.listingTitle || '')}">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
          Accept
        </button>
        <button class="offer-action-btn reject" data-reject="${escHtml(String(offer.id))}" data-buyer-id="${offer.buyerId || ''}" data-listing-id="${escHtml(String(offer.listingId))}" data-listing-title="${escHtml(offer.listingTitle || '')}">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
          Decline
        </button>
      </div>`
    : `<div class="offer-card-actions">${offerStatusChip(offer.status)}</div>`;

  return `
    <div class="incoming-offer-card" id="incoming-offer-card-${escHtml(String(offer.id))}" data-offer-id="${escHtml(String(offer.id))}" onclick="openIncomingOfferModal('${escHtml(String(offer.id))}')" style="cursor:pointer;">
      <div class="offer-card-top">
        <div class="offer-card-listing-thumb">${listingThumb}</div>
        <div class="offer-card-listing-info">
          <div class="offer-card-listing-title">${escHtml(offer.listingTitle || 'Listing')}</div>
<a class="offer-card-listing-link" href="../listing/view-listing.html?id=${escHtml(String(offer.listingId))}">
            View Listing
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
          </a>
        </div>
        ${offerStatusChip(offer.status)}
      </div>
      <div class="offer-card-body">
        <div class="offer-card-meta">
          <div class="offer-buyer-info">From: ${escHtml(offer.buyerUsername || 'Buyer')}</div>
          <div class="offer-price-row">
            <span class="offer-my-price">${formatPrice(offer.offeredPrice)}</span>
          </div>
          ${offer.message ? `<div class="offer-message-preview">"${escHtml(offer.message)}"</div>` : ''}
          <div class="offer-card-time">Received ${formatRelativeTime(offer.createdAt)}</div>
        </div>
        ${actionsHtml}
      </div>
    </div>`;
}

function openOfferModal(offerId) {
  const offer = allMyOffers.find(o => String(o.id) === String(offerId));
  if (!offer) return;
  
  const modal = document.getElementById('offer-modal');
  const body = document.getElementById('offer-modal-body');
  const isAccepted = offer.status === 'ACCEPTED';
  const canCancel = offer.status === 'PENDING';
  
  const thumbHtml = offer.listingImageUrl 
    ? `<img src="${escHtml(offer.listingImageUrl)}" alt="${escHtml(offer.listingTitle || '')}">`
    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--ink-faint);">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" style="width:32px;height:32px;"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
       </div>`;
  
  body.innerHTML = `
    <div class="offer-modal-header">
      <div class="offer-modal-thumb">${thumbHtml}</div>
      <div>
        <div class="offer-modal-title">${escHtml(offer.listingTitle || 'Listing')}</div>
        <a class="offer-modal-link" href="../listing/view-listing.html?id=${escHtml(String(offer.listingId))}">View Listing →</a>
      </div>
    </div>
    <div class="offer-modal-body">
      ${isAccepted ? `<div style="background:rgba(39,174,96,0.1);border:1px solid rgba(39,174,96,0.3);padding:var(--space-md);border-radius:var(--radius);margin-bottom:var(--space-lg);color:#1a7a40;font-weight:700;display:flex;align-items:center;gap:var(--space-sm);"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg> Offer Accepted!</div>` : ''}
      
      <div class="offer-modal-section">
        <div class="offer-modal-section-title">Your Offer</div>
        <div class="offer-modal-price">${formatPrice(offer.offeredPrice)}</div>
        ${offer.listedPrice ? `<div class="offer-modal-listed">Listed: ${formatPrice(offer.listedPrice)}</div>` : ''}
      </div>
      
      ${offer.message ? `
      <div class="offer-modal-section">
        <div class="offer-modal-section-title">Message</div>
        <div class="offer-modal-message">"${escHtml(offer.message)}"</div>
      </div>` : ''}
      
      <div class="offer-modal-section">
        <div class="offer-modal-section-title">Details</div>
        <div class="offer-modal-meta">
          <p><strong>Seller:</strong> ${escHtml(offer.sellerUsername || 'Unknown')}</p>
          <p><strong>Sent:</strong> ${offer.createdAt ? new Date(offer.createdAt).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Unknown'}</p>
          <p><strong>Status:</strong> ${offerStatusChip(offer.status).replace('offer-status-chip ', '')}</p>
        </div>
      </div>
    </div>
    <div class="offer-modal-actions">
      ${canCancel ? `<button class="offer-cancel-btn" onclick="handleCancelOffer('${escHtml(String(offer.id))}', this); closeOfferModal(); event.stopPropagation();">Cancel Offer</button>` : ''}
      ${isAccepted && offer.sellerUsername ? `<a href="../listing/message-seller.html?listing=${escHtml(String(offer.listingId))}&seller=${offer.sellerId || ''}" class="btn btn-primary" style="padding:0.5rem 1rem;">Message Seller</a>` : ''}
      <a href="../listing/view-listing.html?id=${escHtml(String(offer.listingId))}" class="btn btn-outline" style="padding:0.5rem 1rem;">View Listing</a>
</div>
  `;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeOfferModal() {
  const modal = document.getElementById('offer-modal');
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

function openIncomingOfferModal(offerId) {
  const offer = allIncomingOffers.find(o => String(o.id) === String(offerId));
  if (!offer) return;
  
  const modal = document.getElementById('offer-modal');
  const body = document.getElementById('offer-modal-body');
  const isPending = offer.status === 'PENDING';
  const isAccepted = offer.status === 'ACCEPTED';
  const isRejected = offer.status === 'REJECTED';
  
  const thumbHtml = offer.listingImageUrl 
    ? `<img src="${escHtml(offer.listingImageUrl)}" alt="${escHtml(offer.listingTitle || '')}">`
    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--ink-faint);">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" style="width:32px;height:32px;"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
       </div>`;
  
  let statusBanner = '';
  if (isAccepted) statusBanner = `<div style="background:rgba(39,174,96,0.1);border:1px solid rgba(39,174,96,0.3);padding:var(--space-md);border-radius:var(--radius);margin-bottom:var(--space-lg);color:#1a7a40;font-weight:700;display:flex;align-items:center;gap:var(--space-sm);"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg> Offer Accepted</div>`;
  else if (isRejected) statusBanner = `<div style="background:rgba(192,57,43,0.1);border:1px solid rgba(192,57,43,0.3);padding:var(--space-md);border-radius:var(--radius);margin-bottom:var(--space-lg);color:var(--error);font-weight:700;display:flex;align-items:center;gap:var(--space-sm);"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg> Offer Declined</div>`;
  
  body.innerHTML = `
    <div class="offer-modal-header">
      <div class="offer-modal-thumb">${thumbHtml}</div>
      <div>
        <div class="offer-modal-title">${escHtml(offer.listingTitle || 'Listing')}</div>
        <a class="offer-modal-link" href="../listing/view-listing.html?id=${escHtml(String(offer.listingId))}">View Listing →</a>
      </div>
    </div>
    <div class="offer-modal-body">
      ${statusBanner}
      
      <div class="offer-modal-section">
        <div class="offer-modal-section-title">Offer Amount</div>
        <div class="offer-modal-price">${formatPrice(offer.offeredPrice)}</div>
        ${offer.listedPrice ? `<div class="offer-modal-listed">Listed: ${formatPrice(offer.listedPrice)}</div>` : ''}
      </div>
      
      ${offer.message ? `
      <div class="offer-modal-section">
        <div class="offer-modal-section-title">Message from Buyer</div>
        <div class="offer-modal-message">"${escHtml(offer.message)}"</div>
      </div>` : ''}
      
      <div class="offer-modal-section">
        <div class="offer-modal-section-title">Buyer Info</div>
        <div class="offer-modal-meta">
          <p><strong>Buyer:</strong> ${escHtml(offer.buyerUsername || 'Unknown')}</p>
          <p><strong>Received:</strong> ${offer.createdAt ? new Date(offer.createdAt).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Unknown'}</p>
          <p><strong>Status:</strong> ${offerStatusChip(offer.status).replace('offer-status-chip ', '')}</p>
        </div>
      </div>
    </div>
    <div class="offer-modal-actions">
      ${isPending ? `
      <button class="offer-action-btn accept" data-accept="${escHtml(String(offer.id))}" data-buyer-id="${offer.buyerId || ''}" data-listing-id="${escHtml(String(offer.listingId))}" data-listing-title="${escHtml(offer.listingTitle || '')}" style="display:flex;align-items:center;gap:6px;padding:0.5rem 1rem;">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
        Accept
      </button>
      <button class="offer-action-btn reject" data-reject="${escHtml(String(offer.id))}" data-buyer-id="${offer.buyerId || ''}" data-listing-id="${escHtml(String(offer.listingId))}" data-listing-title="${escHtml(offer.listingTitle || '')}" style="display:flex;align-items:center;gap:6px;padding:0.5rem 1rem;">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        Decline
      </button>` : ''}
      <a href="../listing/view-listing.html?id=${escHtml(String(offer.listingId))}" class="btn btn-outline" style="padding:0.5rem 1rem;">View Listing</a>
    </div>
  `;
  
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Attach event listeners for modal buttons
  body.querySelectorAll('[data-accept]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleAcceptOffer(btn.dataset.accept, btn.dataset.buyerId, btn.dataset.listingId, btn.dataset.listingTitle, btn);
      closeOfferModal();
    });
  });
  body.querySelectorAll('[data-reject]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleRejectOffer(btn.dataset.reject, btn.dataset.buyerId, btn.dataset.listingId, btn.dataset.listingTitle, btn);
      closeOfferModal();
    });
  });
};

// End of offers.js