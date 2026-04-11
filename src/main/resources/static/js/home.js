/* ============================================
   COSNIMA — Home Page Logic
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Loading screen ──
  const loadingScreen = document.getElementById('loading-screen');
  const hideLoader = () => {
    if (!loadingScreen) return;
    loadingScreen.style.opacity = '0';
    setTimeout(() => loadingScreen.remove(), 400);
  };
  const loaderMin  = new Promise(res => setTimeout(res, 900));
  const pageReady  = new Promise(res => {
    if (document.readyState === 'complete') res();
    else window.addEventListener('load', res, { once: true });
  });
  Promise.all([loaderMin, pageReady]).then(hideLoader);

  // ── Load everything ──
  loadFeaturedListings();
  loadStats();

  // ── Hero search ──
  const searchInput = document.getElementById('hero-search-input');
  if (searchInput) {
    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') handleSearch();
    });
  }

});

/* ── Featured listings ── */
async function loadFeaturedListings() {
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

  try {
    const data = await API.get('/api/listings?page=0&size=6&sort=newest', false);
    const listings = Array.isArray(data) ? data : (data?.content || data?.listings || []);

    if (errorEl) errorEl.style.display = 'none';

    if (!listings.length) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div style="font-size:4rem;">🦫</div>
          <h3>No listings yet!</h3>
          <p>Be the first to list a cosplay on Cosnima.</p>
          <a href="listing/create-listing.html" class="btn btn-primary" style="margin-top:var(--space-md)">Create First Listing</a>
        </div>`;
      return;
    }

    container.innerHTML = listings.slice(0, 6).map(buildListingCard).join('');
    container.classList.add('visible');

    // Load series pills from listings
    const series = [...new Set(listings.map(l => l.series).filter(Boolean))];
    buildSeriesPills(series);

    // Wishlist buttons
    initWishButtons();

    // Card clicks
    container.querySelectorAll('.listing-card').forEach(card => {
      card.addEventListener('click', e => {
        if (e.target.closest('.card-wish')) return;
        const id = card.dataset.id;
        if (id) redirectTo(`listing/view-listing.html?id=${id}`);
      });
    });

  } catch (err) {
    console.error('Failed to load listings:', err);
    container.innerHTML = '';
    if (errorEl) {
      errorEl.style.display = 'block';
      errorEl.innerHTML = `
        Could not load listings.
        <button onclick="loadFeaturedListings()" style="text-decoration:underline;font-weight:700;color:inherit;margin-left:8px;">Try again</button>
      `;
    }
  }
}

/* ── Stats ── */
async function loadStats() {
  const CACHE_KEY = 'cosnimaStats';
  const CACHE_TIME_KEY = 'cosnimaStatsTime';
  const ONE_HOUR = 60 * 60 * 1000;

  // Try to load from cache
  const cached = localStorage.getItem(CACHE_KEY);
  const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
  const now = Date.now();

  if (cached && cachedTime) {
    const age = now - parseInt(cachedTime, 10);
    if (age < ONE_HOUR) {
      // Use cached data
      try {
        const data = JSON.parse(cached);
        updateStatsDisplay(data);
        return;
      } catch (e) {
        // Invalid cache, proceed to fetch
      }
    }
  }

  // Fetch fresh data
  try {
    const data = await API.get('/api/listings/stats', false);
    // Save to cache
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(CACHE_TIME_KEY, now.toString());
    updateStatsDisplay(data);
  } catch {
    // Silently skip if stats endpoint fails
  }
}

function updateStatsDisplay(data) {
  const listEl   = document.getElementById('stat-listings');
  const sellerEl = document.getElementById('stat-sellers');
  if (listEl && data?.listings != null)  listEl.textContent  = formatNum(data.listings);
  if (sellerEl && data?.sellers != null) sellerEl.textContent = formatNum(data.sellers);
}
function formatNum(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

/* ── Series pills ── */
function buildSeriesPills(seriesList) {
  const rail = document.getElementById('series-pills');
  if (!rail) return;
  rail.innerHTML = `<button class="pill active" data-series="">All Series</button>`;
  seriesList.slice(0, 12).forEach(s => {
    const btn = document.createElement('button');
    btn.className = 'pill';
    btn.dataset.series = s;
    btn.textContent = s;
    rail.appendChild(btn);
  });

  rail.classList.add('visible');

  rail.querySelectorAll('.pill').forEach(pill => {
    pill.addEventListener('click', () => {
      rail.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const series = pill.dataset.series;
      filterHomeListings(series);
    });
  });
}

async function filterHomeListings(series) {
  const container = document.getElementById('listings-container');
  if (!container) return;
  container.innerHTML = Array(3).fill(`
    <div class="skeleton-card"><div class="skeleton-thumb"></div><div class="skeleton-body"><div class="skeleton-line medium"></div><div class="skeleton-line short"></div></div></div>
  `).join('');

  try {
    const url = series
      ? `/api/listings?page=0&size=6&series=${encodeURIComponent(series)}`
      : '/api/listings?page=0&size=6&sort=newest';
    const data = await API.get(url, false);
    const listings = Array.isArray(data) ? data : (data?.content || data?.listings || []);

    if (!listings.length) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div style="font-size:3rem;">🎭</div>
          <h3>No listings for "${series}"</h3>
          <p>Try another series or browse everything.</p>
        </div>`;
      return;
    }

    container.innerHTML = listings.map(buildListingCard).join('');
    container.classList.add('visible');
    initWishButtons();
    container.querySelectorAll('.listing-card').forEach(card => {
      card.addEventListener('click', e => {
        if (e.target.closest('.card-wish')) return;
        const id = card.dataset.id;
        if (id) redirectTo(`listing/view-listing.html?id=${id}`);
      });
    });
  } catch {
    container.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><h3>Could not filter</h3><p>Please try again.</p></div>`;
  }
}

/* ── Build listing card HTML ── */
function buildListingCard(listing) {
  const typeBadge = listing.type === 'RENT'
    ? '<span class="badge badge-rent">Rent</span>'
    : '<span class="badge badge-sell">Sale</span>';

  const priceNote = listing.type === 'RENT' ? '<span class="price-note">/ event</span>' : '';
  const price = listing.price != null ? `₱${Number(listing.price).toLocaleString('en-PH')}` : '—';
  const sellerName = listing.sellerUsername || listing.seller?.username || 'Seller';
  const initial = sellerName.charAt(0).toUpperCase();
  const series = listing.series || '';

let primaryImage = null;
if (listing.imageUrl) {
  primaryImage = listing.imageUrl;
} else if (listing.images && listing.images.length > 0) {
  // images[0] could be a string (if backend returns just URLs) or an object with imageUrl
  const first = listing.images[0];
  primaryImage = typeof first === 'string' ? first : first.imageUrl;
}

const imgHtml = primaryImage
  ? `<img src="${primaryImage}" alt="${escapeHtml(listing.title || 'Listing')}" loading="lazy">`
  : `<div class="card-thumb-placeholder">🌸</div>`;
  const isWished = isInWishlist(listing.id);

  return `
    <article class="listing-card" data-id="${listing.id}" role="listitem" tabindex="0" aria-label="${escapeHtml(listing.title || 'Listing')}">
      <div class="card-thumb">
        ${imgHtml}
        <div class="card-badges">${typeBadge}</div>
        <button class="card-wish ${isWished ? 'active' : ''}" data-id="${listing.id}" aria-label="${isWished ? 'Remove from wishlist' : 'Add to wishlist'}">
          <svg viewBox="0 0 24 24" fill="${isWished ? 'var(--accent)' : 'none'}" stroke="var(--accent)" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
        </button>
      </div>
      <div class="card-body">
        ${series ? `<p class="card-series">${escapeHtml(series)}</p>` : ''}
        <h3 class="card-name">${escapeHtml(listing.title || 'Untitled')}</h3>
        <div class="card-foot">
          <div>
            <div class="card-price">${price}${priceNote}</div>
          </div>
          <div class="card-seller">
            <div class="seller-ava">${initial}</div>
            <span class="seller-n">${escapeHtml(sellerName)}</span>
          </div>
        </div>
      </div>
    </article>
  `;
}

/* ── Wishlist ── */
function getWishlist() {
  try { return JSON.parse(localStorage.getItem('cosnimaWishlist') || '[]'); } catch { return []; }
}
function isInWishlist(id) { return getWishlist().includes(String(id)); }
function toggleWishlist(id) {
  const list = getWishlist();
  const sid = String(id);
  const idx = list.indexOf(sid);
  if (idx > -1) { list.splice(idx, 1); } else { list.push(sid); }
  localStorage.setItem('cosnimaWishlist', JSON.stringify(list));
  return idx === -1; // true = added
}

function initWishButtons() {
  document.querySelectorAll('.card-wish').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      if (!API.isLoggedIn()) {
        showToast('Log in to save to your wishlist 🦫', 'info');
        return;
      }
      const id = btn.dataset.id;
      const added = toggleWishlist(id);
      btn.classList.toggle('active', added);
      const svg = btn.querySelector('svg');
      if (svg) svg.setAttribute('fill', added ? 'var(--accent)' : 'none');
      btn.setAttribute('aria-label', added ? 'Remove from wishlist' : 'Add to wishlist');
      showToast(added ? '❤️ Added to wishlist' : 'Removed from wishlist', added ? 'success' : 'info', 2000);
    });
  });
}

/* ── Search ── */
function handleSearch() {
  const val = document.getElementById('hero-search-input')?.value?.trim();
  if (!val) return;
  document.body.classList.add('fade-out');
  setTimeout(() => {
    window.location.href = `listing/listings.html?q=${encodeURIComponent(val)}`;
  }, 260);
}

/* ── Helpers ── */
function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}