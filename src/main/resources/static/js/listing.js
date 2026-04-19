/* ============================================
   COSNIMA — Listings Page Logic (FULLY FIXED)
   Series/size filters working, view toggle, smooth loading
   ============================================ */

// ── State ──
let state = {
  page: 0,
  pageSize: 12,
  sortBy: 'createdAt',
  sortDir: 'desc',
  keyword: '',
  type: null,
  condition: null,
  series: null,
  size: null,
  minPrice: null,
  maxPrice: null,
  status: 'AVAILABLE',
};

let isLoading = false;
let hasMore = true;
let seriesListCache = null;

// ── DOM Elements ──
const searchInput = document.getElementById('search-input');
const typeFilter = document.getElementById('type-filter');
const conditionFilter = document.getElementById('condition-filter');
const seriesFilter = document.getElementById('series-filter');
const sizeFilter = document.getElementById('size-filter');
const priceMin = document.getElementById('price-min');
const priceMax = document.getElementById('price-max');
const sortFilter = document.getElementById('sort-filter');
const applyBtn = document.getElementById('apply-filters');
const resetBtn = document.getElementById('reset-filters');
const container = document.getElementById('listings-container');
const resultsCount = document.getElementById('results-count');
const errorEl = document.getElementById('listings-error');
const seriesPillsContainer = document.getElementById('series-pills');
const activeFiltersContainer = document.getElementById('active-filters');
const gridViewBtn = document.getElementById('grid-view-btn');
const listViewBtn = document.getElementById('list-view-btn');

document.addEventListener('DOMContentLoaded', async () => {
  await loadSeriesOptions();
  restoreUrlParams();
  wireFilters();
  initViewToggle();
  fetchListings(true);
});

// ── View Toggle (Grid / List) ──
function initViewToggle() {
  const savedView = localStorage.getItem('cosnimaViewMode') || 'grid';
  if (savedView === 'list') {
    container.classList.add('list-view');
    gridViewBtn?.classList.remove('active');
    listViewBtn?.classList.add('active');
  } else {
    container.classList.remove('list-view');
    gridViewBtn?.classList.add('active');
    listViewBtn?.classList.remove('active');
  }

  gridViewBtn?.addEventListener('click', () => {
    container.classList.remove('list-view');
    gridViewBtn.classList.add('active');
    listViewBtn.classList.remove('active');
    localStorage.setItem('cosnimaViewMode', 'grid');
  });

  listViewBtn?.addEventListener('click', () => {
    container.classList.add('list-view');
    listViewBtn.classList.add('active');
    gridViewBtn.classList.remove('active');
    localStorage.setItem('cosnimaViewMode', 'list');
  });
}

// ── Restore URL parameters ──
function restoreUrlParams() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('keyword')) {
    state.keyword = params.get('keyword');
    if (searchInput) searchInput.value = state.keyword;
  }
  if (params.get('series')) {
    state.series = params.get('series');
    if (seriesFilter) seriesFilter.value = state.series;
  }
  if (params.get('type')) state.type = params.get('type');
  if (params.get('condition')) state.condition = params.get('condition');
  if (params.get('size')) state.size = params.get('size');
  if (params.get('minPrice')) state.minPrice = parseFloat(params.get('minPrice'));
  if (params.get('maxPrice')) state.maxPrice = parseFloat(params.get('maxPrice'));
  if (params.get('sort')) {
    const sortVal = params.get('sort');
    if (sortFilter) sortFilter.value = sortVal;
    setSortFromValue(sortVal);
  }
}

// ── Load series from API ──
async function loadSeriesOptions() {
  if (seriesListCache) {
    populateSeriesUI(seriesListCache);
    return;
  }
  try {
    const response = await API.get('/api/listings?page=0&pageSize=200', false);
    let listings = [];
    if (Array.isArray(response)) listings = response;
    else if (response?.content) listings = response.content;
    else if (response?.listings) listings = response.listings;

    const seriesSet = new Set();
    listings.forEach(l => {
      if (l.seriesName && l.seriesName.trim()) seriesSet.add(l.seriesName.trim());
    });
    seriesListCache = Array.from(seriesSet).sort();
    populateSeriesUI(seriesListCache);
  } catch (err) {
    seriesListCache = [];
    populateSeriesUI([]);
  }
}

