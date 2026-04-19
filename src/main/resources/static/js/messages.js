/* ============================================
   COSNIMA — Messaging System
   Full chat: conversations list + message thread
   ============================================ */

let _conversations   = [];
let _activeConvoId   = null;
let _messages        = [];
let _currentUser     = null;
let _pollInterval    = null;
let _convoSearchTerm = '';

document.addEventListener('DOMContentLoaded', async () => {
  if (!API.isLoggedIn()) {
    window.location.href = '../login/login.html';
    return;
  }

  _currentUser = API.getUser();

  if (API.isLoggedIn()) {
    ['messages-link','mobile-messages-link','sell-link','mobile-sell-link','offers-link','mobile-offers-link','rentals-link','mobile-rentals-link'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = '';
    });
  }

  await loadConversations();

  const params = new URLSearchParams(window.location.search);
  const preselect = params.get('conversation');
  const rentalAction = params.get('action');
  const listingId = params.get('listingId');
  
  if (preselect) {
    setTimeout(() => openConversation(preselect), 200);
  }

  if (preselect && rentalAction === 'rent' && listingId) {
    setTimeout(() => {
      openRentalRequestInChat(preselect, listingId, null);
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, '', cleanUrl);
    }, 800);
  }

  // Search
  const searchInput = document.getElementById('convo-search');
  let debounce;
  searchInput?.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      _convoSearchTerm = searchInput.value.toLowerCase().trim();
      renderConversationsList();
    }, 250);
  });

  // Chat input: send on Enter (Shift+Enter for newline)
  const textarea = document.getElementById('chat-textarea');
  textarea?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  textarea?.addEventListener('input', () => {
    autoResizeTextarea(textarea);
    const btn = document.getElementById('chat-send-btn');
    if (btn) btn.disabled = !textarea.value.trim();
  });

  // Back button (mobile)
  document.getElementById('chat-back-btn')?.addEventListener('click', () => {
    document.querySelector('.messages-layout')?.classList.remove('show-chat');
    _activeConvoId = null;
    stopPolling();
  });
});

/* ── Load all conversations ── */
async function loadConversations() {
  const listEl = document.getElementById('conversations-list');
  if (!listEl) return;

  listEl.innerHTML = Array(4).fill(`
    <div class="convo-skeleton">
      <div class="convo-skeleton-avatar"></div>
      <div class="convo-skeleton-lines">
        <div class="convo-skeleton-line medium"></div>
        <div class="convo-skeleton-line short"></div>
      </div>
    </div>`).join('');

  try {
    _conversations = await API.get('/api/conversations', true) || [];
    renderConversationsList();
  } catch (err) {
    listEl.innerHTML = `
      <div class="convo-empty">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <h3>Could not load</h3>
        <p>Check your connection and try again.</p>
        <button class="btn btn-outline" onclick="loadConversations()" style="margin-top:var(--space-sm);padding:0.4rem 0.9rem;font-size:0.78rem;">Retry</button>
      </div>`;
  }
}

function renderConversationsList() {
  const listEl = document.getElementById('conversations-list');
  if (!listEl) return;

  let list = _conversations;

  if (_convoSearchTerm) {
    list = list.filter(c =>
      (c.listingTitle || '').toLowerCase().includes(_convoSearchTerm) ||
      (c.buyerId && String(c.buyerId).toLowerCase().includes(_convoSearchTerm)) ||
      (c.sellerId && String(c.sellerId).toLowerCase().includes(_convoSearchTerm))
    );
  }

  if (!list.length) {
    listEl.innerHTML = `
      <div class="convo-empty">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
        <h3>${_convoSearchTerm ? 'No results' : 'No conversations yet'}</h3>
        <p>${_convoSearchTerm ? 'Try a different search.' : 'Message a seller from any listing page.'}</p>
        ${!_convoSearchTerm ? `<a href="../listing/listings.html" class="btn btn-outline" style="margin-top:var(--space-sm);padding:0.4rem 0.9rem;font-size:0.78rem;">Browse Listings</a>` : ''}
      </div>`;
    return;
  }

  listEl.innerHTML = list.map(c => buildConvoItem(c)).join('');

  listEl.querySelectorAll('.convo-item').forEach(item => {
    item.addEventListener('click', () => openConversation(item.dataset.id));
  });
}

function buildConvoItem(convo) {
  const myId      = String(_currentUser?.id || '');
  const isSeller  = String(convo.sellerId) === myId;
  const otherId   = isSeller ? convo.buyerId : convo.sellerId;
  const initial   = (convo.listingTitle || 'U').charAt(0).toUpperCase();
  const hasUnread = convo.unreadCount > 0;
  const isActive  = convo.conversationId === _activeConvoId;
  const time      = convo.lastMessageTime ? formatRelTime(convo.lastMessageTime) : '';

  return `
    <div class="convo-item ${hasUnread ? 'has-unread' : ''} ${isActive ? 'active' : ''}"
         data-id="${convo.conversationId}"
         role="button"
         tabindex="0"
         aria-label="Conversation about ${escH(convo.listingTitle || 'listing')}">
      <div class="convo-avatar">
        ${initial}
        ${hasUnread ? '<span class="convo-unread-dot" aria-hidden="true"></span>' : ''}
      </div>
      <div class="convo-info">
        <div class="convo-title">${escH(convo.listingTitle || 'Conversation')}</div>
        <div class="convo-last-msg">${escH(convo.lastMessage || 'No messages yet')}</div>
      </div>
      <div class="convo-meta">
        ${time ? `<span class="convo-time">${time}</span>` : ''}
        ${hasUnread ? `<span class="convo-badge">${convo.unreadCount}</span>` : ''}
      </div>
    </div>`;
}

/* ── Open a conversation ── */
async function openConversation(convoId) {
  if (_activeConvoId === convoId) return;

  stopPolling();
  _activeConvoId = convoId;

  // Activate conversation in sidebar
  document.querySelectorAll('.convo-item').forEach(el => {
    el.classList.toggle('active', el.dataset.id === convoId);
  });

  // Show chat panel on mobile
  document.querySelector('.messages-layout')?.classList.add('show-chat');

  // Find convo data
  const convo = _conversations.find(c => c.conversationId === convoId);
  if (convo) renderChatHeader(convo);

  // Load messages
  await loadMessages(convoId);

  // Mark as read
  try {
    await API.post(`/api/conversations/${convoId}/read`, null, true);
    // Clear badge
    const item = document.querySelector(`.convo-item[data-id="${convoId}"]`);
    if (item) {
      item.classList.remove('has-unread');
      item.querySelector('.convo-unread-dot')?.remove();
      item.querySelector('.convo-badge')?.remove();
    }
  } catch {}

  // Start polling
  startPolling(convoId);
  
  // Show offer/rent action buttons if listing is available
  showChatInputActions(convoId);
}

