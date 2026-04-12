/* ============================================
   COSNIMA — Offers Module  (fixed)
   Endpoints match OffersController:
     GET  /api/offers/listing/{id}    → getOffers (seller sees listing's offers)
     GET  /api/offers/mine            → getUserOffers (buyer sees own offers)
     POST /api/offers/{id}/accept     → acceptOffer
     POST /api/offers/{id}/reject     → rejectOffer
     POST /api/offers/{id}/cancel     → cancelOffer   ← was wrongly /{id}/accept
     POST /api/offers/listing/{id}    → makeOffer
   ============================================ */

/* ──────────────────────────────────────────
   SHARED UTILITIES
   ────────────────────────────────────────── */

function formatPrice(p) {
  if (p == null) return '—';
  return '₱' + Number(p).toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr  = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1)  return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr  < 24) return `${diffHr}h ago`;
  if (diffDay < 7)  return `${diffDay}d ago`;

  return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
}

function escapeHtml(str) {
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
  const s = map[status] || { cls: 'chip-pending', label: status };
  return `<span class="offer-status-chip ${s.cls}">${s.label}</span>`;
}


/* ──────────────────────────────────────────
   MAKE OFFER — BUYER (view-listing page)
   renderMakeOfferForm(listingId, listedPrice, container, isOwner)
   ────────────────────────────────────────── */

async function renderMakeOfferForm(listingId, listedPrice, container, isOwner = false) {
  if (!container) return;

  // Owners cannot offer on their own listing
  if (isOwner) {
    container.innerHTML = '';
    return;
  }

  // Not logged in
  if (!API.isLoggedIn()) {
    container.innerHTML = `
      <div class="offer-login-prompt">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
        <p>
          <a href="../login/login.html">Sign in</a> to make an offer on this listing.
          Don't have an account? <a href="../signup/register.html">Create one free</a>.
        </p>
      </div>`;
    return;
  }

  // Check if user already has a PENDING offer on this listing
  let alreadyOffered = false;
  try {
    const myOffers = await API.get('/api/offers/mine', true);
    if (Array.isArray(myOffers)) {
      alreadyOffered = myOffers.some(o =>
        String(o.listingId) === String(listingId) && o.status === 'PENDING'
      );
    }
  } catch { /* proceed normally */ }

  if (alreadyOffered) {
    container.innerHTML = `
      <div class="offer-already-made">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
        </svg>
        You already have a pending offer on this listing.
        <a href="../offers/offers.html" style="color:var(--accent);font-weight:800;text-decoration:underline;text-underline-offset:2px;margin-left:4px;">View it</a>
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
          <input
            type="number"
            id="offer-price"
            placeholder="${listedPrice ? Number(listedPrice).toFixed(0) : '0'}"
            min="1"
            step="1"
            autocomplete="off"
          >
        </div>
        ${listedPrice ? `
          <div class="listed-price-ref">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Listed at ${formatPrice(listedPrice)}
          </div>` : ''}
        <span class="offer-field-error" id="offer-price-error">Please enter a valid price greater than 0.</span>
      </div>

      <div class="offer-field">
        <label for="offer-message">Message <span style="font-weight:400;text-transform:none;letter-spacing:0;">(optional)</span></label>
        <textarea
          id="offer-message"
          rows="3"
          placeholder="Any details you'd like to share with the seller..."
          maxlength="500"
        ></textarea>
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

  // Validate
  priceField.classList.remove('has-error');
  statusEl.style.display = 'none';
  const price = parseFloat(priceInput.value);
  if (!priceInput.value || isNaN(price) || price <= 0) {
    priceField.classList.add('has-error');
    priceInput.focus();
    return;
  }

  // Loading state
  const btnText   = btn.querySelector('.btn-text');
  const btnLoader = btn.querySelector('.btn-loader');
  btn.disabled = true;
  btnText.style.display   = 'none';
  btnLoader.style.display = 'inline-block';

  try {
    // POST /api/offers/listing/{listingId}
    // Body: { offeredPrice: number, message: string|null }
    await API.post(`/api/offers/listing/${listingId}`, {
      offeredPrice: price,
      message: msgInput.value.trim() || null,
    }, true);

    // Success — replace form with confirmation
    container.innerHTML = `
      <div class="offer-already-made">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
        </svg>
        Offer of ${formatPrice(price)} sent! The seller will review it.
        <a href="../offers/offers.html" style="color:var(--accent);font-weight:800;text-decoration:underline;text-underline-offset:2px;margin-left:4px;">View my offers</a>
      </div>`;

    if (typeof showToast === 'function') showToast('Offer sent successfully!', 'success');

  } catch (err) {
    btn.disabled = false;
    btnText.style.display   = 'inline';
    btnLoader.style.display = 'none';

    const msg = err?.data?.message || err?.message || 'Failed to send offer. Please try again.';
    statusEl.textContent         = msg;
    statusEl.style.display       = 'block';
    statusEl.style.background    = 'rgba(192,57,43,0.08)';
    statusEl.style.border        = '1.5px solid rgba(192,57,43,0.2)';
    statusEl.style.color         = 'var(--error)';
  }
}


/* ──────────────────────────────────────────
   INCOMING OFFERS — SELLER (view-listing page)
   renderIncomingOffers(listingId, container)
   ────────────────────────────────────────── */

async function renderIncomingOffers(listingId, container) {
  if (!container || !API.isLoggedIn()) return;

  container.innerHTML = `
    <div class="offers-panel">
      <div class="offers-panel-header">
        <h3 class="offers-panel-title">Incoming Offers</h3>
        <span class="offers-count-badge" id="offers-count">…</span>
      </div>
      <div id="offers-list">
        ${offerSkeletonRow()}${offerSkeletonRow()}
      </div>
    </div>`;

  try {
    // GET /api/offers/listing/{listingId}
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
          No pending offers yet.
        </div>`;
      return;
    }

    if (badge) badge.textContent = offers.length;
    if (list) {
      list.innerHTML = offers.map(offer => buildIncomingOfferRow(offer)).join('');

      // Wire action buttons
      list.querySelectorAll('[data-accept]').forEach(btn => {
        btn.addEventListener('click', () => handleAcceptOffer(btn.dataset.accept, btn));
      });
      list.querySelectorAll('[data-reject]').forEach(btn => {
        btn.addEventListener('click', () => handleRejectOffer(btn.dataset.reject, btn));
      });
    }

  } catch (err) {
    const list  = document.getElementById('offers-list');
    const badge = document.getElementById('offers-count');
    if (badge) badge.textContent = '—';
    if (list) list.innerHTML = `<div class="offers-empty">Could not load offers.</div>`;
  }
}