function populateSeriesUI(seriesList) {
  // Dropdown
  if (seriesFilter) {
    seriesFilter.innerHTML = '<option value="">Any Series</option>';
    seriesList.forEach(s => {
      const option = document.createElement('option');
      option.value = s;
      option.textContent = s;
      seriesFilter.appendChild(option);
    });
    if (state.series) seriesFilter.value = state.series;
  }

  // Pills
  if (seriesPillsContainer) {
    seriesPillsContainer.innerHTML = '<button class="pill active" data-series="">All Series</button>';
    seriesList.slice(0, 12).forEach(s => {
      const pill = document.createElement('button');
      pill.className = 'pill';
      pill.setAttribute('data-series', s);
      pill.textContent = s;
      if (state.series === s) pill.classList.add('active');
      seriesPillsContainer.appendChild(pill);
    });

    document.querySelectorAll('[data-series]').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('[data-series]').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const selectedSeries = pill.getAttribute('data-series');
        state.series = selectedSeries === '' ? null : selectedSeries;
        if (seriesFilter) seriesFilter.value = state.series || '';
        fetchListings(true);
      });
    });
  }
}

// ── Wire filters ──
function wireFilters() {
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        state.keyword = searchInput.value.trim();
        fetchListings(true);
      }, 400);
    });
  }

  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      state.type = typeFilter?.value || null;
      state.condition = conditionFilter?.value || null;
      state.series = seriesFilter?.value || null;
      state.size = sizeFilter?.value || null;
      state.minPrice = priceMin?.value ? parseFloat(priceMin.value) : null;
      state.maxPrice = priceMax?.value ? parseFloat(priceMax.value) : null;
      const sortVal = sortFilter?.value || 'newest';
      setSortFromValue(sortVal);
      fetchListings(true);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (typeFilter) typeFilter.value = '';
      if (conditionFilter) conditionFilter.value = '';
      if (seriesFilter) seriesFilter.value = '';
      if (sizeFilter) sizeFilter.value = '';
      if (priceMin) priceMin.value = '';
      if (priceMax) priceMax.value = '';
      if (sortFilter) sortFilter.value = 'newest';

      state = {
        page: 0,
        pageSize: 12,
        sortBy: 'createdAt',
        sortDir: 'desc',
        keyword: '',
        type: null,
        condition: null,
        series: null,
        size: null,
        minPrice: null,
        maxPrice: null,
        status: 'AVAILABLE',
      };
      document.querySelectorAll('[data-series]').forEach(p => p.classList.remove('active'));
      const allPill = document.querySelector('[data-series=""]');
      if (allPill) allPill.classList.add('active');
      fetchListings(true);
    });
  }

  if (sortFilter) {
    sortFilter.addEventListener('change', () => {
      setSortFromValue(sortFilter.value);
      fetchListings(true);
    });
  }
}

function setSortFromValue(val) {
  switch (val) {
    case 'newest': state.sortBy = 'createdAt'; state.sortDir = 'desc'; break;
    case 'oldest': state.sortBy = 'createdAt'; state.sortDir = 'asc'; break;
    case 'price-asc': state.sortBy = 'price'; state.sortDir = 'asc'; break;
    case 'price-desc': state.sortBy = 'price'; state.sortDir = 'desc'; break;
    case 'alpha': state.sortBy = 'title'; state.sortDir = 'asc'; break;
    default: state.sortBy = 'createdAt'; state.sortDir = 'desc';
  }
}