function renderChatHeader(convo) {
  const nameEl    = document.getElementById('chat-other-name');
  const listingEl = document.getElementById('chat-listing-label');
  const headerAvatar = document.getElementById('chat-header-avatar-text');

  const myId     = String(_currentUser?.id || '');
  const isSeller = String(convo.sellerId) === myId;
  const otherId  = isSeller ? convo.buyerId : convo.sellerId;
  const initial  = (convo.listingTitle || 'U').charAt(0).toUpperCase();

  // Set initial display - will be updated with actual user data
  if (nameEl)       nameEl.textContent    = isSeller ? 'Buyer' : 'Seller';
  if (listingEl)    listingEl.textContent = convo.listingTitle || 'Conversation';
  if (headerAvatar) headerAvatar.textContent = initial;

  // Store other user ID for profile link
  window._currentChatOtherId = otherId;

  // Fetch other user's details
  if (otherId) {
    API.get(`/api/users/${otherId}`, true).then(user => {
      if (user && nameEl) {
        nameEl.textContent = user.username || (isSeller ? 'Buyer' : 'Seller');
      }
      if (user && user.profileImageUrl && headerAvatar) {
        headerAvatar.innerHTML = `<img src="${user.profileImageUrl}" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
      }
    }).catch(() => {});
  }

  // Listing banner
  const banner = document.getElementById('chat-listing-banner');
  const thumb = document.getElementById('chat-listing-thumb');
  if (banner && convo.listingId) {
    banner.href = `../listing/view-listing.html?id=${convo.listingId}`;
    const titleEl = banner.querySelector('.chat-listing-title');
    if (titleEl) titleEl.textContent = convo.listingTitle || 'View Listing';
    banner.style.display = 'flex';
    
    // Fetch listing details for image
    API.get(`/api/listings/${convo.listingId}?t=${Date.now()}`, true).then(listing => {
      if (listing && listing.images && listing.images.length > 0 && thumb) {
        thumb.innerHTML = `<img src="${listing.images[0].imageUrl}" alt="" style="width:100%;height:100%;object-fit:cover;">`;
      }
    }).catch(() => {});
  }

  // Show chat panel (not empty state)
  const emptyState = document.getElementById('chat-empty-state');
  const chatMain   = document.getElementById('chat-main');
  if (emptyState) emptyState.style.display = 'none';
  if (chatMain)   chatMain.style.display   = 'flex';
}

/* ── Load messages ── */
async function loadMessages(convoId) {
  const area = document.getElementById('messages-area');
  if (!area) return;

  area.innerHTML = `
    <div class="msg-skeleton-wrap">
      <div class="msg-skeleton"><div class="msg-skeleton-avatar"></div><div class="msg-skeleton-bubble md"></div></div>
      <div class="msg-skeleton own"><div class="msg-skeleton-avatar"></div><div class="msg-skeleton-bubble sm"></div></div>
      <div class="msg-skeleton"><div class="msg-skeleton-avatar"></div><div class="msg-skeleton-bubble lg"></div></div>
      <div class="msg-skeleton own"><div class="msg-skeleton-avatar"></div><div class="msg-skeleton-bubble md"></div></div>
    </div>`;

  try {
    _messages = await API.get(`/api/conversations/${convoId}`, true) || [];
    renderMessages();
    scrollToBottom();
  } catch {
    area.innerHTML = `
      <div style="text-align:center;padding:var(--space-2xl);color:var(--ink-faint);">
        <p style="font-size:0.84rem;">Could not load messages.</p>
        <button class="btn btn-outline" onclick="loadMessages('${convoId}')" style="margin-top:var(--space-md);">Retry</button>
      </div>`;
  }
}

function renderMessages() {
  const area = document.getElementById('messages-area');
  if (!area || !_activeConvoId) return;

  const myId = String(_currentUser?.id || '');

  if (!_messages.length) {
    area.innerHTML = `
      <div style="text-align:center;padding:var(--space-2xl);color:var(--ink-faint);">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" style="width:36px;height:36px;margin:0 auto var(--space-md);display:block;opacity:0.3;">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
        <p style="font-size:0.84rem;">Say hi! Start the conversation.</p>
      </div>`;
    return;
  }

  let html = '';
  let prevDate = null;

  _messages.forEach(msg => {
    const isOwn     = String(msg.senderId) === myId;
    const msgDate   = msg.sentAt ? new Date(msg.sentAt).toDateString() : null;
    const initial   = (msg.senderUsername || '?').charAt(0).toUpperCase();
    const time      = msg.sentAt ? new Date(msg.sentAt).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }) : '';

    if (msgDate && msgDate !== prevDate) {
      const label = getDateLabel(msg.sentAt);
      html += `<div class="msg-date-sep"><span>${escH(label)}</span></div>`;
      prevDate = msgDate;
    }

    // Check for special message types (OFFER or RENTAL)
    if (msg.type === 'OFFER') {
      html += renderOfferCard(msg, isOwn, initial, time);
    } else if (msg.type === 'RENTAL') {
      html += renderRentalCard(msg, isOwn, initial, time);
    } else {
      // Regular text message
      html += `
        <div class="msg-row ${isOwn ? 'own' : ''}" data-msg-id="${escH(msg.id)}">
          ${!isOwn ? `<div class="msg-sender-avatar" aria-hidden="true">${escH(initial)}</div>` : ''}
          <div class="msg-bubble-wrap">
            ${!isOwn ? `<div class="msg-sender-name">${escH(msg.senderUsername || '')}</div>` : ''}
            <div class="msg-bubble">${escH(msg.content)}</div>
            ${time ? `<div class="msg-time">${time}</div>` : ''}
          </div>
        </div>`;
    }
  });

  area.innerHTML = html;

  // Attach event handlers for offer/rental action buttons
  attachCardActionHandlers();
}

/* ── Render Offer Card ── */
function renderOfferCard(msg, isOwn, initial, time) {
  const price = msg.price ? `₱${Number(msg.price).toLocaleString('en-PH')}` : '—';
  const statusClass = (msg.status || 'PENDING').toLowerCase();
  const statusLabel = msg.status || 'PENDING';
  
  const canRespond = !isOwn && (msg.status === 'PENDING' || msg.status === 'PENDING_ACCEPT');

  return `
    <div class="msg-row ${isOwn ? 'own' : ''}" data-msg-id="${escH(msg.id)}">
      ${!isOwn ? `<div class="msg-sender-avatar" aria-hidden="true">${escH(initial)}</div>` : ''}
      <div class="msg-bubble-wrap">
        ${!isOwn ? `<div class="msg-sender-name">${escH(msg.senderUsername || '')}</div>` : ''}
        <div class="offer-card" data-offer-id="${escH(msg.id)}" data-listing-id="${escH(msg.listingId || '')}" data-status="${escH(msg.status || 'PENDING')}">
          <div class="offer-card-header">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span class="offer-card-label">Offer</span>
            <span class="offer-status ${statusClass}">${statusLabel.replace('_',' ')}</span>
          </div>
          ${msg.listingTitle ? `
          <div class="offer-card-listing">
            <img class="offer-card-thumb" src="${escH(msg.listingImage || '')}" alt="" onerror="this.style.display='none'">
            <span class="offer-card-title">${escH(msg.listingTitle)}</span>
          </div>` : ''}
          <div class="offer-card-price">${price}</div>
          ${msg.message ? `<div class="offer-card-message">"${escH(msg.message)}"</div>` : ''}
          <div class="offer-card-actions">
            ${canRespond ? `
              <button class="btn btn-accept" onclick="handleOfferAction('${escH(msg.id)}', 'ACCEPT')">Accept</button>
              <button class="btn btn-reject" onclick="handleOfferAction('${escH(msg.id)}', 'REJECT')">Reject</button>
            ` : isOwn ? `
              <span style="font-size:0.72rem;color:var(--ink-faint);">Waiting for response...</span>
            ` : ''}
          </div>
        </div>
        ${time ? `<div class="msg-time">${time}</div>` : ''}
      </div>
    </div>`;
}

/* ── Render Rental Card ── */
function renderRentalCard(msg, isOwn, initial, time) {
  const statusClass = (msg.status || 'PENDING').toLowerCase();
  const statusLabel = msg.status || 'PENDING';
  const canRespond = !isOwn && (msg.status === 'PENDING' || msg.status === 'PENDING_ACCEPT');

  const startDate = msg.startDate ? new Date(msg.startDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }) : '—';
  const endDate = msg.endDate ? new Date(msg.endDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
  const totalPrice = msg.totalPrice ? `₱${Number(msg.totalPrice).toLocaleString('en-PH')}` : '—';

  return `
    <div class="msg-row ${isOwn ? 'own' : ''}" data-msg-id="${escH(msg.id)}">
      ${!isOwn ? `<div class="msg-sender-avatar" aria-hidden="true">${escH(initial)}</div>` : ''}
      <div class="msg-bubble-wrap">
        ${!isOwn ? `<div class="msg-sender-name">${escH(msg.senderUsername || '')}</div>` : ''}
        <div class="rental-card" data-rental-id="${escH(msg.id)}" data-listing-id="${escH(msg.listingId || '')}" data-status="${escH(msg.status || 'PENDING')}">
          <div class="rental-card-header">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <span class="rental-card-label">Rental Request</span>
            <span class="rental-status ${statusClass}">${statusLabel.replace('_',' ')}</span>
          </div>
          <div class="rental-card-dates">
            <div>
              <div class="rental-card-date-label">From</div>
              <div class="rental-card-date-value">${startDate}</div>
            </div>
            <div>
              <div class="rental-card-date-label">To</div>
              <div class="rental-card-date-value">${endDate}</div>
            </div>
          </div>
          <div class="rental-card-total">Total: ${totalPrice}</div>
          ${msg.message ? `<div class="rental-card-message">"${escH(msg.message)}"</div>` : ''}
          <div class="rental-card-actions">
            ${canRespond ? `
              <button class="btn btn-accept" onclick="handleRentalAction('${escH(msg.id)}', 'ACCEPT')">Accept</button>
              <button class="btn btn-reject" onclick="handleRentalAction('${escH(msg.id)}', 'REJECT')">Reject</button>
            ` : isOwn ? `
              <span style="font-size:0.72rem;color:var(--ink-faint);">Waiting for response...</span>
            ` : ''}
          </div>
        </div>
        ${time ? `<div class="msg-time">${time}</div>` : ''}
      </div>
    </div>`;
}

/* ── Handle Offer/Rental Actions ── */
async function handleOfferAction(messageId, action) {
  const card = document.querySelector(`.offer-card[data-msg-id="${messageId}"]`);
  if (!card) return;

  const btns = card.querySelectorAll('.btn');
  btns.forEach(b => { b.disabled = true; b.style.opacity = '0.5'; });

  try {
    await API.post(`/api/messages/offer/${messageId}/respond`, { action }, true);
    showToast(`Offer ${action.toLowerCase()}ed!`, 'success');
    
    // Update local message status
    const msg = _messages.find(m => m.id === messageId);
    if (msg) {
      msg.status = action === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED';
    }
    
    // Re-render messages
    renderMessages();
    scrollToBottom();
  } catch (err) {
    const msg = err?.message || 'Could not update offer.';
    showToast(msg, 'error');
    btns.forEach(b => { b.disabled = false; b.style.opacity = '1'; });
  }
}

async function handleRentalAction(messageId, action) {
  const card = document.querySelector(`.rental-card[data-rental-id="${messageId}"]`);
  if (!card) return;

  const btns = card.querySelectorAll('.btn');
  btns.forEach(b => { b.disabled = true; b.style.opacity = '0.5'; });

  try {
    await API.post(`/api/messages/rental/${messageId}/respond`, { action }, true);
    showToast(`Rental request ${action.toLowerCase()}ed!`, 'success');
    
    // Update local message status
    const msg = _messages.find(m => m.id === messageId);
    if (msg) {
      msg.status = action === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED';
    }
    
    // Re-render messages
    renderMessages();
    scrollToBottom();
  } catch (err) {
    const msg = err?.message || 'Could not update rental.';
    showToast(msg, 'error');
    btns.forEach(b => { b.disabled = false; b.style.opacity = '1'; });
  }
}

function attachCardActionHandlers() {
  // Additional card interactions can be added here
}

/* ── Handle rental action from listing page ── */
async function openRentalRequestInChat(convoId, listingId, preloadedListing) {
  let listing = preloadedListing;
  
  if (!listing) {
    try {
      listing = await API.get(`/api/listings/${listingId}?t=${Date.now()}`, true);
    } catch (err) {
      showToast('Could not load listing details.', 'error');
      return;
    }
  }
  
  if (!listing) return;
  
  const myId = String(_currentUser?.id || '');
  
  // Validate listing type is RENT
  if (listing.type !== 'RENT') {
    showToast('Rental requests are only for rent listings', 'error');
    return;
  }
  
  // Check if user is the seller
  if (listing.sellerId === myId || listing.seller?.id === myId) {
    showToast("You can't request to rent your own listing", 'error');
    return;
  }
  
  openRentModalFromChat(listing, convoId);
}

/* ── Rental modal from chat ── */
let _rentChatConvoId = null;
let _rentChatMinDays = null;

function openRentModalFromChat(listing, convoId) {
  if (!listing) return;
  
  _rentChatConvoId = convoId;
  _rentChatMinDays = null;
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
  
  _rentChatMinDays = minDays;
  
  const hasPriceNotes = priceNotes && priceNotes.length > 0;
  const dailyPrice = listing.price || listing.dailyPrice || listing.rentalPrice || 0;
  
  // Always show pricing dropdown for rental listings
  let priceOptionsHtml = `
    <div class="rental-field" id="rent-pricing-field">
      <label>Select Pricing Option *</label>
      <select id="rent-pricing-select" style="width:100%;padding:0.75rem;border:1.5px solid var(--border);border-radius:var(--radius);font-size:0.9rem;color:var(--ink);background:var(--bg);outline:none;">
        <option value="">Choose a pricing option...</option>
        <option value="daily">Daily Rate - ₱${Number(dailyPrice).toLocaleString()}/day</option>
        ${hasPriceNotes ? priceNotes.map(note => `<option value="${escH(note)}">${escH(note)}</option>`).join('') : ''}
      </select>
      <div class="rental-field-error">Please select a pricing option.</div>
    </div>`;
   
  // Remove existing if any
  document.getElementById('rent-modal-backdrop')?.remove();
  
  const backdrop = document.createElement('div');
  backdrop.id = 'rent-modal-backdrop';
  backdrop.innerHTML = `
    <div class="rental-modal" role="dialog" aria-modal="true" aria-label="Send Rental Request">
      <div class="rental-modal-header">
        <div>
          <p style="font-size:0.65rem;font-weight:900;letter-spacing:0.12em;text-transform:uppercase;color:var(--beaver);margin-bottom:4px;">Rental Request</p>
          <h2>${escH(listing.title || 'Listing')}</h2>
        </div>
        <button onclick="closeRentModalFromChat()" style="width:34px;height:34px;border-radius:var(--radius);display:flex;align-items:center;justify-content:center;color:var(--ink-muted);border:1.5px solid var(--border);background:var(--card);cursor:pointer;" aria-label="Close">
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
          <label>End Date * <span id="rent-end-note" style="font-size:0.7rem;font-weight:400;color:var(--ink-muted);display:none;"></span></label>
          <input type="date" id="rent-end-date" min="${today}">
          <div class="rental-field-error">End date must be after start date.</div>
        </div>

        <div class="rental-field" id="rent-deposit-field">
          <label>Assurance Deposit (₱) <span style="font-size:0.7rem;font-weight:400;color:var(--ink-muted);">- Refundable security based on rental value</span></label>
          <input type="number" id="rent-deposit" placeholder="0" min="0" step="1">
          <div class="rental-field-error">Please enter a valid deposit amount.</div>
        </div>

        <div class="rental-price-summary" id="rent-price-summary" style="display:none;">
          <div class="rental-price-row-item">
            <span class="label">Pricing</span>
            <span class="value" id="rent-pricing-display">—</span>
          </div>
          <div class="rental-price-row-item">
            <span class="label">Duration</span>
            <span class="value" id="rent-duration">—</span>
          </div>
          <div class="rental-price-row-item">
            <span class="label">Assurance Deposit <span style="font-size:0.65rem;color:var(--ink-muted);">(Refundable)</span></span>
            <span class="value" id="rent-deposit-preview">₱0</span>
          </div>
          <div class="rental-price-row-item">
            <span class="label" style="font-weight:800;color:var(--ink);">Rental Total <span style="font-size:0.65rem;font-weight:400;color:var(--ink-muted);">(Excl. Deposit)</span></span>
            <span class="value rental-price-total" id="rent-total-price">—</span>
          </div>
        </div>
      </div>
      <div class="rental-modal-footer">
        <button class="btn btn-ghost" onclick="closeRentModalFromChat()">Cancel</button>
        <button class="btn btn-beaver" id="rent-submit-btn" onclick="submitRentFromChat('${listing.id}', '${listing.sellerId}')">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
          </svg>
          <span class="btn-text">Send Request</span>
          <span class="btn-loader" style="display:none;width:14px;height:14px;border:2px solid rgba(255,255,255,0.5);border-top-color:white;border-radius:50%;animation:spin 0.6s linear infinite;"></span>
        </button>
      </div>
    </div>`;
  
  document.body.appendChild(backdrop);
  backdrop.classList.add('open');
  
  // Wire up date inputs and price calculation
  const startInput = document.getElementById('rent-start-date');
  const endInput = document.getElementById('rent-end-date');
  const depositInput = document.getElementById('rent-deposit');
  const pricingSelect = document.getElementById('rent-pricing-select');
  const endNote = document.getElementById('rent-end-note');
  
  const handlePricingChange = () => {
    const pricingValue = pricingSelect?.value;
    const startDate = startInput?.value;
    
    if (pricingValue && startDate && pricingValue !== 'daily') {
      const match = pricingValue.match(/(\d+)\s*(?:days?|d)/i);
      if (match) {
        const days = parseInt(match[1]);
        const startD = new Date(startDate);
        startD.setDate(startD.getDate() + days - 1);
        endInput.value = startD.toISOString().split('T')[0];
        endInput.min = startInput.value;
        endInput.disabled = true;
        if (endNote) {
          endNote.textContent = '(Auto-set based on pricing option)';
          endNote.style.display = 'inline';
        }
      }
    } else if (pricingValue === 'daily') {
      endInput.disabled = false;
      endInput.min = getTodayStr();
      endInput.value = '';
      if (endNote) {
        endNote.textContent = '';
        endNote.style.display = 'none';
      }
    } else {
      endInput.disabled = false;
      if (endNote) {
        endNote.textContent = '';
        endNote.style.display = 'none';
      }
    }
    calculateRentalPriceChatFromChat(listing, priceNotes, minDays);
  };
  
  const recalc = () => calculateRentalPriceChatFromChat(listing, priceNotes, minDays);
  startInput?.addEventListener('change', () => { updateEndDateMinFromChat(); handlePricingChange(); });
  endInput?.addEventListener('change', recalc);
  depositInput?.addEventListener('input', recalc);
  pricingSelect?.addEventListener('change', handlePricingChange);
  
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeRentModalFromChat();
  });
}

function closeRentModalFromChat() {
  const bd = document.getElementById('rent-modal-backdrop');
  if (!bd) return;
  bd.classList.remove('open');
  setTimeout(() => bd.remove(), 300);
  _rentChatConvoId = null;
}

function updateEndDateMinFromChat() {
  const start = document.getElementById('rent-start-date')?.value;
  const endInput = document.getElementById('rent-end-date');
  if (start && endInput) {
    const next = new Date(start);
    next.setDate(next.getDate() + 1);
    endInput.min = next.toISOString().split('T')[0];
    if (endInput.value && endInput.value <= start) endInput.value = '';
  }
}

function calculateRentalPriceChatFromChat(listing, priceNotes, minDays) {
  const start   = document.getElementById('rent-start-date')?.value;
  const end     = document.getElementById('rent-end-date')?.value;
  const deposit = parseFloat(document.getElementById('rent-deposit')?.value) || 0;
  const pricingSelect = document.getElementById('rent-pricing-select');
  const pricingValue = pricingSelect?.value || '';
  const summary = document.getElementById('rent-price-summary');

  if (!start || !end || !pricingValue) { 
    if (summary) summary.style.display = 'none'; 
    return; 
  }

  const startDate = new Date(start);
  const endDate   = new Date(end);
  if (endDate <= startDate) {
    if (summary) summary.style.display = 'none';
    return;
  }
  
  const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  
  let noteDays = null;
  if (pricingValue && pricingValue !== 'daily') {
    const noteMatch = pricingValue.match(/(\d+)\s*(?:days?|d)/i);
    if (noteMatch) {
      noteDays = parseInt(noteMatch[1]);
    }
  }
  
  const effectiveMinDays = noteDays || minDays;
  
  if (effectiveMinDays && days < effectiveMinDays) {
    if (summary) {
      summary.style.display = 'block';
      summary.innerHTML = `<div style="color:var(--error);text-align:center;padding:0.5rem;">${noteDays ? `This pricing option requires at least ${noteDays} days` : `Minimum rental is ${minDays} days`}</div>`;
    }
    return;
  }
  
  const dailyPrice = listing.price || listing.dailyPrice || listing.rentalPrice || 0;
  let total = 0;
  let displayPrice = '';
  let notePrice = null;
  
  if (pricingValue === 'daily') {
    total = parseFloat(dailyPrice) * days;
    displayPrice = `₱${Number(dailyPrice).toLocaleString()} / day`;
  } else if (pricingValue && pricingValue !== '') {
    const numbers = pricingValue.match(/\d+/g);
    if (numbers && numbers.length > 0) {
      const priceNum = numbers.find(n => parseInt(n) >= 100);
      if (priceNum) {
        notePrice = parseInt(priceNum, 10);
        total = notePrice;
        displayPrice = `₱${Number(notePrice).toLocaleString()}`;
      }
    }
  }
  
  if (!total || isNaN(total)) {
    total = 0;
    displayPrice = '—';
  }

  if (summary) summary.style.display = 'block';
  const fmt = (n) => '₱' + Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  const el = (id) => document.getElementById(id);
  if (el('rent-pricing-display'))  el('rent-pricing-display').textContent  = displayPrice || '—';
  if (el('rent-duration'))        el('rent-duration').textContent        = notePrice ? 'Fixed Package' : (pricingValue === 'daily' ? `${days} day${days !== 1 ? 's' : ''}` : '—');
  if (el('rent-deposit-preview')) el('rent-deposit-preview').textContent = fmt(deposit);
  if (el('rent-total-price'))      el('rent-total-price').textContent     = fmt(total);
}

async function submitRentFromChat(listingId, sellerId) {
  const start   = document.getElementById('rent-start-date')?.value;
  const end     = document.getElementById('rent-end-date')?.value;
  const deposit = parseFloat(document.getElementById('rent-deposit')?.value) || 0;
  const pricingSelect = document.getElementById('rent-pricing-select');
  const pricingValue = pricingSelect?.value || '';

  // Validate
  let valid = true;
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
  
  const today = getTodayStr();
  if (start && start < today) {
    startField?.classList.add('has-error');
    valid = false;
  }
  
  let noteMinDays = null;
  if (pricingValue && pricingValue !== 'daily') {
    const noteMatch = pricingValue.match(/(\d+)\s*(?:days?|d)/i);
    if (noteMatch) {
      noteMinDays = parseInt(noteMatch[1]);
    }
  }
  
  const effectiveMinDays = noteMinDays || _rentChatMinDays;
  
  if (effectiveMinDays && start && end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    if (days < effectiveMinDays) {
      endField?.classList.add('has-error');
      endField.querySelector('.rental-field-error').textContent = noteMinDays ? `This pricing option requires at least ${noteMinDays} days` : `Minimum rental is ${_rentChatMinDays} days.`;
      valid = false;
    }
  }
  
  if (!valid) {
    return;
  }

  // Check availability first
  try {
    const available = await API.get(`/api/listings/${listingId}/availability?startDate=${start}&endDate=${end}`, false);
    if (available === false) {
      showToast('These dates are not available. Please choose different dates.', 'error');
      return;
    }
  } catch (e) {
    // Availability check failed, continue anyway
  }

  const btn = document.getElementById('rent-submit-btn');
  const btnText   = btn?.querySelector('.btn-text');
  const btnLoader = btn?.querySelector('.btn-loader');
  if (btn) btn.disabled = true;
  if (btnText)   btnText.style.display   = 'none';
  if (btnLoader) btnLoader.style.display = 'inline-block';
  
try {
    const response = await API.post('/api/rental', {
      listingId,
      startDate: start,
      endDate: end,
      totalPrice: total || null,
      deposit: deposit || null,
    }, true);

    // Send notification message to conversation
    if (listing && listing.title) {
      try {
        const msgContent = `I've sent a rental request for "${listing.title}". Please check your rental requests.`;
        await API.post('/api/conversations/messages/send', {
          conversationId: _rentChatConvoId,
          content: msgContent,
          messageType: 'TEXT'
        }, true);
      } catch (e) {
        showToast('Could not send notification. Please try again.', 'error');
        return;
      }
    }

    showToast('Rental request sent! The seller will be notified.', 'success');
    closeRentModalFromChat();

    // Refresh messages to see the rental card
    if (_rentChatConvoId) {
      await loadMessages(_rentChatConvoId);
    }

  } catch (err) {
    showToast('Request failed - you may have already requested on this item', 'error');
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

/* ── Send a message ── */
async function sendMessage() {
  const textarea = document.getElementById('chat-textarea');
  const content  = textarea?.value?.trim();
  if (!content || !_activeConvoId) return;

  const btn = document.getElementById('chat-send-btn');
  if (btn) btn.disabled = true;

  // Optimistic UI
  const tempId = 'tmp_' + Date.now();
  const optimistic = {
    id: tempId,
    conversationId: _activeConvoId,
    senderId: _currentUser?.id,
    senderUsername: _currentUser?.username || 'You',
    content,
    isRead: false,
    sentAt: new Date().toISOString(),
  };

  _messages.push(optimistic);
  renderMessages();
  scrollToBottom();

  if (textarea) {
    textarea.value = '';
    autoResizeTextarea(textarea);
  }

  try {
    const sent = await API.post('/api/conversations/messages/send', {
      conversationId: _activeConvoId,
      content,
    }, true);

    // Replace optimistic with real message
    const idx = _messages.findIndex(m => m.id === tempId);
    if (idx > -1 && sent) {
      _messages[idx] = sent;
      renderMessages();
    }

    // Update conversations list last message
    const convo = _conversations.find(c => c.conversationId === _activeConvoId);
    if (convo) {
      convo.lastMessage    = content;
      convo.lastMessageTime = sent?.sentAt || new Date().toISOString();
      renderConversationsList();
    }

  } catch (err) {
    // Remove optimistic message
    _messages = _messages.filter(m => m.id !== tempId);
    renderMessages();

    const msg = err?.message || 'Could not send message.';
    showToast(msg, 'error');
    if (textarea) {
      textarea.value = content;
      autoResizeTextarea(textarea);
    }
  } finally {
    if (btn) btn.disabled = false;
    scrollToBottom();
  }
}

/* ── Polling ── */
function startPolling(convoId) {
  _pollInterval = setInterval(async () => {
    if (!convoId || convoId !== _activeConvoId) { stopPolling(); return; }
    try {
      const fresh = await API.get(`/api/conversations/${convoId}`, true) || [];
      if (fresh.length > _messages.length) {
        _messages = fresh;
        renderMessages();
        scrollToBottom();
        // Mark read
        await API.post(`/api/conversations/${convoId}/read`, null, true);
      }
    } catch {}
  }, 5000);
}

function stopPolling() {
  if (_pollInterval) {
    clearInterval(_pollInterval);
    _pollInterval = null;
  }
}

/* ── Helpers ── */
function scrollToBottom() {
  const area = document.getElementById('messages-area');
  if (area) requestAnimationFrame(() => { area.scrollTop = area.scrollHeight; });
}

function autoResizeTextarea(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

function formatRelTime(dateStr) {
  if (!dateStr) return '';
  try {
    const date   = new Date(dateStr);
    const diff   = Date.now() - date.getTime();
    const mins   = Math.floor(diff / 60000);
    const hours  = Math.floor(diff / 3600000);
    const days   = Math.floor(diff / 86400000);
    if (mins < 1)  return 'now';
    if (mins < 60) return `${mins}m`;
    if (hours < 24)return `${hours}h`;
    if (days < 7)  return `${days}d`;
    return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
  } catch { return ''; }
}

function getDateLabel(dateStr) {
  if (!dateStr) return '';
  const d     = new Date(dateStr);
  const today = new Date();
  const yest  = new Date(today); yest.setDate(yest.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yest.toDateString())  return 'Yesterday';
  return d.toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' });
}

function escH(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

window.sendMessage       = sendMessage;
window.openConversation  = openConversation;
window.loadConversations = loadConversations;
window.openOfferInChat    = openOfferInChat;
window.openRentInChat    = openRentInChat;
window.closeOfferModalInChat = closeOfferModalInChat;
window.closeRentModalInChat = closeRentModalInChat;
window.closeRentModalFromChat = closeRentModalFromChat;

/* ── Offer/Rent Action Buttons in Chat ── */
let _currentConvoListing = null;

async function showChatInputActions(convoId) {
  const actionsContainer = document.getElementById('chat-input-actions');
  if (!actionsContainer) return;
  
  try {
    const myId = String(_currentUser?.id || '');
    const convo = _conversations.find(c => c.conversationId === convoId);
    if (convo && convo.listingId) {
      const listing = await API.get(`/api/listings/${convo.listingId}?t=${Date.now()}`, true);
      _currentConvoListing = listing;
      
      // Only show for BUYER (not seller) with available listing
      const isSeller = String(convo.sellerId) === myId;
      if (listing && listing.status !== 'ARCHIVED' && !isSeller) {
        actionsContainer.style.display = 'flex';
      } else {
        actionsContainer.style.display = 'none';
      }
    } else {
      actionsContainer.style.display = 'none';
    }
  } catch {
    actionsContainer.style.display = 'none';
  }
}

function openOfferInChat() {
  if (!_currentConvoListing) return;
  
  const listing = _currentConvoListing;
  const myId = String(_currentUser?.id || '');
  
  // Check if listing is for sale (not rent)
  if (listing.type !== 'SELL') {
    showToast('Offers are only for sale listings', 'error');
    return;
  }
  
  // Check if user is the seller
  if (listing.sellerId === myId || listing.seller?.id === myId) {
    showToast("You can't make an offer on your own listing", 'error');
    return;
  }
  
  // Remove existing modal
  document.getElementById('offer-modal-backdrop')?.remove();
  
  const backdrop = document.createElement('div');
  backdrop.id = 'offer-modal-backdrop';
  backdrop.className = 'rental-modal-backdrop';
  backdrop.innerHTML = `
    <div class="rental-modal" role="dialog" aria-modal="true" aria-label="Make an Offer">
      <div class="rental-modal-header">
        <div>
          <p style="font-size:0.65rem;font-weight:900;letter-spacing:0.12em;text-transform:uppercase;color:var(--beaver);margin-bottom:4px;">Make an Offer</p>
          <h2>${escH(listing.title || 'Listing')}</h2>
        </div>
        <button onclick="closeOfferModalInChat()" style="width:34px;height:34px;border-radius:var(--radius);display:flex;align-items:center;justify-content:center;color:var(--ink-muted);border:1.5px solid var(--border);background:var(--card);cursor:pointer;" aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="rental-modal-body" id="chat-offer-modal-body" style="max-height:300px;height:300px;overflow-y:scroll;scrollbar-width:thin;scrollbar-color:#d4826a #eee;">
        <style>
          #chat-offer-modal-body::-webkit-scrollbar{width:8px}
          #chat-offer-modal-body::-webkit-scrollbar-track{background:#eee;border-radius:4px}
          #chat-offer-modal-body::-webkit-scrollbar-thumb{background:#d4826a;border-radius:4px}
          #chat-offer-modal-body::-webkit-scrollbar-thumb:hover{background:#b56b54}
        </style>
        
        <div class="rental-price-summary" style="display:flex;align-items:center;gap:var(--space-md);padding:var(--space-md);background:var(--bg-alt);border-radius:var(--radius);margin-bottom:var(--space-lg);">
          <div style="width:60px;height:60px;border-radius:var(--radius);overflow:hidden;background:var(--border);flex-shrink:0;">
            ${listing.images && listing.images[0] ? `<img src="${listing.images[0].imageUrl}" style="width:100%;height:100%;object-fit:cover;">` : ''}
          </div>
          <div style="flex:1;min-width:0;">
            <div style="font-weight:700;color:var(--ink);font-size:0.9rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escH(listing.title)}</div>
            <div style="font-size:0.8rem;color:var(--ink-muted);">Listed Price: ₱${Number(listing.price || 0).toLocaleString()}</div>
          </div>
        </div>
        
        <div class="rental-field" id="offer-price-field">
          <label>Your Offer (₱) *</label>
          <input type="number" id="offer-price-input" placeholder="Enter your offer amount" min="1" step="1">
          <div class="rental-field-error">Please enter a valid price greater than ₱0.</div>
        </div>
        
        <div class="rental-field" id="offer-message-field">
          <label>Message (Optional)</label>
          <textarea id="offer-message-input" placeholder="Add a message to the seller..." rows="3" style="width:100%;padding:0.75rem;border:1.5px solid var(--border);border-radius:var(--radius);font-size:0.9rem;color:var(--ink);background:var(--bg);outline:none;resize:vertical;font-family:var(--font-body);"></textarea>
        </div>
        
        <div id="offer-status" style="display:none;padding:0.75rem 1rem;border-radius:var(--radius);font-size:0.84rem;font-weight:700;margin-bottom:var(--space-md);"></div>
      </div>
      <div class="rental-modal-footer">
        <button class="btn btn-ghost" onclick="closeOfferModalInChat()">Cancel</button>
        <button class="btn btn-beaver" id="submit-offer-btn-chat" onclick="submitOfferInChat()">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
          </svg>
          <span class="btn-text">Send Offer</span>
          <span class="btn-loader" style="display:none;width:14px;height:14px;border:2px solid rgba(255,255,255,0.5);border-top-color:white;border-radius:50%;animation:spin 0.6s linear infinite;"></span>
        </button>
      </div>
    </div>`;
  
  document.body.appendChild(backdrop);
  requestAnimationFrame(() => backdrop.classList.add('open'));
  
  // Focus price input
  document.getElementById('offer-price-input')?.focus();
  
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeOfferModalInChat();
  });
}

function closeOfferModalInChat() {
  const bd = document.getElementById('offer-modal-backdrop');
  if (!bd) return;
  bd.classList.remove('open');
  setTimeout(() => bd.remove(), 300);
}

async function submitOfferInChat() {
  const priceInput = document.getElementById('offer-price-input');
  const messageInput = document.getElementById('offer-message-input');
  const price = parseFloat(priceInput?.value);
  const message = messageInput?.value;
  const btn = document.getElementById('submit-offer-btn-chat');
  const btnText = btn?.querySelector('.btn-text');
  const btnLoader = btn?.querySelector('.btn-loader');
  const priceField = document.getElementById('offer-price-field');
  
  // Validate
  let valid = true;
  
  if (!price || price <= 0) {
    priceField?.classList.add('has-error');
    valid = false;
  } else {
    priceField?.classList.remove('has-error');
  }
  
  if (!valid) return;
  
  if (btn) btn.disabled = true;
  if (btnText) btnText.style.display = 'none';
  if (btnLoader) btnLoader.style.display = 'inline-block';
  
  try {
    const response = await API.post(`/api/offers/listing/${_currentConvoListing.id}`, {
      offeredPrice: price,
      message: message
    }, true);
    
    // Send notification message to conversation
    if (_currentConvoListing && _currentConvoListing.title) {
      try {
        const msgContent = `I've made an offer of ₱${Number(price).toLocaleString()} for "${_currentConvoListing.title}". Please review my offer.`;
        await API.post('/api/conversations/messages/send', {
          conversationId: _activeConvoId,
          content: msgContent
        }, true);
      } catch (e) {
        showToast('Could not send notification. Please try again.', 'error');
        return;
      }
    }
    
    showToast('Offer sent!', 'success');
    closeOfferModalInChat();
    loadMessages(_activeConvoId);
    
  } catch (err) {
    handleApiError(err, { showToast: true });
    const statusEl = document.getElementById('offer-status');
    if (statusEl) {
      statusEl.textContent = err?.message || 'Error submitting offer';
      statusEl.style.display = 'block';
      statusEl.style.background = 'rgba(192,57,43,0.08)';
      statusEl.style.color = 'var(--error)';
      statusEl.style.border = '1.5px solid rgba(192,57,43,0.2)';
    }
} finally {
    if (btn) btn.disabled = false;
    if (btnText) btnText.style.display = 'inline';
    if (btnLoader) btnLoader.style.display = 'none';
  }
}

function openRentInChat() {
  if (!_currentConvoListing) return;
  
  const listing = _currentConvoListing;
  const myId = String(_currentUser?.id || '');
  
  // Check if listing is for rent
  if (listing.type !== 'RENT') {
    showToast('Rental requests are only for rent listings', 'error');
    return;
  }
  
  // Check if user is the seller
  if (listing.sellerId === myId || listing.seller?.id === myId) {
    showToast("You can't request to rent your own listing", 'error');
    return;
  }
  
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
  
  _rentChatMinDays = minDays;
  
  const hasPriceNotes = priceNotes && priceNotes.length > 0;
  const dailyPrice = listing.price || listing.dailyPrice || listing.rentalPrice || 0;
  const today = getTodayStrChat();
  
  // Pricing dropdown
  let priceOptionsHtml = `
    <div class="rental-field" id="rent-pricing-field">
      <label>Select Pricing Option *</label>
      <select id="rent-pricing-select" style="width:100%;padding:0.75rem;border:1.5px solid var(--border);border-radius:var(--radius);font-size:0.9rem;color:var(--ink);background:var(--bg);outline:none;">
        <option value="">Choose a pricing option...</option>
        <option value="daily">Daily Rate - ₱${Number(dailyPrice).toLocaleString()}/day</option>
        ${hasPriceNotes ? priceNotes.map(note => `<option value="${escH(note)}">${escH(note)}</option>`).join('') : ''}
      </select>
      <div class="rental-field-error">Please select a pricing option.</div>
    </div>`;
  
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
        <button onclick="closeRentModalInChat()" style="width:34px;height:34px;border-radius:var(--radius);display:flex;align-items:center;justify-content:center;color:var(--ink-muted);border:1.5px solid var(--border);background:var(--card);cursor:pointer;" aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="rental-modal-body" id="chat-rent-modal-body" style="max-height:300px;height:300px;overflow-y:scroll;scrollbar-width:thin;scrollbar-color:#d4826a #eee;">
        <style>
          #chat-rent-modal-body::-webkit-scrollbar{width:8px}
          #chat-rent-modal-body::-webkit-scrollbar-track{background:#eee;border-radius:4px}
          #chat-rent-modal-body::-webkit-scrollbar-thumb{background:#d4826a;border-radius:4px}
          #chat-rent-modal-body::-webkit-scrollbar-thumb:hover{background:#b56b54}
        </style>
        <div id="rent-modal-status" style="display:none;padding:0.75rem 1rem;border-radius:var(--radius);font-size:0.84rem;font-weight:700;margin-bottom:var(--space-md);"></div>

        ${priceOptionsHtml}

        <div class="rental-field" id="rent-start-field">
          <label>Start Date *${minDays ? ` (Min: ${minDays} days)` : ''}</label>
          <input type="date" id="rent-start-date" min="${today}">
          <div class="rental-field-error">Please select a valid start date.</div>
        </div>

        <div class="rental-field" id="rent-end-field">
          <label>End Date * <span id="rent-end-note" style="font-size:0.7rem;font-weight:400;color:var(--ink-muted);display:none;"></span></label>
          <input type="date" id="rent-end-date" min="${today}">
          <div class="rental-field-error">End date must be after start date.</div>
        </div>

        <div class="rental-field" id="rent-deposit-field">
          <label>Assurance Deposit (₱) <span style="font-size:0.7rem;font-weight:400;color:var(--ink-muted);">- Refundable security based on rental value</span></label>
          <input type="number" id="rent-deposit" placeholder="0" min="0" step="1">
          <div class="rental-field-error">Please enter a valid deposit amount.</div>
        </div>

        <div class="rental-price-summary" id="rent-price-summary" style="display:none;">
          <div class="rental-price-row-item">
            <span class="label">Pricing</span>
            <span class="value" id="rent-pricing-display">—</span>
          </div>
          <div class="rental-price-row-item">
            <span class="label">Duration</span>
            <span class="value" id="rent-duration">—</span>
          </div>
          <div class="rental-price-row-item">
            <span class="label">Assurance Deposit <span style="font-size:0.65rem;color:var(--ink-muted);">(Refundable)</span></span>
            <span class="value" id="rent-deposit-preview">₱0</span>
          </div>
          <div class="rental-price-row-item">
            <span class="label" style="font-weight:800;color:var(--ink);">Rental Total <span style="font-size:0.65rem;font-weight:400;color:var(--ink-muted);">(Excl. Deposit)</span></span>
            <span class="value rental-price-total" id="rent-total-price">—</span>
          </div>
        </div>
      </div>
      <div class="rental-modal-footer">
        <button class="btn btn-ghost" onclick="closeRentModalInChat()">Cancel</button>
        <button class="btn btn-beaver" id="rent-submit-btn-chat" onclick="submitRentInChat()">
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
  
  const startInput = document.getElementById('rent-start-date');
  const endInput = document.getElementById('rent-end-date');
  const depositInput = document.getElementById('rent-deposit');
  const pricingSelect = document.getElementById('rent-pricing-select');
  const endNote = document.getElementById('rent-end-note');
  
  // Auto-set end date based on price note selection
  const handlePricingChange = () => {
    const pricingValue = pricingSelect?.value;
    const startDate = startInput?.value;
    
    if (pricingValue && startDate && pricingValue !== 'daily') {
      // Parse days from price note (e.g., "3 days = ₱500")
      const match = pricingValue.match(/(\d+)\s*(?:days?|d)/i);
      if (match) {
        const days = parseInt(match[1]);
        const startD = new Date(startDate);
        startD.setDate(startD.getDate() + days - 1);
        endInput.value = startD.toISOString().split('T')[0];
        endInput.min = startInput.value;
        endInput.disabled = true;
        if (endNote) {
          endNote.textContent = '(Auto-set - same price for extended days)';
          endNote.style.display = 'inline';
        }
      }
    } else if (pricingValue === 'daily') {
      endInput.disabled = false;
      endInput.min = getTodayStrChat();
      endInput.value = '';
      if (endNote) {
        endNote.textContent = '';
        endNote.style.display = 'none';
      }
    } else {
      endInput.disabled = false;
      if (endNote) {
        endNote.textContent = '';
        endNote.style.display = 'none';
      }
    }
    calculateRentalPriceChatFromChat(listing, priceNotes, minDays);
  };
  
  const recalc = () => calculateRentalPriceChatFromChat(listing, priceNotes, minDays);
  
  pricingSelect?.addEventListener('change', handlePricingChange);
  startInput?.addEventListener('change', () => { 
    updateEndDateMinChat(); 
    handlePricingChange();
  });
  endInput?.addEventListener('change', recalc);
  depositInput?.addEventListener('input', recalc);
  
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeRentModalInChat();
  });
}

function closeRentModalInChat() {
  const bd = document.getElementById('rent-modal-backdrop');
  if (!bd) return;
  bd.classList.remove('open');
  setTimeout(() => bd.remove(), 300);
}

function getTodayStrChat() {
  return new Date().toISOString().split('T')[0];
}

// Alias for compatibility
function getTodayStr() {
  return getTodayStrChat();
}

function updateEndDateMinChat() {
  const start = document.getElementById('rent-start-date')?.value;
  const endInput = document.getElementById('rent-end-date');
  if (start && endInput) {
    const next = new Date(start);
    next.setDate(next.getDate() + 1);
    endInput.min = next.toISOString().split('T')[0];
    if (endInput.value && endInput.value <= start) endInput.value = '';
  }
}

function calculateRentalPriceChat(pricePerDay, priceNotes) {
  const start   = document.getElementById('rent-start-date')?.value;
  const end     = document.getElementById('rent-end-date')?.value;
  const deposit = parseFloat(document.getElementById('rent-deposit')?.value) || 0;
  const summary = document.getElementById('rent-price-summary');

  if (!start || !end) { if (summary) summary.style.display = 'none'; return; }

  const startDate = new Date(start);
  const endDate   = new Date(end);
  const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

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

async function submitRentInChat() {
  const startInput = document.getElementById('rent-start-date');
  const endInput = document.getElementById('rent-end-date');
  const depositInput = document.getElementById('rent-deposit');
  const pricingSelect = document.getElementById('rent-pricing-select');
  const btn = document.getElementById('rent-submit-btn-chat');
  const btnText = btn?.querySelector('.btn-text');
  const btnLoader = btn?.querySelector('.btn-loader');
  const statusEl = document.getElementById('rent-modal-status');
  
  const start = startInput?.value;
  const end = endInput?.value;
  const deposit = parseFloat(depositInput?.value) || 0;
  const pricingValue = pricingSelect?.value || '';
  
  const startField = document.getElementById('rent-start-field');
  const endField = document.getElementById('rent-end-field');
  const depositField = document.getElementById('rent-deposit-field');
  const pricingField = document.getElementById('rent-pricing-field');
  
  [startField, endField, depositField, pricingField].forEach(f => f?.classList.remove('has-error'));
  
  let valid = true;
  const today = getTodayStrChat();
  
  if (!pricingValue) { pricingField?.classList.add('has-error'); valid = false; }
  if (!start) { startField?.classList.add('has-error'); valid = false; }
  if (!end) { endField?.classList.add('has-error'); valid = false; }
  if (start && start < today) {
    startField?.classList.add('has-error');
    startField.querySelector('.rental-field-error').textContent = 'Start date cannot be in the past.';
    valid = false;
  }
  if (start && end && end <= start) {
    endField?.classList.add('has-error');
    endField.querySelector('.rental-field-error').textContent = 'End date must be after start date.';
    valid = false;
  }
  
  // Validate minimum days
  let noteMinDaysSubmit = null;
  if (pricingValue && pricingValue !== 'daily') {
    const noteMatch = pricingValue.match(/(\d+)\s*(?:days?|d)/i);
    if (noteMatch) {
      noteMinDaysSubmit = parseInt(noteMatch[1]);
    }
  }
  
  const effectiveMinDaysSubmit = noteMinDaysSubmit || _rentChatMinDays;
  
  if (effectiveMinDaysSubmit && start && end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    if (days < effectiveMinDaysSubmit) {
      endField?.classList.add('has-error');
      endField.querySelector('.rental-field-error').textContent = noteMinDaysSubmit ? `This pricing option requires at least ${noteMinDaysSubmit} days` : `Minimum rental is ${_rentChatMinDays} days.`;
      valid = false;
    }
  }
  
  if (!valid) { 
    return; 
  }
  
  // Check availability first
  try {
    const listingIdForAvail = _currentConvoListing?.id;
    if (listingIdForAvail) {
      const available = await API.get(`/api/listings/${listingIdForAvail}/availability?startDate=${start}&endDate=${end}`, false);
      if (available === false) {
        showToast('These dates are not available. Please choose different dates.', 'error');
        return;
      }
    }
  } catch (e) {
    // Availability check failed, continue anyway
  }
  
  if (btn) btn.disabled = true;
  if (btnText) btnText.style.display = 'none';
  if (btnLoader) btnLoader.style.display = 'inline-block';
  
  try {
    const dailyPrice = _currentConvoListing.price || _currentConvoListing.dailyPrice || _currentConvoListing.rentalPrice || 0;
    const startDateCalc = new Date(start);
    const endDateCalc = new Date(end);
    const daysCalc = Math.ceil((endDateCalc - startDateCalc) / (1000 * 60 * 60 * 24)) + 1;
    
    let rentalTotal = 0;
    if (pricingValue === 'daily') {
      rentalTotal = parseFloat(dailyPrice) * daysCalc;
    } else if (pricingValue && pricingValue !== '') {
      const numbers = pricingValue.match(/\d+/g);
      if (numbers && numbers.length > 0) {
        const priceNum = numbers.find(n => parseInt(n) >= 100);
        if (priceNum) rentalTotal = parseInt(priceNum, 10);
      }
    }
    
    const response = await API.post('/api/rental', {
      listingId: _currentConvoListing.id,
      startDate: start,
      endDate: end,
      totalPrice: rentalTotal || null,
      deposit: deposit || null
    }, true);
    
    // Send notification message to conversation
    if (_currentConvoListing && _currentConvoListing.title) {
      try {
        const msgContent = `I've sent a rental request for "${_currentConvoListing.title}". Please check your rental requests.`;
        await API.post('/api/conversations/messages/send', {
          conversationId: _activeConvoId,
          content: msgContent
        }, true);
      } catch (e) {
        showToast('Could not send notification. Please try again.', 'error');
        return;
      }
    }
    
    showToast('Rental request sent!', 'success');
    closeRentModalInChat();
    loadMessages(_activeConvoId);
    
  } catch (err) {
    showToast('Request failed - you may have already requested on this item', 'error');
  } finally {
    if (btn) btn.disabled = false;
    if (btnText) btnText.style.display = 'inline';
    if (btnLoader) btnLoader.style.display = 'none';
  }
}

/* ── Report Feature ── */
function openReportModal(type, id) {
  document.getElementById('report-modal')?.remove();
  
  const modal = document.createElement('div');
  modal.id = 'report-modal';
  modal.innerHTML = `
    <div style="position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:1000;display:flex;align-items:center;justify-content:center;">
      <div style="background:var(--card);border-radius:var(--radius-xl);width:min(400px,90%);padding:var(--space-xl);box-shadow:var(--shadow-lg);">
        <h3 style="margin:0 0 var(--space-md);color:var(--ink);">Report ${type === 'listing' ? 'Listing' : type === 'user' ? 'User' : 'Message'}</h3>
        <div style="margin-bottom:var(--space-md);">
          <label style="display:block;font-size:0.75rem;font-weight:800;text-transform:uppercase;letter-spacing:0.05em;color:var(--ink-faint);margin-bottom:var(--space-xs);">Reason</label>
          <select id="report-reason" style="width:100%;padding:0.75rem;border:2px solid var(--border);border-radius:var(--radius);font-size:0.9rem;background:var(--bg);">
            <option value="">Select a reason...</option>
            <option value="SPAM">Spam</option>
            <option value="INAPPROPRIATE">Inappropriate content</option>
            <option value="FAKE">Fake or misleading</option>
            <option value="HARASSMENT">Harassment</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div style="margin-bottom:var(--space-lg);">
          <label style="display:block;font-size:0.75rem;font-weight:800;text-transform:uppercase;letter-spacing:0.05em;color:var(--ink-faint);margin-bottom:var(--space-xs);">Description</label>
          <textarea id="report-description" rows="4" placeholder="Describe the issue..." style="width:100%;padding:0.75rem;border:2px solid var(--border);border-radius:var(--radius);font-size:0.9rem;resize:vertical;"></textarea>
        </div>
        <div style="display:flex;gap:var(--space-sm);justify-content:flex-end;">
          <button class="btn btn-ghost" onclick="document.getElementById('report-modal').remove()">Cancel</button>
          <button class="btn btn-primary" style="background:var(--error);" onclick="submitReport('${type}', '${id}')">Submit Report</button>
        </div>
      </div>
    </div>`;
  
  document.body.appendChild(modal);
}

async function submitReport(type, id) {
  const reason = document.getElementById('report-reason')?.value;
  const description = document.getElementById('report-description')?.value;
  
  if (!reason) {
    showToast('Please select a reason', 'error');
    return;
  }
  
  try {
    await API.post('/api/reports', {
      type: type,
      targetId: id,
      reason: reason,
      description: description
    }, true);
    
    showToast('Report submitted. Thank you!', 'success');
    document.getElementById('report-modal')?.remove();
  } catch (err) {
    handleApiError(err, { showToast: true });
  }
}

async function sendStructuredMessage(content) {
  const textarea = document.getElementById('chat-textarea');
  const btn = document.getElementById('chat-send-btn');
  if (btn) btn.disabled = true;
  
  try {
    await API.post('/api/conversations/messages/send', {
      conversationId: _activeConvoId,
      content,
      messageType: 'OFFER' // Backend will determine type from content
    }, true);
    
    showToast('Sent!', 'success');
    loadMessages(_activeConvoId);
} catch (err) {
    showToast('Request failed - you may have already requested on this item', 'error');
  } finally {
    if (btn) btn.disabled = false;
  }
}