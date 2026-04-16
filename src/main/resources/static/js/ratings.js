/* ============================================
   COSNIMA — Ratings System
   Phase 1: Leave Review / Rating Modal
   
   Usage:
     openRatingModal({
       transactionType: 'SALE' | 'RENTAL',
       transactionId:   string,
       ratedUserId:     UUID string,
       ratedUsername:   string,
       listingTitle:    string,
       listingImage:    string | null,
       onSuccess:       function(ratingResponse) {}
     });
   ============================================ */

let _ratingConfig      = null;
let _selectedStars     = 0;
let _isSubmittingRating = false;

/* ────────────────────────────────────────────
   OPEN MODAL
   ──────────────────────────────────────────── */
async function openRatingModal(config) {
  if (!config) return;
  _ratingConfig  = config;
  _selectedStars = 0;

  // Check if already rated
  try {
    const existing = await API.get(`/api/ratings/user/${config.ratedUserId}`, true);
    if (Array.isArray(existing)) {
      const alreadyRated = existing.some(r =>
        String(r.transactionId) === String(config.transactionId) &&
        r.transactionType === config.transactionType
      );
      if (alreadyRated) {
        showToast('You have already reviewed this transaction.', 'info');
        return;
      }
    }
  } catch { /* proceed anyway */ }

  // Remove any existing modal
  document.getElementById('rating-modal-backdrop')?.remove();

  const backdrop = document.createElement('div');
  backdrop.id = 'rating-modal-backdrop';
  backdrop.className = 'rating-modal-backdrop';
  backdrop.innerHTML = buildRatingModalHtml(config);

  document.body.appendChild(backdrop);

  // Fade in
  requestAnimationFrame(() => {
    backdrop.classList.add('open');
  });

  // Wire up stars
  wireStarButtons();

  // Close on backdrop click
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeRatingModal();
  });

  // Escape key
  document.addEventListener('keydown', ratingEscHandler);
}