// ── Main fetch ──
async function fetchListings(reset = false) {
  if (isLoading) return;
  isLoading = true;

  if (reset) {
    state.page = 0;
    hasMore = true;
    showSkeletons();
  }

  if (errorEl) errorEl.style.display = 'none';

  const params = new URLSearchParams();
  params.set('page', state.page);
  params.set('pageSize', state.pageSize);
  params.set('sortBy', state.sortBy);
  params.set('sortDir', state.sortDir);
  params.set('isActive', 'true');
  params.set('status', 'AVAILABLE');

  if (state.keyword) params.set('keyword', state.keyword);
 if (state.type) params.set('type', state.type);
if (state.condition) params.set('condition', state.condition);
if (state.series) params.set('series', state.series);  // matches seriesName in entity
if (state.size) params.set('size', state.size);
  if (state.minPrice != null) params.set('minPrice', state.minPrice);
  if (state.maxPrice != null) params.set('maxPrice', state.maxPrice);

  try {
    const data = await API.get(`/api/listings?${params.toString()}`, false);

    let listings = [];
    let total = 0;
    if (Array.isArray(data)) {
      listings = data;
      total = data.length;
    } else if (data?.content) {
      listings = data.content;
      total = data.totalElements || data.content.length;
    } else if (data?.listings) {
      listings = data.listings;
      total = data.total || data.listings.length;
    }

    if (reset) {
      container.innerHTML = '';
      if (listings.length === 0) {
        showEmptyState();
        resultsCount.textContent = '0 listings';
        hasMore = false;
        updatePagination();
        return;
      }
    }

    const fragment = document.createDocumentFragment();
    listings.forEach(listing => {
      fragment.appendChild(createListingCard(listing));
    });
    container.appendChild(fragment);

    if (reset) {
      resultsCount.textContent = `${total} listing${total !== 1 ? 's' : ''}`;
    } else {
      const current = parseInt(resultsCount.textContent.split(' ')[0]) || 0;
      resultsCount.textContent = `${current + listings.length} listings`;
    }

    hasMore = listings.length === state.pageSize;
    updatePagination();
    attachCardEvents();
    updateActiveFilters();

    // Staggered reveal
    const newCards = container.querySelectorAll('.listing-card:not(.revealed)');
    newCards.forEach((card, idx) => {
      card.classList.add('revealed');
      card.style.animationDelay = `${idx * 0.03}s`;
    });
  } catch (err) {
    if (reset) container.innerHTML = '';
    if (errorEl) {
      errorEl.style.display = 'block';
      errorEl.innerHTML = `<strong>Error: ${err.message || 'Could not load listings.'}</strong> <button onclick="fetchListings(true)" style="text-decoration:underline;font-weight:700;color:inherit;">Retry</button>`;
    }
  } finally {
    isLoading = false;
  }
}

// ── UI Helpers ──
function showSkeletons() {
  if (!container) return;
  const skeletons = Array(6).fill(`
    <div class="skeleton-card" aria-hidden="true">
      <div class="skeleton-thumb"></div>
      <div class="skeleton-body">
        <div class="skeleton-line medium"></div>
        <div class="skeleton-line short"></div>
      </div>
    </div>
  `).join('');
  container.innerHTML = skeletons;
}

function showEmptyState() {
  container.innerHTML = `
    <div class="empty-state" style="grid-column:1/-1">
      <div class="empty-state-icon">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </div>
      <h3>No listings found</h3>
      <p>Try adjusting your search or filters.</p>
      <button onclick="document.getElementById('reset-filters')?.click()" class="btn btn-outline" style="margin-top:var(--space-md)">Clear Filters</button>
    </div>`;
}

function createListingCard(listing) {
  const isRent = listing.type === 'RENT';
  const typeBadge = isRent
    ? '<span class="badge badge-rent">Rent</span>'
    : '<span class="badge badge-sell">Sale</span>';
  const price = listing.price != null ? `₱${Number(listing.price).toLocaleString('en-PH')}` : '—';
  const priceNote = isRent ? '<span class="price-note">/ event</span>' : '';
  const sellerName = listing.sellerUsername || listing.seller?.username || 'Seller';
  const initial = sellerName.charAt(0).toUpperCase();
  const series = listing.seriesName || listing.series || '';

  let primaryImage = null;
  if (listing.imageUrl) primaryImage = listing.imageUrl;
  else if (listing.images?.length) {
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

  const isWished = isInWishlist(listing.id);
  const currentUser = API.getUser();
  const isOwn = currentUser && String(currentUser.id) === String(listing.sellerId || listing.seller?.id);
  const profileUrl = isOwn
    ? '../profile/profile.html'
    : `../profile/public-profile.html?id=${listing.sellerId || listing.seller?.id}`;

  const article = document.createElement('article');
  article.setAttribute('data-seller-id', listing.sellerId || listing.seller?.id);
  article.className = 'listing-card';
  article.setAttribute('data-id', listing.id);
  article.innerHTML = `
    <div class="card-thumb">
      ${imgHtml}
      <div class="card-badges">${typeBadge}</div>
      <button class="card-wish ${isWished ? 'active' : ''}" data-id="${listing.id}" aria-label="${isWished ? 'Remove from wishlist' : 'Add to wishlist'}">
        <svg viewBox="0 0 24 24" fill="${isWished ? 'var(--accent)' : 'none'}" stroke="var(--accent)" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
        </svg>
      </button>
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
  `;
  return article;


  document.querySelectorAll('.listing-card:not([data-wired-card])').forEach(card => {
    card.setAttribute('data-wired-card', 'true');
    card.addEventListener('click', (e) => {
      if (e.target.closest('.card-wish') || e.target.closest('.card-seller')) return;
      const id = card.getAttribute('data-id');
      if (id) window.location.href = `view-listing.html?id=${id}`;
    });
  });

  document.querySelectorAll('.card-wish:not([data-wired-wish])').forEach(btn => {
    btn.setAttribute('data-wired-wish', 'true');
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (!API.isLoggedIn()) {
        showToast('Log in to save to your wishlist', 'info');
        return;
      }
      const id = btn.getAttribute('data-id');
      const added = toggleWishlist(id);
      btn.classList.toggle('active', added);
      const svg = btn.querySelector('svg');
      if (svg) svg.setAttribute('fill', added ? 'var(--accent)' : 'none');
      showToast(added ? 'Added to wishlist' : 'Removed from wishlist', added ? 'success' : 'info', 2000);
    });
  });
}

