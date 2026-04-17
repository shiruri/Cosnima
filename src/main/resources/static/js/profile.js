/* ============================================
   COSNIMA — Profile Page
   Fixed: own listings → view-listing (not public profile)
          no emojis → SVG icons
          settings panel, tab switching
   ============================================ */

let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {

  // Require auth
  if (!API.isLoggedIn()) {
    window.location.href = '../login/login.html';
    return;
  }

  // Load user data
  try {
    currentUser = await API.get('/api/users/me');
    renderProfile(currentUser);
    loadUserListings(currentUser.id);
  } catch (err) {
    showPageError('Could not load your profile. Please try again.');
    return;
  }

  // Settings panel
  const settingsBtn  = document.getElementById('settings-btn');
  const settingsPanel= document.getElementById('settings-panel');
  const closeBtn     = settingsPanel?.querySelector('.panel-close-btn');
  const overlay      = document.getElementById('mobile-overlay');

  function openSettings() {
    settingsPanel?.classList.add('open');
    if (overlay) { overlay.classList.add('active'); overlay.style.zIndex = '498'; }
    prefillSettings(currentUser);
    document.body.style.overflow = 'hidden';
  }
  function closeSettings() {
    settingsPanel?.classList.remove('open');
    overlay?.classList.remove('active');
    document.body.style.overflow = '';
  }

  settingsBtn?.addEventListener('click', openSettings);
  closeBtn?.addEventListener('click', closeSettings);
  overlay?.addEventListener('click', () => {
    closeSettings();
    // also close mobile nav if open
    document.getElementById('mobile-nav')?.classList.remove('open');
    hamburger?.setAttribute('aria-expanded', 'false');
  });

  // Settings form
  const settingsForm = document.getElementById('settings-form');
  settingsForm?.addEventListener('submit', handleSettingsSave);

  // Avatar file preview
  const fileInput = document.getElementById('settings-avatar-file');
  fileInput?.addEventListener('change', previewAvatar);

  // Nav
renderNavAuth(document.getElementById('nav-auth'));
renderNavAuth(document.getElementById('mobile-auth'));

// and replace this:
document.getElementById('mobile-nav')?.classList.remove('open');
hamburger?.setAttribute('aria-expanded', 'false');

// with this:
document.getElementById('mobile-nav')?.classList.remove('open');
document.getElementById('hamburger')?.setAttribute('aria-expanded', 'false'); 
  // Tabs
  document.querySelectorAll('.profile-tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

});