function buildIncomingOfferRow(offer) {
  const initial = (offer.buyerUsername || 'B').charAt(0).toUpperCase();
  // Only show accept/reject on PENDING offers
  const isPending = offer.status === 'PENDING';
  const actionsHtml = isPending
    ? `<div class="offer-row-actions">
        <button class="offer-action-btn accept" data-accept="${escapeHtml(String(offer.id))}">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
          Accept
        </button>
        <button class="offer-action-btn reject" data-reject="${escapeHtml(String(offer.id))}">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
          Decline
        </button>
      </div>`
    : `<div class="offer-row-actions">${offerStatusChip(offer.status)}</div>`;

  return `
    <div class="offer-row" id="offer-row-${escapeHtml(String(offer.id))}">
      <div class="offer-row-buyer">
        <div class="offer-row-ava">${initial}</div>
        <div>
          <div class="offer-row-name">${escapeHtml(offer.buyerUsername || 'Buyer')}</div>
          <div class="offer-row-time">${formatRelativeTime(offer.createdAt)}</div>
        </div>
      </div>
      ${offer.message
        ? `<div class="offer-row-message">"${escapeHtml(offer.message)}"</div>`
        : '<div class="offer-row-message" style="opacity:0.4;">No message</div>'}
      <div class="offer-row-price">${formatPrice(offer.offeredPrice)}</div>
      ${actionsHtml}
    </div>`;
}