// ── Wishlist ──
function getWishlist() {
  try { return JSON.parse(localStorage.getItem('cosnimaWishlist') || '[]'); } catch { return []; }
}
function isInWishlist(id) { return getWishlist().includes(String(id)); }
function toggleWishlist(id) {
  const list = getWishlist();
  const sid = String(id);
  const idx = list.indexOf(sid);
  if (idx > -1) list.splice(idx, 1);
  else list.push(sid);
  localStorage.setItem('cosnimaWishlist', JSON.stringify(list));
  return idx === -1;
}

// ── Pagination ──
function updatePagination() {
  const paginationContainer = document.getElementById('pagination');
  if (!paginationContainer) return;
  if (hasMore) {
    paginationContainer.innerHTML = `<button class="btn btn-outline" id="load-more-btn">Load More</button>`;
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        if (!isLoading && hasMore) {
          state.page++;
          fetchListings(false);
        }
      });
    }
  } else {
    paginationContainer.innerHTML = '';
  }
}

// ── Active Filters Chips ──
function updateActiveFilters() {
  if (!activeFiltersContainer) return;
  const filters = [];
  if (state.keyword) filters.push(`<span class="filter-chip">Search: ${escapeHtml(state.keyword)} <button class="remove-chip" data-filter="keyword">✕</button></span>`);
  if (state.type) filters.push(`<span class="filter-chip">${state.type === 'SELL' ? 'For Sale' : 'For Rent'} <button class="remove-chip" data-filter="type">✕</button></span>`);
  if (state.condition) filters.push(`<span class="filter-chip">Condition: ${state.condition.replace('_', ' ')} <button class="remove-chip" data-filter="condition">✕</button></span>`);
  if (state.series) filters.push(`<span class="filter-chip">Series: ${escapeHtml(state.series)} <button class="remove-chip" data-filter="series">✕</button></span>`);
  if (state.size) filters.push(`<span class="filter-chip">Size: ${state.size} <button class="remove-chip" data-filter="size">✕</button></span>`);
  if (state.minPrice != null) filters.push(`<span class="filter-chip">Min ₱${state.minPrice} <button class="remove-chip" data-filter="minPrice">✕</button></span>`);
  if (state.maxPrice != null) filters.push(`<span class="filter-chip">Max ₱${state.maxPrice} <button class="remove-chip" data-filter="maxPrice">✕</button></span>`);

  if (filters.length) {
    activeFiltersContainer.style.display = 'flex';
    activeFiltersContainer.innerHTML = filters.join('');
    activeFiltersContainer.querySelectorAll('.remove-chip').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const filter = btn.getAttribute('data-filter');
        removeSingleFilter(filter);
      });
    });
  } else {
    activeFiltersContainer.style.display = 'none';
    activeFiltersContainer.innerHTML = '';
  }
}

function removeSingleFilter(filter) {
  switch (filter) {
    case 'keyword': state.keyword = ''; if (searchInput) searchInput.value = ''; break;
    case 'type': state.type = null; if (typeFilter) typeFilter.value = ''; break;
    case 'condition': state.condition = null; if (conditionFilter) conditionFilter.value = ''; break;
    case 'series': state.series = null; if (seriesFilter) seriesFilter.value = ''; document.querySelectorAll('[data-series]').forEach(p => p.classList.remove('active')); document.querySelector('[data-series=""]')?.classList.add('active'); break;
    case 'size': state.size = null; if (sizeFilter) sizeFilter.value = ''; break;
    case 'minPrice': state.minPrice = null; if (priceMin) priceMin.value = ''; break;
    case 'maxPrice': state.maxPrice = null; if (priceMax) priceMax.value = ''; break;
  }
  fetchListings(true);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function showToast(msg, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}