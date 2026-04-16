/* ============================================
   COSNIMA — Report Buttons Patch
   Phase 2: Injects report buttons into pages
   Works on:
   - view-listing.html  (report listing)
   - public-profile.html (report user)
   - messages.html       (report message - right click / hover)
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;

  if (path.includes('view-listing')) {
    initListingReportButton();
  }
  if (path.includes('public-profile')) {
    initProfileReportButton();
  }
  if (path.includes('messages')) {
    initMessageReportButtons();
  }
});

/* ────────────────────────────────────────────
   VIEW LISTING: Report the listing
   ──────────────────────────────────────────── */
function initListingReportButton() {
  if (!API.isLoggedIn()) return;

  // The listing page has a report btn in seller-card header already in view-listing.html
  // We just need to override the onclick to use our modal properly
  const reportBtn = document.getElementById('report-listing-btn');
  if (reportBtn) {
    reportBtn.onclick = () => {
      const listingId = new URLSearchParams(window.location.search).get('id');
      const titleEl   = document.getElementById('listing-title');
      const title     = titleEl?.textContent || 'Listing';

      if (!listingId) return;

      openReportModal({
        targetType: 'LISTING',
        targetId:   listingId,
        targetName: title,
      });
    };
    // Upgrade button styling
    reportBtn.className = 'report-trigger-btn';
    reportBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16"/>
      </svg>
      Report`;
  }
}

/* ────────────────────────────────────────────
   PUBLIC PROFILE: Report the user
   ──────────────────────────────────────────── */
function initProfileReportButton() {
  if (!API.isLoggedIn()) return;

  const params   = new URLSearchParams(window.location.search);
  const userId   = params.get('id');
  const myId     = API.getUser()?.id;

  // Don't let users report themselves
  if (!userId || String(userId) === String(myId)) return;

  // Wait for profile to load and actions to render
  const checkActions = setInterval(() => {
    const actionsEl = document.getElementById('profile-actions');
    if (!actionsEl || actionsEl.innerHTML.trim() === '') return;

    // Only add if not already there
    if (actionsEl.querySelector('.report-trigger-btn')) {
      clearInterval(checkActions);
      return;
    }

    clearInterval(checkActions);

    const reportBtn = document.createElement('button');
    reportBtn.className = 'report-trigger-btn';
    reportBtn.style.cssText = 'margin-top:var(--space-xs);';
    reportBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
      </svg>
      Report User`;
    reportBtn.onclick = () => {
      const usernameEl = document.getElementById('profile-username');
      const username   = usernameEl?.textContent || 'User';
      openReportModal({
        targetType: 'USER',
        targetId:   userId,
        targetName: username,
      });
    };
    actionsEl.appendChild(reportBtn);
  }, 300);

  // Stop checking after 5 seconds
  setTimeout(() => clearInterval(checkActions), 5000);
}

/* ────────────────────────────────────────────
   MESSAGES: Report a message (hover/right-click)
   ──────────────────────────────────────────── */
function initMessageReportButtons() {
  if (!API.isLoggedIn()) return;

  // Observe messages area for new messages
  const messagesArea = document.getElementById('messages-area');
  if (!messagesArea) return;

  const observer = new MutationObserver(() => {
    addReportButtonsToMessages(messagesArea);
  });
  observer.observe(messagesArea, { childList: true, subtree: true });

  // Initial pass
  addReportButtonsToMessages(messagesArea);
}

function addReportButtonsToMessages(root) {
  const myId = String(API.getUser()?.id || '');

  root.querySelectorAll('.msg-row:not([data-report-wired])').forEach(row => {
    row.dataset.reportWired = 'true';

    const msgId   = row.dataset.msgId;
    const isOwn   = row.classList.contains('own');

    // Only allow reporting OTHER people's messages
    if (isOwn || !msgId) return;

    // Add hover report button
    const reportBtn = document.createElement('button');
    reportBtn.className = 'msg-report-btn';
    reportBtn.title = 'Report message';
    reportBtn.setAttribute('aria-label', 'Report message');
    reportBtn.style.cssText = `
      position: absolute;
      top: 50%;
      right: -36px;
      transform: translateY(-50%);
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--card);
      border: 1.5px solid var(--border);
      color: var(--ink-faint);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s ease, color 0.2s ease, border-color 0.2s ease;
      font-size: 0;
    `;
    reportBtn.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
      </svg>`;

    // Make row relative if needed
    const bubbleWrap = row.querySelector('.msg-bubble-wrap');
    if (bubbleWrap) {
      bubbleWrap.style.position = 'relative';
      bubbleWrap.appendChild(reportBtn);
    }

    // Show/hide on hover
    row.addEventListener('mouseenter', () => {
      reportBtn.style.opacity = '1';
    });
    row.addEventListener('mouseleave', () => {
      reportBtn.style.opacity = '0';
    });
    reportBtn.addEventListener('mouseenter', () => {
      reportBtn.style.opacity = '1';
      reportBtn.style.color = 'var(--error)';
      reportBtn.style.borderColor = 'var(--error)';
    });
    reportBtn.addEventListener('mouseleave', () => {
      reportBtn.style.color = 'var(--ink-faint)';
      reportBtn.style.borderColor = 'var(--border)';
    });

    // On click
    reportBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const preview = row.querySelector('.msg-bubble')?.textContent?.slice(0, 60) || 'Message';
      openReportModal({
        targetType: 'MESSAGE',
        targetId:   msgId,
        targetName: preview + (preview.length >= 60 ? '…' : ''),
      });
    });
  });
}

window.initListingReportButton  = initListingReportButton;
window.initProfileReportButton  = initProfileReportButton;
window.initMessageReportButtons = initMessageReportButtons;