async function handleAcceptOffer(offerId, btn) {
  const row = document.getElementById(`offer-row-${offerId}`);
  const allBtns = row?.querySelectorAll('.offer-action-btn');
  allBtns?.forEach(b => b.disabled = true);

  try {
    // POST /api/offers/{offerId}/accept
    await API.post(`/api/offers/${offerId}/accept`, null, true);
    if (row) {
      row.innerHTML = `
        <div style="display:flex;align-items:center;gap:var(--space-sm);width:100%;padding:var(--space-xs) 0;">
          ${offerStatusChip('ACCEPTED')}
          <span style="font-size:0.84rem;color:var(--ink-muted);font-weight:600;">Offer accepted — contact the buyer to arrange the exchange.</span>
        </div>`;
    }
    if (typeof showToast === 'function') showToast('Offer accepted!', 'success');
  } catch (err) {
    allBtns?.forEach(b => b.disabled = false);
    const msg = err?.data?.message || err?.message || 'Could not accept offer. Please try again.';
    if (typeof showToast === 'function') showToast(msg, 'error');
  }
}

async function handleRejectOffer(offerId, btn) {
  const row = document.getElementById(`offer-row-${offerId}`);
  const allBtns = row?.querySelectorAll('.offer-action-btn');
  allBtns?.forEach(b => b.disabled = true);

  try {
    // POST /api/offers/{offerId}/reject
    await API.post(`/api/offers/${offerId}/reject`, null, true);
    if (row) {
      row.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      row.style.opacity    = '0';
      row.style.transform  = 'translateX(12px)';
      setTimeout(() => row.remove(), 320);

      // Decrement badge
      const badge = document.getElementById('offers-count');
      if (badge) {
        const current = parseInt(badge.textContent) || 1;
        badge.textContent = Math.max(0, current - 1);
      }
    }
    if (typeof showToast === 'function') showToast('Offer declined.', 'info');
  } catch (err) {
    allBtns?.forEach(b => b.disabled = false);
    const msg = err?.data?.message || err?.message || 'Could not decline offer. Please try again.';
    if (typeof showToast === 'function') showToast(msg, 'error');
  }
}

function offerSkeletonRow() {
  return `
    <div class="offer-row" style="opacity:0.5;">
      <div class="offer-row-buyer">
        <div class="offer-row-ava" style="background:var(--border);">&nbsp;</div>
        <div>
          <div style="width:80px;height:11px;background:var(--border);border-radius:4px;margin-bottom:5px;"></div>
          <div style="width:50px;height:9px;background:var(--border);border-radius:4px;"></div>
        </div>
      </div>
      <div style="flex:2;height:11px;background:var(--border);border-radius:4px;"></div>
      <div style="width:70px;height:18px;background:var(--border);border-radius:4px;"></div>
      <div style="width:120px;height:32px;background:var(--border);border-radius:var(--radius-pill);"></div>
    </div>`;
}


/* ──────────────────────────────────────────
   MY OFFERS PAGE — offers.html
   ────────────────────────────────────────── */

let allMyOffers  = [];
let activeFilter = 'ALL';

document.addEventListener('DOMContentLoaded', async () => {
  // Only run on the offers.html page
  if (!document.getElementById('my-offers-container')) return;

  if (!API.isLoggedIn()) {
    window.location.href = '../login/login.html';
    return;
  }

  // Show sell link for logged-in users
  const sellLink = document.getElementById('sell-link');
  const mobileSellLink = document.getElementById('mobile-sell-link');
  if (sellLink) sellLink.style.display = '';
  if (mobileSellLink) mobileSellLink.style.display = '';

  showOfferSkeletons();
  await loadMyOffers();
  wireFilterTabs();
});