/* ── Render profile ── */
function renderProfile(user) {
  const usernameEl = document.getElementById('profile-username');
  const bioEl      = document.getElementById('profile-bio');
  const avatarEl   = document.getElementById('profile-avatar');
  const listingCountEl = document.getElementById('stat-listings');
  const ratingEl   = document.getElementById('stat-rating');

  if (usernameEl) usernameEl.textContent = user.username || 'Anonymous';
  if (bioEl)      bioEl.textContent      = user.bio || '';

  // Avatar
  if (avatarEl) {
    if (user.avatarUrl) {
      avatarEl.innerHTML = `<img src="${user.avatarUrl}" alt="${escapeHtml(user.username)}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
    } else {
      const initial = (user.username || 'U').charAt(0).toUpperCase();
      avatarEl.innerHTML = `<div class="profile-avatar-placeholder">${initial}</div>`;
    }
  }

  // Stats
  if (listingCountEl) listingCountEl.textContent = user.listingCount ?? 0;
  if (ratingEl)       ratingEl.textContent       = user.ratingStars != null
    ? Number(user.ratingStars).toFixed(1)
    : '—';
}

/* ── Load user's listings → cards link to VIEW-LISTING ── */
async function loadUserListings(userId) {
  const container = document.getElementById('profile-listings');
  if (!container) return;

  container.innerHTML = `
    <div class="skeleton-card"><div class="skeleton-thumb"></div><div class="skeleton-body"><div class="skeleton-line medium"></div><div class="skeleton-line short"></div></div></div>
    <div class="skeleton-card"><div class="skeleton-thumb"></div><div class="skeleton-body"><div class="skeleton-line medium"></div><div class="skeleton-line short"></div></div></div>
  `;

  try {
    const listings = await API.get(`/api/users/${userId}/listings`);
    const activeListings = (listings || []).filter(l => l.status !== 'ARCHIVED');
    if (!activeListings.length) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
          </div>
          <h3>No listings yet</h3>
          <p>Create your first listing to start selling or renting.</p>
          <a href="../listing/create-listing.html" class="btn btn-primary" style="margin-top:var(--space-md)">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            Create Listing
          </a>
        </div>`;
      return;
    }

    container.innerHTML = activeListings.map(listing => buildProfileListingCard(listing)).join('');

    // Cards click → go to view-listing (OWN listing, so show owner controls)
    container.querySelectorAll('.listing-card').forEach(card => {
      card.addEventListener('click', e => {
        if (e.target.closest('.card-action-btn')) return;
        const id = card.dataset.id;
        if (id) navigateTo(`../listing/view-listing.html?id=${id}`);
      });
    });

  } catch (err) {
    container.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><h3>Could not load listings</h3><p>Please refresh the page.</p></div>`;
  }
}

/* ── Profile listing card (owner view, shows status, edit btn) ── */
function buildProfileListingCard(listing) {
  const isRent    = listing.type === 'RENT';
  const typeBadge = isRent
    ? '<span class="badge badge-rent">Rent</span>'
    : '<span class="badge badge-sell">Sale</span>';

  const price = listing.price != null
    ? `&#8369;${Number(listing.price).toLocaleString('en-PH')}`
    : '&mdash;';

  const status = listing.status || 'AVAILABLE';
  const statusClass = `status-${status.toLowerCase()}`;
  const statusLabel = status.charAt(0) + status.slice(1).toLowerCase();

  let primaryImage = null;
  if (listing.images?.length > 0) {
    const first = listing.images[0];
    primaryImage = typeof first === 'string' ? first : first?.imageUrl;
  }

  const imgHtml = primaryImage
    ? `<img src="${primaryImage}" alt="${escapeHtml(listing.title || 'Listing')}" loading="lazy">`
    : `<div class="card-thumb-placeholder">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
      </div>`;

  // Active indicator
  const activePip = listing.isActive
    ? `
       
       `
    : `
       
       `;

  return `
    <article class="listing-card" data-id="${listing.id}" role="listitem" tabindex="0">
      <div class="card-thumb">
        ${imgHtml}
        <div class="card-badges">${typeBadge}</div>
        <!-- View listing (edit is available there) -->
        <a class="card-action-btn"
           href="../listing/view-listing.html?id=${listing.id}"
           onclick="event.stopPropagation()"
           aria-label="View listing"
           style="
             position:absolute;bottom:var(--space-sm);right:var(--space-sm);
             width:32px;height:32px;border-radius:50%;
             background:rgba(255,255,255,0.92);backdrop-filter:blur(8px);
             display:flex;align-items:center;justify-content:center;
             border:2px solid var(--border);transition:all 0.2s;
             color:var(--ink-muted);
           "
           onmouseover="this.style.borderColor='var(--accent)';this.style.color='var(--accent)'"
           onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--ink-muted)'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
        </a>
      </div>
      <div class="card-body">
        <h3 class="card-name">${escapeHtml(listing.title || 'Untitled')}</h3>
        <div style="display:flex;align-items:center;gap:var(--space-sm);margin-bottom:var(--space-xs);flex-wrap:wrap;">
          <span class="status-badge ${statusClass}">${statusLabel}</span>
          ${activePip}
        </div>
        <div class="card-foot">
          <div class="card-price">${price}</div>
          <span style="font-size:0.72rem;color:var(--ink-faint);">
            ${listing.viewCount ?? 0} views
          </span>
        </div>
      </div>
    </article>
  `;
}

/* ── Tab switching ── */
let offersLoaded = false;

function switchTab(tab) {
  document.querySelectorAll('.profile-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('active', c.id === `${tab}-content`));
  
  if (tab === 'offers' && !offersLoaded) {
    loadProfileOffers();
    offersLoaded = true;
  }
}

async function loadProfileOffers() {
  const container = document.getElementById('offers-content');
  if (!container) return;
  
  container.innerHTML = '<div style="text-align:center;padding:var(--space-xl);color:var(--ink-muted);">Loading offers...</div>';
  
  try {
    const offers = await API.get('/api/offers/mine', true);
    const offersArr = Array.isArray(offers) ? offers : [];
    
    if (!offersArr.length) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
          </div>
          <h3>No offers yet</h3>
          <p>You haven't made or received any offers.</p>
          <a href="../offers/offers.html" class="btn btn-primary" style="margin-top:var(--space-md)">Go to Offers</a>
        </div>`;
      return;
    }
    
    container.innerHTML = `
      <div class="offers-grid" style="display:flex;flex-direction:column;gap:var(--space-md);">
        ${offersArr.map(offer => `
          <div class="offer-row" style="background:var(--card);border:2px solid var(--border);border-radius:var(--radius-lg);padding:var(--space-lg);display:flex;gap:var(--space-md);align-items:center;">
            <img src="${offer.listingImageUrl || ''}" alt="" style="width:80px;height:80px;object-fit:cover;border-radius:var(--radius);" onerror="this.style.display='none'">
            <div style="flex:1;">
              <h4 style="margin:0 0 4px;font-size:1rem;">${escapeHtml(offer.listingTitle || 'Listing')}</h4>
              <p style="margin:0;color:var(--accent);font-weight:700;">₱${Number(offer.offeredPrice || 0).toLocaleString()}</p>
              <span class="status-badge ${offer.status === 'PENDING' ? 'status-available' : offer.status === 'ACCEPTED' ? 'status-available' : 'status-sold'}" style="font-size:0.7rem;margin-top:6px;display:inline-block;">${offer.status || 'PENDING'}</span>
            </div>
            <a href="../listing/view-listing.html?id=${offer.listingId}" class="btn btn-outline" style="padding:0.5rem 1rem;font-size:0.8rem;">View</a>
          </div>
        `).join('')}
      </div>`;
  } catch (err) {
    container.innerHTML = '<div class="empty-state"><h3>Could not load offers</h3><p>Please try again later.</p></div>';
  }
}

/* ── Prefill settings form ── */
function prefillSettings(user) {
  const nameEl   = document.getElementById('settings-name');
  const bioEl    = document.getElementById('settings-bio');
  const previewEl= document.getElementById('settings-avatar-preview');

  if (nameEl) nameEl.value = user.username || '';
  if (bioEl)  bioEl.value  = user.bio || '';

  if (previewEl && user.avatarUrl) {
    previewEl.innerHTML = `<img src="${user.avatarUrl}" alt="Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
  }
}

/* ── Avatar preview ── */
function previewAvatar() {
  const fileInput = document.getElementById('settings-avatar-file');
  const preview   = document.getElementById('settings-avatar-preview');
  if (!fileInput?.files[0] || !preview) return;

  const reader = new FileReader();
  reader.onload = e => {
    preview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
  };
  reader.readAsDataURL(fileInput.files[0]);
}

/* ── Save settings ── */
async function handleSettingsSave(e) {
  e.preventDefault();

  const btn    = document.getElementById('settings-save-btn');
  const banner = document.getElementById('settings-banner');

  const nameVal      = document.getElementById('settings-name')?.value.trim();
  const bioVal       = document.getElementById('settings-bio')?.value.trim();
  const currentPw    = document.getElementById('settings-current-pw')?.value;
  const newPw        = document.getElementById('settings-new-pw')?.value;
  const confirmPw    = document.getElementById('settings-confirm-pw')?.value;
  const avatarFile   = document.getElementById('settings-avatar-file')?.files[0];

  // Validate passwords if changing
  if (newPw) {
    if (!currentPw) {
      showSettingsBanner('Enter your current password to set a new one.', 'error');
      return;
    }
    if (newPw !== confirmPw) {
      showSettingsBanner('New passwords do not match.', 'error');
      return;
    }
    if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(newPw)) {
      showSettingsBanner('Password must be min 8 characters with 1 uppercase and 1 number.', 'error');
      return;
    }
  }

  // Set loading
  const btnText   = btn?.querySelector('.btn-text');
  const btnLoader = btn?.querySelector('.btn-loader');
  if (btn) btn.disabled = true;
  if (btnText)   btnText.style.display   = 'none';
  if (btnLoader) btnLoader.style.display = 'flex';

  try {
    const formData = new FormData();

const valueObj = {
  username: nameVal,
  bio: bioVal
};

if (newPw) {
  valueObj.currentPassword = currentPw;
  valueObj.newPassword = newPw;
}

formData.append(
  'value',
  new Blob(
    [JSON.stringify(valueObj)],
    { type: 'application/json' }
  )
);

if (avatarFile) {
  formData.append('file', avatarFile);
}

const updated = await API.patchForm('/api/users/me/update', formData);

  } catch (err) {
    const msg = err?.message || 'Failed to save. Please try again.';
    showSettingsBanner(msg, 'error');
  } finally {
    if (btn) btn.disabled = false;
    if (btnText)   btnText.style.display   = 'inline';
    if (btnLoader) btnLoader.style.display = 'none';
  }
}

/* ── Banner helpers ── */
function showSettingsBanner(msg, type = 'error') {
  const el = document.getElementById('settings-banner');
  if (!el) return;

  el.textContent = msg;
  el.className = `settings-banner settings-banner--${type}`;

  // Auto-dismiss success
  if (type === 'success') {
    setTimeout(() => { el.className = 'settings-banner'; }, 4000);
  }
}

function showPageError(msg) {
  const el = document.getElementById('page-error');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}


/* ── Logout ── */
async function logout() {
  try {
    await API.post('/api/auth/logout', null, true);
  } catch {} finally {
    API.clearSession();
    window.location.href = '../index.html';
  }
}

/* ── Navigate ── */
function navigateTo(url) {
  document.body.classList.add('fade-out');
  setTimeout(() => { window.location.href = url; }, 260);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}