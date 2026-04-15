/* ============================================
   COSNIMA — Listing Actions: Message Seller + Request Rent
   Phase 1 - replaces offers with messaging + rental
   ============================================ */

/**
 * Renders action buttons in the listing's action area.
 * Call after listing data loaded, only for non-owners.
 * @param {object} listing  - listing response
 * @param {Element} container - #listing-action-area element
 */
function renderListingActions(listing, container) {
  if (!container) return;
  container.innerHTML = '';

  const isLoggedIn = API.isLoggedIn();
  const isRent = listing.type === 'RENT';
  const status = listing.status || 'AVAILABLE';
  const isUnavailable = status === 'SOLD' || status === 'RENTED' || status === 'ARCHIVED';

  if (!isLoggedIn) {
    // Remove any existing modal first
    document.getElementById('auth-gate-modal')?.remove();
    
    // Create modal instead of simple link
    const modal = document.createElement('div');
    modal.id = 'auth-gate-modal';
    modal.style.cssText = `
      position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);
      display:flex;align-items:center;justify-content:center;z-index:9999;
      animation:fadeIn 0.2s ease;
    `;
    modal.innerHTML = `
      <div style="
        background:var(--card);border:2px solid var(--border);border-radius:var(--radius-xl);
        padding:var(--space-2xl);max-width:360px;width:90%;text-align:center;
        box-shadow:0 20px 40px rgba(0,0,0,0.15);animation:slideUp 0.3s ease;
      ">
        <div style="
          width:64px;height:64px;margin:0 auto var(--space-lg);
          background:linear-gradient(135deg, var(--accent), #f8bbd0);
          border-radius:50%;display:flex;align-items:center;justify-content:center;
        ">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="2" style="width:32px;height:32px;">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
        </div>
        <h3 style="margin:0 0 var(--space-sm);color:var(--ink);font-size:1.25rem;">Join Cosnima</h3>
        <p style="margin:0 0 var(--space-lg);color:var(--ink-muted);font-size:0.9rem;line-height:1.5;">
          Sign in to message the seller, make offers, and save your favorites!
        </p>
        <div style="display:flex;flex-direction:column;gap:var(--space-sm);">
          <a href="../login/login.html" class="btn btn-primary" style="justify-content:center;text-decoration:none;">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
            </svg>
            Sign In
          </a>
          <a href="../signup/register.html" class="btn btn-outline" style="justify-content:center;text-decoration:none;border-color:var(--accent);color:var(--accent);">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;">
              <path stroke-linecap="round" stroke-linejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
            </svg>
            Create Account
          </a>
        </div>
        <button onclick="document.getElementById('auth-gate-modal').remove()" style="
          margin-top:var(--space-md);background:none;border:none;color:var(--ink-faint);
          font-size:0.85rem;cursor:pointer;padding:var(--space-xs);
        ">Maybe later</button>
      </div>
      <style>
        @keyframes slideUp { from { opacity:0;transform:translateY(20px); } to { opacity:1;transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
      </style>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    return;
  }

  let btnsHtml = `
    <div class="listing-action-btns" style="display:flex;flex-direction:column;gap:var(--space-sm);margin-top:var(--space-md);">`;

  if (isUnavailable) {
    btnsHtml += `
      <button class="btn" disabled style="width:100%;justify-content:center;background:var(--bg-alt);color:var(--ink-faint);border-color:var(--border);cursor:not-allowed;">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;">
          <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
        </svg>
        <span class="btn-text">This item is no longer available</span>
      </button>`;
  } else {
    btnsHtml += `
      <button class="btn btn-primary" id="message-seller-btn" style="width:100%;justify-content:center;">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
        <span class="btn-text">Message Seller</span>
        <span class="btn-loader" style="display:none;width:14px;height:14px;border:2px solid rgba(255,255,255,0.5);border-top-color:white;border-radius:50%;animation:spin 0.6s linear infinite;"></span>
      </button>`;
    if (isRent) {
      btnsHtml += `
        <button class="btn btn-beaver" id="rent-btn" style="width:100%;justify-content:center;">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          <span class="btn-text">Rent Now</span>
        </button>`;
    }
  }

  btnsHtml += `</div>`;

  container.innerHTML = btnsHtml;

  if (isUnavailable) return;

  // Message seller
  document.getElementById('message-seller-btn')?.addEventListener('click', () => {
    handleMessageSeller(listing);
  });

  // Rent button - redirect to chat
  if (isRent) {
    document.getElementById('rent-btn')?.addEventListener('click', () => {
      redirectToChatWithRental(listing);
    });
  }
}

/* ── Message Seller ── */
async function handleMessageSeller(listing) {
  const btn = document.getElementById('message-seller-btn');
  const btnText  = btn?.querySelector('.btn-text');
  const btnLoader = btn?.querySelector('.btn-loader');

  if (btn) btn.disabled = true;
  if (btnText)   btnText.style.display   = 'none';
  if (btnLoader) btnLoader.style.display = 'inline-block';

  try {
    const currentUser = API.getUser();
    if (!currentUser?.id) throw new Error('Not logged in');

    const conversation = await API.post('/api/conversations', {
      listingId: listing.id,
      buyerId:   String(currentUser.id),
      sellerId:  String(listing.sellerId),
    }, true);

    if (!conversation?.conversationId) throw new Error('Could not start conversation');

    showToast('Opening conversation…', 'success', 1500);
    setTimeout(() => {
      window.location.href = `../messages/messages.html?conversation=${conversation.conversationId}`;
    }, 600);

  } catch (err) {
    const msg = err?.data?.message || err?.message || 'Could not start conversation.';
    showToast(msg, 'error');
    if (btn) btn.disabled = false;
    if (btnText)   btnText.style.display   = 'inline';
    if (btnLoader) btnLoader.style.display = 'none';
  }
}

/* ── Rent Modal ── */
let _rentListing = null;

function openRentModal(listing) {
  _rentListing = listing;
  const today = getTodayStr();
  
  // Parse price notes and min days from description
  let priceNotes = [];
  let minDays = null;
  
  if (listing.description) {
    const lines = listing.description.split('\n');
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
        const note = trimmed.replace(/^[•\-]\s*/, '');
        if (note.includes('=') || note.toLowerCase().includes('day')) {
          priceNotes.push(note);
        }
      }
      const minMatch = trimmed.match(/minimum\s*rental:\s*(\d+)\s*day/i);
      if (minMatch) {
        minDays = parseInt(minMatch[1]);
      }
    });
  }
  
  if (listing.priceNotes && listing.priceNotes.length) {
    priceNotes = listing.priceNotes;
  }
  
  const hasPriceNotes = priceNotes && priceNotes.length > 0;
  const dailyPrice = listing.price || listing.dailyPrice || listing.rentalPrice || 0;
  
  let priceOptionsHtml = '';
  if (hasPriceNotes) {
    priceOptionsHtml = `
      <div class="rental-field" id="rent-pricing-field">
        <label>Select Pricing Option *</label>
        <select id="rent-pricing-select" style="width:100%;padding:0.75rem;border:1.5px solid var(--border);border-radius:var(--radius);font-size:0.9rem;color:var(--ink);background:var(--bg);outline:none;">
          <option value="">Choose a pricing option...</option>
          <option value="daily">Daily Rate - ₱${Number(dailyPrice).toLocaleString()}/day</option>
          ${priceNotes.map(note => `<option value="${escH(note)}">${escH(note)}</option>`).join('')}
        </select>
        <div class="rental-field-error">Please select a pricing option.</div>
      </div>`;
  } else {
    priceOptionsHtml = `<input type="hidden" id="rent-pricing-select" value="daily">`;
  }

  // Remove existing if any
  document.getElementById('rent-modal-backdrop')?.remove();

  const backdrop = document.createElement('div');
  backdrop.id = 'rent-modal-backdrop';
  backdrop.className = 'rental-modal-backdrop';
  backdrop.innerHTML = `
    <div class="rental-modal" role="dialog" aria-modal="true" aria-label="Request Rental">
      <div class="rental-modal-header">
        <div>
          <p style="font-size:0.65rem;font-weight:900;letter-spacing:0.12em;text-transform:uppercase;color:var(--beaver);margin-bottom:4px;">Request Rental</p>
          <h2>${escH(listing.title || 'Listing')}</h2>
        </div>
        <button onclick="closeRentModal()" style="width:34px;height:34px;border-radius:var(--radius);display:flex;align-items:center;justify-content:center;color:var(--ink-muted);border:1.5px solid var(--border);background:var(--card);cursor:pointer;" aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="rental-modal-body">
        <div id="rent-modal-status" style="display:none;padding:0.75rem 1rem;border-radius:var(--radius);font-size:0.84rem;font-weight:700;margin-bottom:var(--space-md);"></div>

        ${priceOptionsHtml}

        <div class="rental-field" id="rent-start-field">
          <label>Start Date *${minDays ? ` (Min: ${minDays} days)` : ''}</label>
          <input type="date" id="rent-start-date" min="${today}">
          <div class="rental-field-error">Please select a valid start date (today or later).</div>
        </div>

        <div class="rental-field" id="rent-end-field">
          <label>End Date *</label>
          <input type="date" id="rent-end-date" min="${today}">
          <div class="rental-field-error">End date must be after start date.</div>
        </div>

        <div class="rental-field" id="rent-deposit-field">
          <label>Deposit Amount (₱)</label>
          <input type="number" id="rent-deposit" placeholder="0" min="0" step="1">
          <div class="rental-field-error">Please enter a valid deposit amount.</div>
        </div>

        <div class="rental-price-summary" id="rent-price-summary" style="display:none;">
          <div class="rental-price-row-item">
            <span class="label">Daily Rate</span>
            <span class="value" id="rent-daily-rate">—</span>
          </div>
          <div class="rental-price-row-item">
            <span class="label">Duration</span>
            <span class="value" id="rent-duration">—</span>
          </div>
          <div class="rental-price-row-item">
            <span class="label">Deposit</span>
            <span class="value" id="rent-deposit-preview">₱0</span>
          </div>
          <div class="rental-price-row-item">
            <span class="label" style="font-weight:800;color:var(--ink);">Estimated Total</span>
            <span class="value rental-price-total" id="rent-total-price">—</span>
          </div>
        </div>
      </div>
      <div class="rental-modal-footer">
        <button class="btn btn-ghost" onclick="closeRentModal()">Cancel</button>
        <button class="btn btn-beaver" id="rent-submit-btn" onclick="submitRentRequest()">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          <span class="btn-text">Send Request</span>
          <span class="btn-loader" style="display:none;width:14px;height:14px;border:2px solid rgba(255,255,255,0.5);border-top-color:white;border-radius:50%;animation:spin 0.6s linear infinite;"></span>
        </button>
      </div>
    </div>`;

  document.body.appendChild(backdrop);
  requestAnimationFrame(() => backdrop.classList.add('open'));

  // Wire date inputs for live price calculation
  const startInput = document.getElementById('rent-start-date');
  const endInput   = document.getElementById('rent-end-date');
  const depositInput = document.getElementById('rent-deposit');

  const recalc = () => calculateRentalPrice(listing.price, listing.priceNotes);
  startInput?.addEventListener('change', () => { updateEndDateMin(); recalc(); });
  endInput?.addEventListener('change', recalc);
  depositInput?.addEventListener('input', recalc);

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeRentModal();
  });
}

function closeRentModal() {
  const bd = document.getElementById('rent-modal-backdrop');
  if (!bd) return;
  bd.classList.remove('open');
  setTimeout(() => bd.remove(), 300);
  _rentListing = null;
}

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

function updateEndDateMin() {
  const start = document.getElementById('rent-start-date')?.value;
  const endInput = document.getElementById('rent-end-date');
  if (start && endInput) {
    const next = new Date(start);
    next.setDate(next.getDate() + 1);
    endInput.min = next.toISOString().split('T')[0];
    if (endInput.value && endInput.value <= start) endInput.value = '';
  }
}

function calculateRentalPrice(pricePerDay, priceNotes) {
  const start   = document.getElementById('rent-start-date')?.value;
  const end     = document.getElementById('rent-end-date')?.value;
  const deposit = parseFloat(document.getElementById('rent-deposit')?.value) || 0;
  const summary = document.getElementById('rent-price-summary');

  if (!start || !end) { if (summary) summary.style.display = 'none'; return; }

  const startDate = new Date(start);
  const endDate   = new Date(end);
  const days = Math.max(1, Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)));

  const daily = parseFloat(pricePerDay) || 0;
  let total = daily * days;
  let noteDisplay = '';

  if (priceNotes && priceNotes.length && days > 1) {
    priceNotes.forEach(note => {
      const match = note.match(/(\d+)\s*(?:days?|d)\s*(?:=|for)\s*₱?(\d+)/i);
      if (match) {
        const noteDays = parseInt(match[1]);
        const notePrice = parseInt(match[2]);
        if (noteDays === days) {
          total = notePrice;
          noteDisplay = note;
        }
      }
    });
  }

  if (summary) summary.style.display = 'block';
  const fmt = (n) => '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  const el = (id) => document.getElementById(id);
  if (el('rent-daily-rate'))      el('rent-daily-rate').textContent      = fmt(daily) + ' / day';
  if (el('rent-duration'))        el('rent-duration').textContent        = `${days} day${days !== 1 ? 's' : ''}`;
  if (el('rent-deposit-preview')) el('rent-deposit-preview').textContent = fmt(deposit);
  if (el('rent-total-price'))     el('rent-total-price').textContent     = fmt(total) + (noteDisplay ? ` (${noteDisplay})` : '');
}

async function submitRentRequest() {
  const listing = _rentListing;
  if (!listing) return;

  const start   = document.getElementById('rent-start-date')?.value;
  const end     = document.getElementById('rent-end-date')?.value;
  const deposit = parseFloat(document.getElementById('rent-deposit')?.value) || 0;
  const pricingSelect = document.getElementById('rent-pricing-select');
  const pricingValue = pricingSelect?.value || '';

  // Validate
  let valid = true;
  const today = getTodayStr();

  const startField   = document.getElementById('rent-start-field');
  const endField     = document.getElementById('rent-end-field');
  const depositField = document.getElementById('rent-deposit-field');
  const pricingField = document.getElementById('rent-pricing-field');

  [startField, endField, depositField, pricingField].forEach(f => f?.classList.remove('has-error'));

  if (pricingField && !pricingValue) { pricingField.classList.add('has-error'); valid = false; }
  if (!start) { startField?.classList.add('has-error'); valid = false; }
  if (!end)   { endField?.classList.add('has-error'); valid = false; }
  if (start && end && end <= start) {
    endField?.classList.add('has-error');
    endField.querySelector('.rental-field-error').textContent = 'End date must be after start date.';
    valid = false;
  }
  if (start && start < today) {
    startField?.classList.add('has-error');
    startField.querySelector('.rental-field-error').textContent = 'Start date cannot be in the past.';
    valid = false;
  }
  
  if (!valid) return;

  // Check availability
  try {
    const avail = await API.get(`/api/listings/${listing.id}/availability?startDate=${start}&endDate=${end}`, false);
    if (avail === false) {
      showRentModalStatus('These dates are not available. Please choose different dates.', 'error');
      return;
    }
  } catch {}

  const btn = document.getElementById('rent-submit-btn');
  const btnText   = btn?.querySelector('.btn-text');
  const btnLoader = btn?.querySelector('.btn-loader');
  if (btn) btn.disabled = true;
  if (btnText)   btnText.style.display   = 'none';
  if (btnLoader) btnLoader.style.display = 'inline-block';

  try {
    await API.post('/api/rental', {
      listingId: listing.id,
      startDate: start,
      endDate:   end,
      deposit:   deposit || null,
    }, true);

    showToast('Rental request sent! 🎉', 'success');
    closeRentModal();

  } catch (err) {
    const msg = err?.data?.message || err?.message || 'Could not submit rental request.';
    showRentModalStatus(msg, 'error');
    if (btn) btn.disabled = false;
    if (btnText)   btnText.style.display   = 'inline';
    if (btnLoader) btnLoader.style.display = 'none';
  }
}

function showRentModalStatus(msg, type) {
  const el = document.getElementById('rent-modal-status');
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
  if (type === 'error') {
    el.style.background = 'rgba(192,57,43,0.08)';
    el.style.border = '1.5px solid rgba(192,57,43,0.2)';
    el.style.color = 'var(--error)';
  } else {
    el.style.background = 'rgba(39,174,96,0.08)';
    el.style.border = '1.5px solid rgba(39,174,96,0.25)';
    el.style.color = '#1a7a40';
  }
}

function escH(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ── Redirect to Chat with Rental Intent ── */
async function redirectToChatWithRental(listing) {
  // Store listing in sessionStorage so messages page can use it on reload
  sessionStorage.setItem('pendingRentalListing', JSON.stringify(listing));
  
  try {
    const currentUser = API.getUser();
    if (!currentUser?.id) throw new Error('Not logged in');

    const conversation = await API.post('/api/conversations', {
      listingId: listing.id,
      buyerId:   String(currentUser.id),
      sellerId:  String(listing.sellerId),
    }, true);

    if (!conversation?.conversationId) throw new Error('Could not start conversation');

    showToast('Opening chat to discuss rental…', 'success', 1500);
    setTimeout(() => {
      window.location.href = `../messages/messages.html?conversation=${conversation.conversationId}&action=rent&listingId=${listing.id}`;
    }, 600);

  } catch (err) {
    const msg = err?.data?.message || err?.message || 'Could not start conversation.';
    showToast(msg, 'error');
  }
}