async function loadMyOffers() {
  try {
    // GET /api/offers/mine
    const offers = await API.get('/api/offers/mine', true);
    allMyOffers = Array.isArray(offers) ? offers : [];
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
          <p>Check your connection and try refreshing the page.</p>
          <button onclick="loadMyOffers()" class="btn btn-outline" style="margin-top:var(--space-md)">Retry</button>
        </div>`;
    }
  }
}

function wireFilterTabs() {
  document.querySelectorAll('.offers-filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.offers-filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeFilter = tab.dataset.filter || 'ALL';
      renderFilteredOffers();
    });
  });
}

function renderFilteredOffers() {
  const container = document.getElementById('my-offers-container');
  const countEl   = document.getElementById('offers-total-count');
  if (!container) return;

  const filtered = activeFilter === 'ALL'
    ? allMyOffers
    : allMyOffers.filter(o => o.status === activeFilter);

  if (countEl) {
    countEl.textContent = `${filtered.length} offer${filtered.length !== 1 ? 's' : ''}`;
  }

  if (!filtered.length) {
    container.innerHTML = `
      <div class="offers-page-empty">
        <div class="empty-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
          </svg>
        </div>
        <h3>${activeFilter === 'ALL' ? 'No offers yet' : `No ${activeFilter.toLowerCase()} offers`}</h3>
        <p>${activeFilter === 'ALL'
          ? 'Browse listings and make your first offer.'
          : 'Try a different filter.'}</p>
        ${activeFilter === 'ALL'
          ? `<a href="../listing/listings.html" class="btn btn-primary" style="margin-top:var(--space-md)">Browse Listings</a>`
          : ''}
      </div>`;
    return;
  }

  container.innerHTML = `<div class="offers-grid">${filtered.map(o => buildMyOfferCard(o)).join('')}</div>`;

  // Wire cancel buttons
  container.querySelectorAll('[data-cancel-offer]').forEach(btn => {
    btn.addEventListener('click', () => handleCancelOffer(btn.dataset.cancelOffer, btn));
  });
}

function buildMyOfferCard(offer) {
  const listingThumb = offer.listingImageUrl
    ? `<img src="${escapeHtml(offer.listingImageUrl)}" alt="${escapeHtml(offer.listingTitle || '')}">`
    : `<div class="offer-card-listing-thumb-placeholder">
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" style="width:24px;height:24px;">
           <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
         </svg>
       </div>`;

  const canCancel = offer.status === 'PENDING';

  return `
    <div class="offer-card" id="my-offer-card-${escapeHtml(String(offer.id))}">
      <div class="offer-card-top">
        <div class="offer-card-listing-thumb">${listingThumb}</div>
        <div class="offer-card-listing-info">
          <div class="offer-card-listing-title">${escapeHtml(offer.listingTitle || 'Listing')}</div>
          <a class="offer-card-listing-link" href="../listing/view-listing.html?id=${escapeHtml(String(offer.listingId))}">
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
          <div class="offer-price-row">
            <span class="offer-my-price">${formatPrice(offer.offeredPrice)}</span>
            ${offer.listedPrice ? `<span class="offer-listed-price">${formatPrice(offer.listedPrice)} listed</span>` : ''}
          </div>
          ${offer.message
            ? `<div class="offer-message-preview">"${escapeHtml(offer.message)}"</div>`
            : ''}
          <div class="offer-card-time">Sent ${formatRelativeTime(offer.createdAt)}</div>
        </div>
        <div class="offer-card-actions">
          ${canCancel
            ? `<button class="offer-cancel-btn" data-cancel-offer="${escapeHtml(String(offer.id))}">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                   <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                 </svg>
                 Cancel Offer
               </button>`
            : ''}
          ${offer.status === 'ACCEPTED'
            ? `<span style="font-size:0.78rem;font-weight:700;color:#1a7a40;display:flex;align-items:center;gap:4px;">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" style="width:14px;height:14px;">
                   <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                 </svg>
                 Seller accepted!
               </span>`
            : ''}
        </div>
      </div>
    </div>`;
}

async function handleCancelOffer(offerId, btn) {
  if (!confirm('Cancel this offer?')) return;

  btn.disabled = true;
  btn.textContent = 'Cancelling…';

  try {
    // POST /api/offers/{offerId}/cancel  ← FIXED (was /accept in original)
    await API.post(`/api/offers/${offerId}/cancel`, null, true);

    // Update local state
    const idx = allMyOffers.findIndex(o => String(o.id) === String(offerId));
    if (idx > -1) allMyOffers[idx].status = 'CANCELLED';

    renderFilteredOffers();
    if (typeof showToast === 'function') showToast('Offer cancelled.', 'info');

  } catch (err) {
    btn.disabled = false;
    btn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width:13px;height:13px;">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
      </svg>
      Cancel Offer`;
    const msg = err?.data?.message || err?.message || 'Could not cancel offer. Please try again.';
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
}