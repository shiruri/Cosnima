/* ============================================
   COSNIMA — Offers Ratings Patch
   Phase 1: Adds "Leave Review" to accepted offers
   Include AFTER offers.js and ratings.js
   ============================================ */

/* Override buildMyOfferCard to add Leave Review for ACCEPTED offers */
const _originalBuildMyOfferCard = typeof buildMyOfferCard === 'function' ? buildMyOfferCard : null;

// Patch the offer card rendering to inject review button
document.addEventListener('DOMContentLoaded', () => {
  // After offers load, check and inject review buttons
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) {
          // Look for accepted offer cards that don't have review buttons yet
          const acceptedCards = node.querySelectorAll
            ? node.querySelectorAll('.offer-card--accepted:not([data-review-checked])')
            : [];
          acceptedCards.forEach(card => {
            injectReviewBannerOnOffer(card);
          });
          // Also check the node itself
          if (node.classList && node.classList.contains('offer-card--accepted') && !node.dataset.reviewChecked) {
            injectReviewBannerOnOffer(node);
          }
        }
      });
    });
  });

  const container = document.getElementById('my-offers-container');
  if (container) {
    observer.observe(container, { childList: true, subtree: true });
  }
});

async function injectReviewBannerOnOffer(card) {
  if (!card || card.dataset.reviewChecked) return;
  card.dataset.reviewChecked = 'true';

  const offerId = card.dataset.offerId;
  if (!offerId) return;

  // Find offer data
  const offer = (typeof allMyOffers !== 'undefined' ? allMyOffers : [])
    .find(o => String(o.id) === String(offerId));
  if (!offer || offer.status !== 'ACCEPTED') return;

  const currentUser = API.getUser();
  if (!currentUser) return;

  // Check if already rated
  const alreadyRated = await hasAlreadyRated(currentUser.id, offerId, 'SALE');

  // Find or create the review section
  let reviewSection = card.querySelector('.offer-card-review-section');
  if (!reviewSection) {
    reviewSection = document.createElement('div');
    reviewSection.className = 'offer-card-review-section';
    card.appendChild(reviewSection);
  }

  if (alreadyRated) {
    reviewSection.innerHTML = `
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
  } else {
    // Determine who to rate: if current user is buyer → rate seller; if seller → rate buyer
    const isBuyer  = String(currentUser.id) === String(offer.buyerId);
    const ratedId  = isBuyer ? offer.sellerId  : offer.buyerId;
    const ratedName = isBuyer ? (offer.sellerUsername || 'Seller') : (offer.buyerUsername || 'Buyer');

    reviewSection.innerHTML = `
      <div class="offer-card-review-banner">
        <div class="offer-card-review-banner-text">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
          </svg>
          How was your experience?
        </div>
        <button class="leave-review-btn"
                onclick="triggerOfferReview('${escH(String(offerId))}', '${escH(String(ratedId))}', '${escH(ratedName)}', '${escH(offer.listingTitle || '')}', '${escH(offer.listingImageUrl || '')}', event)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
          </svg>
          Leave Review
        </button>
      </div>`;
  }
}

function triggerOfferReview(offerId, ratedUserId, ratedUsername, listingTitle, listingImage, event) {
  event.stopPropagation();
  openRatingModal({
    transactionType: 'SALE',
    transactionId:   offerId,
    ratedUserId,
    ratedUsername,
    listingTitle,
    listingImage:    listingImage || null,
    onSuccess: (result) => {
      // Update the card's review section
      setTimeout(() => {
        const card = document.querySelector(`[data-offer-id="${offerId}"]`);
        if (card) {
          card.dataset.reviewChecked = '';
          injectReviewBannerOnOffer(card);
        }
      }, 1000);
    },
  });
}

function escH(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

window.triggerOfferReview = triggerOfferReview;
window.injectReviewBannerOnOffer = injectReviewBannerOnOffer;
