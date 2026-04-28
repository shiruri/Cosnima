/* ============================================
   COSNIMA — Home Page Logic
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // Loading screen
  const loadingScreen = document.getElementById('loading-screen');
  const hideLoader = () => {
    if (!loadingScreen) return;
    loadingScreen.style.opacity = '0';
    setTimeout(() => loadingScreen.remove(), 400);
  };
  const loaderMin = new Promise(res => setTimeout(res, 900));
  const pageReady = new Promise(res => {
    if (document.readyState === 'complete') res();
    else window.addEventListener('load', res, { once: true });
  });
  Promise.all([loaderMin, pageReady]).then(hideLoader);

  loadFeaturedListings();
  loadStats();
  loadTagPills();

  // Hero search — enter key
  const searchInput = document.getElementById('hero-search-input');
  if (searchInput) {
    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') handleSearch();
    });
  }

});

/* ── Tag Pills (from API) ── */
async function loadTagPills() {
  const rail = document.getElementById('series-pills');
  if (!rail) return;

  try {
    const tags = await API.get('/api/tags', true);
    if (!Array.isArray(tags) || tags.length === 0) return;

    rail.innerHTML = `<button class="pill active" data-tag="">All</button>`;
    tags.slice(0, 14).forEach(tag => {
      const btn = document.createElement('button');
      btn.className = 'pill';
      btn.dataset.tag = tag.name;
      btn.textContent = tag.name;
      rail.appendChild(btn);
    });

    rail.classList.add('visible');

    rail.querySelectorAll('.pill').forEach(pill => {
      pill.addEventListener('click', () => {
        rail.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        loadFeaturedListings({ tag: pill.dataset.tag || '' });
      });
    });
  } catch {
    // silently skip — pills are optional
  }
}

