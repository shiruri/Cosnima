/* ============================================
   COSNIMA — Rentals Ratings + Complete Patch
   Phase 1: 
   - Seller on APPROVED rental → "Mark as Complete"
   - Both parties on COMPLETED rental → "Leave Review"
   Include AFTER rentals page scripts and ratings.js
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Observe rental containers for new cards
  const containers = [
    document.getElementById('my-rentals-container'),
    document.getElementById('incoming-rentals-container'),
  ].filter(Boolean);

  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType !== 1) return;
        processRentalCards(node.querySelectorAll ? node : document);
      });
    });
  });

  containers.forEach(c => observer.observe(c, { childList: true, subtree: true }));

  // Initial pass
  processRentalCards(document);
});

async function processRentalCards(root) {
  if (!API.isLoggedIn()) return;
  const currentUser = API.getUser();
  if (!currentUser) return;

  // Find all unprocessed rental cards
  const cards = root.querySelectorAll
    ? root.querySelectorAll('.rental-card:not([data-rental-processed])')
    : [];

  for (const card of cards) {
    card.dataset.rentalProcessed = 'true';
    const rentalId = card.id?.replace('rental-card-', '');
    if (!rentalId) continue;

    // Find rental in our data
    const allRentals = [
      ...(typeof _myRentals !== 'undefined' ? _myRentals : []),
      ...(typeof _incomingRentals !== 'undefined' ? _incomingRentals : []),
    ];
    const rental = allRentals.find(r => String(r.id) === String(rentalId));
    if (!rental) continue;

    const isOwner  = String(rental.listingId) && isSellerOfRental(rental, currentUser.id);
    const isRenter = String(rental.renterId) === String(currentUser.id);

    await attachRentalActions(card, rental, isOwner, isRenter, currentUser);
  }
}

function isSellerOfRental(rental, userId) {
  // In _incomingRentals, current user is the seller
  const incoming = typeof _incomingRentals !== 'undefined' ? _incomingRentals : [];
  return incoming.some(r => String(r.id) === String(rental.id));
}

async function attachRentalActions(card, rental, isOwner, isRenter, currentUser) {
  // Remove existing action sections to avoid duplication
  card.querySelectorAll('.rental-phase1-section').forEach(el => el.remove());

  const section = document.createElement('div');
  section.className = 'rental-phase1-section';

  if (rental.status === 'APPROVED' && isOwner) {
    // Seller can mark as complete
    section.innerHTML = `
      <div class="rental-card-complete-banner">
        <span style="font-size:0.82rem;font-weight:700;color:var(--ink-muted);display:flex;align-items:center;gap:4px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          Rental in progress
        </span>
        <button class="mark-complete-btn"
                onclick="markRentalComplete(${rental.id}, event)"
                id="complete-btn-${rental.id}">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
          Mark as Complete
        </button>
      </div>`;
  } else if (rental.status === 'COMPLETED') {
    // Check if already rated
    const alreadyRated = await hasAlreadyRated(currentUser.id, String(rental.id), 'RENTAL');

    if (alreadyRated) {
      section.innerHTML = `
        <div class="offer-card-review-banner">
          <div class="offer-card-review-banner-text">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
            Review submitted
          </div>
          <span class="already-rated-badge">
            <svg viewBox="0 0 24 24" fill="#f5a623" stroke="none" width="12" height="12">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Rated
          </span>
        </div>`;
    } else if (isRenter || isOwner) {
      // Determine who to rate
      const ratedId   = isRenter
        ? getRentalSellerId(rental)
        : String(rental.renterId);
      const ratedName = isRenter
        ? (getRentalSellerName(rental))
        : (rental.renterUsername || 'Renter');

      if (ratedId) {
        section.innerHTML = `
          <div class="offer-card-review-banner">
            <div class="offer-card-review-banner-text">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
              </svg>
              How was your rental?
            </div>
            <button class="leave-review-btn"
                    onclick="triggerRentalReview('${rental.id}', '${escH(ratedId)}', '${escH(ratedName)}', '${escH(rental.listingTitle || '')}', '', event)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
              </svg>
              Leave Review
            </button>
          </div>`;
      }
    }
  }

  if (section.innerHTML.trim()) {
    card.appendChild(section);
  }
}

/* ── Helpers to find seller ID from rental data ── */
function getRentalSellerId(rental) {
  // Try from incoming rentals (where current user is seller) — if rental is in _myRentals
  // we need the seller. The seller is not directly in RentalResponse currently,
  // but we can try to get it from the listing.
  // For now, we store the seller info if available.
  return rental.sellerId || rental.sellerUserId || null;
}

function getRentalSellerName(rental) {
  return rental.sellerUsername || 'Owner';
}

/* ── Mark as Complete ── */
async function markRentalComplete(rentalId, event) {
  event?.stopPropagation();
  const btn = document.getElementById(`complete-btn-${rentalId}`);
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `
      <span style="display:inline-block;width:12px;height:12px;border:2px solid rgba(39,174,96,0.4);border-top-color:#27ae60;border-radius:50%;animation:spin 0.6s linear infinite;"></span>
      Completing…`;
  }

  try {
    await API.post(`/api/rental/${rentalId}/complete`, null, true);

    // Update local data
    if (typeof _incomingRentals !== 'undefined') {
      const idx = _incomingRentals.findIndex(r => String(r.id) === String(rentalId));
      if (idx > -1) _incomingRentals[idx].status = 'COMPLETED';
    }
    if (typeof _myRentals !== 'undefined') {
      const idx = _myRentals.findIndex(r => String(r.id) === String(rentalId));
      if (idx > -1) _myRentals[idx].status = 'COMPLETED';
    }

    showToast('Rental marked as complete! Both parties can now leave reviews.', 'success', 4000);

    // Re-render
    if (typeof renderIncomingRentals === 'function') renderIncomingRentals();
    if (typeof renderMyRentals === 'function') renderMyRentals();

  } catch (err) {
    const msg = err?.message || 'Could not complete rental.';
    showToast(msg, 'error');
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
        </svg>
        Mark as Complete`;
    }
  }
}

/* ── Trigger Rental Review ── */
function triggerRentalReview(rentalId, ratedUserId, ratedUsername, listingTitle, listingImage, event) {
  event?.stopPropagation();
  openRatingModal({
    transactionType: 'RENTAL',
    transactionId:   String(rentalId),
    ratedUserId,
    ratedUsername,
    listingTitle,
    listingImage:    listingImage || null,
    onSuccess: () => {
      setTimeout(() => {
        const card = document.getElementById(`rental-card-${rentalId}`);
        if (card) {
          delete card.dataset.rentalProcessed;
          processRentalCards(card.parentElement || document);
        }
      }, 1000);
    },
  });
}

function escH(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

window.markRentalComplete  = markRentalComplete;
window.triggerRentalReview = triggerRentalReview;