function buildRatingModalHtml(config) {
  const typeLabel = config.transactionType === 'SALE' ? 'Sale' : 'Rental';
  const typeColor = config.transactionType === 'SALE' ? 'var(--accent)' : 'var(--beaver)';

  const thumbHtml = config.listingImage
    ? `<img src="${escH(config.listingImage)}" alt="">`
    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:var(--bg-alt);color:var(--ink-faint);">
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
       </div>`;

  const initial = (config.ratedUsername || 'U').charAt(0).toUpperCase();

  return `
    <div class="rating-modal" role="dialog" aria-modal="true" aria-label="Leave a Review">

      <!-- Header -->
      <div class="rating-modal-header">
        <div class="rating-modal-header-info">
          <div class="rating-modal-user-avatar">${escH(initial)}</div>
          <div>
            <h3 class="rating-modal-header-title">Rate ${escH(config.ratedUsername || 'User')}</h3>
            <p class="rating-modal-header-sub">Share your experience with this ${typeLabel.toLowerCase()}</p>
          </div>
        </div>
        <button class="rating-modal-close" onclick="closeRatingModal()" aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Body -->
      <div class="rating-modal-body" id="rating-modal-body">

        <!-- Status banner -->
        <div class="rating-status-banner" id="rating-status-banner" role="alert"></div>

        <!-- Transaction context -->
        <div class="rating-txn-banner">
          <div class="rating-txn-thumb">${thumbHtml}</div>
          <div class="rating-txn-info">
            <div class="rating-txn-title">${escH(config.listingTitle || 'Transaction')}</div>
            <div class="rating-txn-type" style="color:${typeColor};">${typeLabel} Transaction</div>
          </div>
        </div>

        <!-- Star selector -->
        <div class="star-selector-section">
          <span class="star-selector-label">Your Rating</span>
          <div class="star-selector" role="group" aria-label="Star rating">
            ${[1, 2, 3, 4, 5].map(i => `
              <button type="button" class="star-btn" data-star="${i}"
                      aria-label="${i} star${i !== 1 ? 's' : ''}"
                      title="${['Terrible', 'Poor', 'Okay', 'Good', 'Excellent'][i - 1]}">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                        stroke-width="1.5" stroke-linejoin="round"/>
                </svg>
              </button>`).join('')}
          </div>
          <div class="star-rating-label" id="star-rating-label">Tap to rate</div>
        </div>

        <!-- Comment -->
        <div class="rating-comment-section">
          <label class="rating-comment-label" for="rating-comment">Review (optional)</label>
          <textarea class="rating-comment-field" id="rating-comment"
                    placeholder="Share what you liked or suggest improvements…"
                    maxlength="500" rows="3"></textarea>
          <div class="rating-comment-hint">
            <span id="rating-comment-count">0</span> / 500
          </div>
        </div>

      </div><!-- /body -->

      <!-- Footer -->
      <div class="rating-modal-footer">
        <button class="btn btn-ghost" onclick="closeRatingModal()">Cancel</button>
        <button class="btn btn-primary" id="rating-submit-btn" onclick="submitRating()" disabled>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
          <span class="btn-text">Submit Review</span>
          <span class="btn-loader" style="display:none;width:14px;height:14px;border:2px solid rgba(255,255,255,0.5);border-top-color:white;border-radius:50%;animation:spin 0.6s linear infinite;"></span>
        </button>
      </div>

    </div>`;
}

/* ────────────────────────────────────────────
   STAR WIRING
   ──────────────────────────────────────────── */
function wireStarButtons() {
  const ratingLabels = ['', 'Terrible', 'Poor', 'Okay', 'Good', 'Excellent! ⭐'];
  const stars = document.querySelectorAll('.star-btn');
  const labelEl = document.getElementById('star-rating-label');
  const submitBtn = document.getElementById('rating-submit-btn');

  stars.forEach(btn => {
    const val = parseInt(btn.dataset.star);

    btn.addEventListener('mouseenter', () => {
      stars.forEach(s => {
        const sv = parseInt(s.dataset.star);
        s.classList.toggle('hovered', sv <= val);
        s.classList.remove('filled');
      });
      if (labelEl) {
        labelEl.textContent = ratingLabels[val] || '';
        labelEl.classList.add('has-rating');
      }
    });

    btn.addEventListener('mouseleave', () => {
      stars.forEach(s => {
        s.classList.remove('hovered');
        s.classList.toggle('filled', parseInt(s.dataset.star) <= _selectedStars);
      });
      if (labelEl) {
        labelEl.textContent = _selectedStars > 0 ? (ratingLabels[_selectedStars] || '') : 'Tap to rate';
        if (_selectedStars === 0) labelEl.classList.remove('has-rating');
      }
    });

    btn.addEventListener('click', () => {
      _selectedStars = val;
      stars.forEach(s => {
        s.classList.remove('hovered');
        s.classList.toggle('filled', parseInt(s.dataset.star) <= _selectedStars);
      });
      if (labelEl) {
        labelEl.textContent = ratingLabels[_selectedStars] || '';
        labelEl.classList.add('has-rating');
      }
      if (submitBtn) submitBtn.disabled = false;
    });
  });

  // Character counter
  const textarea = document.getElementById('rating-comment');
  const counter  = document.getElementById('rating-comment-count');
  if (textarea && counter) {
    textarea.addEventListener('input', () => {
      counter.textContent = textarea.value.length;
    });
  }
}

/* ────────────────────────────────────────────
   SUBMIT
   ──────────────────────────────────────────── */
async function submitRating() {
  if (!_ratingConfig || _selectedStars === 0) {
    showRatingBanner('Please select a star rating before submitting.', 'error');
    return;
  }
  if (_isSubmittingRating) return;
  _isSubmittingRating = true;

  const btn = document.getElementById('rating-submit-btn');
  const btnText = btn?.querySelector('.btn-text');
  const btnLoader = btn?.querySelector('.btn-loader');
  if (btn) btn.disabled = true;
  if (btnText) btnText.style.display = 'none';
  if (btnLoader) btnLoader.style.display = 'inline-block';

  const comment = document.getElementById('rating-comment')?.value?.trim() || null;

  try {
    const payload = {
      ratedUserId:     _ratingConfig.ratedUserId,
      transactionType: _ratingConfig.transactionType,
      transactionId:   String(_ratingConfig.transactionId),
      stars:           _selectedStars,
      comment,
    };

    const result = await API.post('/api/ratings', payload, true);

    // Show success state
    const body = document.getElementById('rating-modal-body');
    const footer = document.querySelector('.rating-modal-footer');
    if (body) {
      body.innerHTML = `
        <div class="rating-success-state">
          <div class="rating-success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <div class="rating-success-title">Review Submitted!</div>
          <div class="rating-success-stars">${'★'.repeat(_selectedStars)}${'☆'.repeat(5 - _selectedStars)}</div>
          <p class="rating-success-desc">
            Thanks for your feedback on ${escH(_ratingConfig.listingTitle || 'this transaction')}.
            Your review helps the community!
          </p>
        </div>`;
    }
    if (footer) footer.innerHTML = `
      <div style="margin:0 auto;">
        <button class="btn btn-primary" onclick="closeRatingModal()" style="padding:0.5rem 1.5rem;">Done</button>
      </div>`;

    // Callback
    if (typeof _ratingConfig.onSuccess === 'function') {
      _ratingConfig.onSuccess(result);
    }

  } catch (err) {
    const msg = err?.message || 'Could not submit review. Please try again.';
    showRatingBanner(msg, 'error');
    if (btn) btn.disabled = false;
    if (btnText) btnText.style.display = 'inline';
    if (btnLoader) btnLoader.style.display = 'none';
  } finally {
    _isSubmittingRating = false;
  }
}

/* ────────────────────────────────────────────
   HELPERS
   ──────────────────────────────────────────── */
function closeRatingModal() {
  const backdrop = document.getElementById('rating-modal-backdrop');
  if (!backdrop) return;
  backdrop.classList.remove('open');
  setTimeout(() => backdrop.remove(), 250);
  document.removeEventListener('keydown', ratingEscHandler);
  _ratingConfig = null;
  _selectedStars = 0;
}

function ratingEscHandler(e) {
  if (e.key === 'Escape') closeRatingModal();
}

function showRatingBanner(msg, type) {
  const el = document.getElementById('rating-status-banner');
  if (!el) return;
  el.textContent = msg;
  el.className = `rating-status-banner show ${type}`;
}

function escH(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ────────────────────────────────────────────
   RENDER STARS (static display)
   ──────────────────────────────────────────── */
function renderStaticStars(count, size = 16) {
  return [1, 2, 3, 4, 5].map(i => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${i <= count ? '#f5a623' : 'none'}"
         stroke="${i <= count ? '#f5a623' : 'var(--border-dark)'}" stroke-width="1.5"
         xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            stroke-linejoin="round"/>
    </svg>`).join('');
}

/* ────────────────────────────────────────────
   CHECK ALREADY RATED (utility)
   ──────────────────────────────────────────── */
async function hasAlreadyRated(userId, transactionId, transactionType) {
  try {
    const ratings = await API.get(`/api/ratings/user/${userId}`, true);
    if (!Array.isArray(ratings)) return false;
    return ratings.some(r =>
      String(r.transactionId) === String(transactionId) &&
      r.transactionType === transactionType
    );
  } catch {
    return false;
  }
}

// Expose globally
window.openRatingModal  = openRatingModal;
window.closeRatingModal = closeRatingModal;
window.submitRating     = submitRating;
window.renderStaticStars = renderStaticStars;
window.hasAlreadyRated  = hasAlreadyRated;