/* ── Featured listings ── */
async function loadFeaturedListings(filters = {}) {
  const container = document.getElementById('listings-container');
  const errorEl   = document.getElementById('listings-error');
  if (!container) return;

  // Show skeletons
  container.innerHTML = Array(6).fill(`
    <div class="skeleton-card" aria-hidden="true">
      <div class="skeleton-thumb"></div>
      <div class="skeleton-body">
        <div class="skeleton-line medium"></div>
        <div class="skeleton-line short"></div>
      </div>
    </div>
  `).join('');
  if (errorEl) errorEl.style.display = 'none';

  // Build query string from filters
  const params = new URLSearchParams({
    page: 0,
    pageSize: 8,
    sortBy: 'createdAt',
    sortDir: 'desc',
    isActive: true,
    status: 'AVAILABLE',
  });
  if (filters.tag)     params.set('tag', filters.tag);
  if (filters.keyword) params.set('keyword', filters.keyword);

  try {
    const data = await API.get(`/api/listings?${params.toString()}`, false);
    const listings = Array.isArray(data) ? data : (data?.content || data?.listings || []);

    if (!listings.length) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          ${svgIcon('package')}
          <h3>No listings yet</h3>
          <p>Be the first to list a cosplay on Cosnima.</p>
          <a href="listing/create-listing.html" class="btn btn-primary" style="margin-top:var(--space-md)">Create First Listing</a>
        </div>`;
      return;
    }

    container.innerHTML = listings.map(buildListingCard).join('');
    container.classList.add('visible');
    initWishButtons();

    container.querySelectorAll('.listing-card').forEach(card => {
      card.addEventListener('click', e => {
        
        const id = card.dataset.id;
        if (id) redirectTo(`listing/view-listing.html?id=${id}`);
      });
    });

} catch {/* silent */}
  
}

/* ── Stats ── */
async function loadStats() {
  const CACHE_KEY      = 'cosnimaStats';
  const CACHE_TIME_KEY = 'cosnimaStatsTime';
  const ONE_HOUR       = 60 * 60 * 1000;
  const now            = Date.now();

  const cached     = localStorage.getItem(CACHE_KEY);
  const cachedTime = localStorage.getItem(CACHE_TIME_KEY);

  if (cached && cachedTime && (now - parseInt(cachedTime, 10)) < ONE_HOUR) {
    try { updateStatsDisplay(JSON.parse(cached)); return; } catch {}
  }

  try {
    const data = await API.get('/api/listings/stats', false);
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(CACHE_TIME_KEY, now.toString());
    updateStatsDisplay(data);
  } catch { /* silently skip */ }
}

function updateStatsDisplay(data) {
  const listEl   = document.getElementById('stat-listings');
  const sellerEl = document.getElementById('stat-sellers');
  if (listEl   && data?.listings != null) listEl.textContent   = formatNum(data.listings);
  if (sellerEl && data?.sellers  != null) sellerEl.textContent = formatNum(data.sellers);
}

function formatNum(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

/* ── Build listing card HTML — NO EMOJIS ── */
function buildListingCard(listing) {
  const isRent    = listing.type === 'RENT';
  const typeBadge = isRent
    ? '<span class="badge badge-rent">Rent</span>'
    : '<span class="badge badge-sell">Sale</span>';

  const priceNote = isRent ? '<span class="price-note">/ event</span>' : '';
  const price     = listing.price != null ? `&#8369;${Number(listing.price).toLocaleString('en-PH')}` : '&mdash;';

  const sellerName = listing.sellerUsername || listing.seller?.username || 'Seller';
  const initial    = sellerName.charAt(0).toUpperCase();
  const series     = listing.seriesName || listing.series || '';

  // Resolve primary image
  let primaryImage = null;
  if (listing.imageUrl) {
    primaryImage = listing.imageUrl;
  } else if (listing.images && listing.images.length > 0) {
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

  const isWished = false;

  // Check if viewing own listing — seller avatar links to public profile
  // The card click goes to the listing page itself
  const currentUser = API.getUser();
  const isOwn = currentUser && String(currentUser.id) === String(listing.sellerId || listing.seller?.id);

  // Seller avatar: clicking it goes to the seller's public profile page
  // (own profile goes to /profile/profile.html, others go to /profile/public-profile.html)
  const profileUrl = isOwn
    ? '../profile/profile.html'
    : `../profile/public-profile.html?id=${listing.sellerId || listing.seller?.id}`;

  return `
    <article class="listing-card" data-id="${listing.id}" role="listitem" tabindex="0" aria-label="${escapeHtml(listing.title || 'Listing')}">
      <div class="card-thumb">
        ${imgHtml}
        <div class="card-badges">${typeBadge}</div>
        
      </div>
      <div class="card-body">
        ${series ? `<p class="card-series">${escapeHtml(series)}</p>` : ''}
        <h3 class="card-name">${escapeHtml(listing.title || 'Untitled')}</h3>
        <div class="card-foot">
          <div>
            <div class="card-price">${price}</div>
            ${priceNote}
          </div>
          <a class="card-seller" href="${profileUrl}" onclick="event.stopPropagation()" aria-label="View ${escapeHtml(sellerName)}'s profile">
            <div class="seller-ava">${initial}</div>
            <span class="seller-n">${escapeHtml(sellerName)}</span>
          </a>
        </div>
      </div>
    </article>
  `;
}

/* ── Wishlist ── */
// Wishlist API calls for home.js
async function isInWishlistHome(id) {
  if (!API.isLoggedIn()) return false;
  try {
    const wishlists = await API.get('/api/wishlists', true);
    if (!Array.isArray(wishlists)) return false;
    return wishlists.some(w => String(w.listingId) === String(id));
  } catch { return false; }
}

async function toggleWishlistHome(id) {
  if (!API.isLoggedIn()) { showToast('Log in to save to your wishlist', 'info'); return false; }
  const isWished = await isInWishlistHome(id);
  try {
    if (isWished) {
      await API.delete(`/api/wishlists/${id}`, true);
      showToast('Removed from wishlist', 'info');
      return false;
    } else {
      await API.post(`/api/wishlists/${id}/wishlist`, null, true);
      showToast('Added to wishlist', 'success');
      return true;
    }
  } catch (err) {
    showToast(err?.data?.message || 'Failed to update wishlist', 'error');
    return isWished;
  }
}



/* ── Search ── */
function handleSearch() {
  const val = document.getElementById('hero-search-input')?.value?.trim();
  if (!val) return;
  document.body.classList.add('fade-out');
  setTimeout(() => {
    window.location.href = `listing/listings.html?keyword=${encodeURIComponent(val)}`;
  }, 260);
}

/* ── SVG icon helper — replaces emoji ── */
function svgIcon(name, size = 48) {
  const icons = {
    package: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.2" style="opacity:0.35"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>`,
    heart:   `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.2" style="opacity:0.35"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>`,
    mask:    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.2" style="opacity:0.35"><path stroke-linecap="round" stroke-linejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
  };
  return `<div class="empty-state-icon">${icons[name] || icons.package}</div>`;
}

/* ── Helpers ── */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

function redirectTo(url) {
  document.body.classList.add('fade-out');
  setTimeout(() => { window.location.href = url; }, 260);
}
