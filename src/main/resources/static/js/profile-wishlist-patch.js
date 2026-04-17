/* ============================================
   COSNIMA — Profile Wishlist Grid Patch
   Replaces loadProfileWishlist() in profile.html
   ============================================ */

async function loadProfileWishlist() {
  const container = document.getElementById('profile-wishlist');
  if (!container) return;
  container._loaded = true;

  container.innerHTML = `
    <div class="wishlist-skeleton-grid">
      ${Array(6).fill(`
        <div class="wishlist-skeleton-card">
          <div class="wishlist-skeleton-thumb"></div>
          <div class="wishlist-skeleton-body">
            <div class="wishlist-skeleton-line w-80"></div>
            <div class="wishlist-skeleton-line w-50"></div>
          </div>
        </div>`).join('')}
    </div>`;

  try {
    const wishlists = await API.get('/api/wishlists', true) || [];

    if (!wishlists.length) {
      container.innerHTML = `
        <div class="wishlist-grid">
          <div class="wishlist-empty">
            <div class="wishlist-empty-heart">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </div>
            <h3 style="color:var(--ink);">Wishlist is empty</h3>
            <p style="color:var(--ink-muted);max-width:280px;">Save items you love by clicking the heart on any listing.</p>
            <a href="../listing/listings.html" class="btn btn-primary" style="margin-top:var(--space-md);">Browse Listings</a>
          </div>
        </div>`;
      return;
    }

    container.innerHTML = `
      <div class="wishlist-grid" id="wishlist-grid-inner">
        ${wishlists.map(w => buildWishlistCard(w)).join('')}
      </div>`;

    container.querySelectorAll('.wishlist-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.wishlist-heart-btn')) return;
        const id = card.dataset.listingId;
        if (id) navigateTo(`../listing/view-listing.html?id=${id}`);
      });
    });

    container.querySelectorAll('.wishlist-heart-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const listingId = btn.dataset.listingId;
        if (!listingId) return;
        btn.disabled = true;
        btn.style.opacity = '0.5';
        try {
          await API.delete(`/api/wishlists/${listingId}`, true);
          const card = btn.closest('.wishlist-card');
          if (card) {
            card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            card.style.opacity = '0';
            card.style.transform = 'scale(0.9)';
            setTimeout(() => {
              card.remove();
              const grid = document.getElementById('wishlist-grid-inner');
              if (grid && !grid.querySelectorAll('.wishlist-card').length) {
                loadProfileWishlist();
              }
            }, 300);
          }
          if (typeof showToast === 'function') showToast('Removed from wishlist', 'info');
        } catch (err) {
          btn.disabled = false;
          btn.style.opacity = '1';
          if (typeof showToast === 'function') showToast(err?.message || 'Could not remove', 'error');
        }
      });
    });

  } catch {
    container.innerHTML = `
      <div class="wishlist-grid">
        <div class="wishlist-empty">
          <h3 style="color:var(--ink);">Could not load wishlist</h3>
          <p style="color:var(--ink-muted);">Please refresh the page.</p>
          <button onclick="loadProfileWishlist()" class="btn btn-primary" style="margin-top:var(--space-md);">Retry</button>
        </div>
      </div>`;
  }
}

function buildWishlistCard(w) {
  const imgUrl = w.listingImage || w.listingImageUrl || null;
  const isRent = false;
  const price = w.listingPrice != null
    ? '₱' + Number(w.listingPrice).toLocaleString('en-PH', { minimumFractionDigits: 0 })
    : '₱0';
  const savedDate = w.savedAt
    ? new Date(w.savedAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
    : '';

  const imgHtml = imgUrl
    ? `<img src="${escHtmlW(imgUrl)}" alt="${escHtmlW(w.listingTitle || '')}" loading="lazy">`
    : `<div class="wishlist-card-placeholder">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
       </div>`;

  return `
    <div class="wishlist-card" data-listing-id="${escHtmlW(String(w.listingId))}">
      <div class="wishlist-card-thumb">
        ${imgHtml}
        <button class="wishlist-heart-btn" data-listing-id="${escHtmlW(String(w.listingId))}" aria-label="Remove from wishlist">
          <svg xmlns="http://www.w3.org/2000/svg" fill="var(--accent)" viewBox="0 0 24 24" stroke="var(--accent)" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
        </button>
      </div>
      <div class="wishlist-card-body">
        <div class="wishlist-card-title">${escHtmlW(w.listingTitle || 'Untitled')}</div>
        <div class="wishlist-card-price">${price}</div>
        <div class="wishlist-card-meta">
          <span class="wishlist-card-type sell">For Sale</span>
          ${savedDate ? `<span class="wishlist-card-date">${savedDate}</span>` : ''}
        </div>
      </div>
    </div>`;
}

function escHtmlW(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}