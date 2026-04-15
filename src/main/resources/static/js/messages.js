// messages.js - Fixed to match your API pattern

let currentConversationId = null;
let currentListing = null;
let currentOtherUserId = null;
let conversations = [];
let pollingInterval = null;

function showToast(message, type = 'info') {
  if (window.showToast) window.showToast(message, type);
  else console.log(`[${type}] ${message}`);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

function formatMessageTime(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function formatConvoTime(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' });
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function getCurrentUserId() {
  const user = API.getUser();
  if (user && user.id) return user.id;
  const token = API.getToken();
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || payload.sub || payload.id;
    } catch (e) {}
  }
  return null;
}

// ========== Load Conversations ==========
async function loadConversations() {
  const container = document.getElementById('conversations-list');
  if (!container) return;
  container.innerHTML = `
    <div class="convo-skeleton"><div class="skeleton-avatar"></div><div class="skeleton-text"><div class="skeleton-line"></div><div class="skeleton-line short"></div></div></div>
    <div class="convo-skeleton"><div class="skeleton-avatar"></div><div class="skeleton-text"><div class="skeleton-line"></div><div class="skeleton-line short"></div></div></div>
  `;
  try {
    const data = await API.get('/api/conversations', true);
    conversations = data || [];
    console.log('Conversations loaded:', conversations);
    renderConversations(conversations);
  } catch (err) {
    console.error('Load conversations error:', err);
    container.innerHTML = `<div class="convo-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg><p>Could not load conversations</p><p>${err.message || 'Unknown error'}</p></div>`;
  }
}

function renderConversations(conversationsList) {
  const container = document.getElementById('conversations-list');
  if (!container) return;
  if (!conversationsList.length) {
    container.innerHTML = `<div class="convo-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 12h8M12 8v8M20 12a8 8 0 11-16 0 8 8 0 0116 0z"/></svg><p>No conversations yet</p><p style="font-size:0.8rem">Message a seller to start chatting</p></div>`;
    return;
  }
  container.innerHTML = conversationsList.map(conv => {
    // Normalize property names – adjust according to your backend response
    const convoId = conv.id || conv.conversationId;
    const otherUserId = conv.otherUserId || conv.participant?.id;
    const listingId = conv.listingId || conv.listing?.id;
    const listingTitle = conv.listingTitle || conv.listing?.title || 'Listing';
    const otherUserName = conv.otherUserName || conv.otherUser?.username || 'User';
    const lastMessage = conv.lastMessage || conv.lastMessageContent || 'No messages yet';
    const lastMessageTime = conv.lastMessageTime || conv.updatedAt;
    const unreadCount = conv.unreadCount || 0;
    const otherUserAvatar = conv.otherUserAvatar || conv.otherUser?.avatar;

    if (!convoId) {
      console.warn('Conversation missing id:', conv);
      return '';
    }

    return `
      <div class="convo-item ${currentConversationId === convoId ? 'active' : ''}" 
           data-convo-id="${convoId}" 
           data-other-user-id="${otherUserId || ''}" 
           data-listing-id="${listingId || ''}">
        <div class="convo-avatar">${otherUserAvatar ? `<img src="${escapeHtml(otherUserAvatar)}" alt="">` : (otherUserName?.charAt(0).toUpperCase() || '?')}</div>
        <div class="convo-info">
          <div class="convo-listing-title">${escapeHtml(listingTitle)}</div>
          <div class="convo-participant">${escapeHtml(otherUserName)}</div>
          <div class="convo-last-message">${escapeHtml(lastMessage)}</div>
        </div>
        <div class="convo-meta">
          <div class="convo-time">${lastMessageTime ? formatConvoTime(lastMessageTime) : ''}</div>
          ${unreadCount ? `<div class="convo-unread">${unreadCount}</div>` : ''}
        </div>
      </div>
    `;
  }).join('');

  document.querySelectorAll('.convo-item').forEach(el => {
    el.addEventListener('click', () => {
      const convoId = el.dataset.convoId;
      const otherUserId = el.dataset.otherUserId;
      const listingId = el.dataset.listingId;
      if (!convoId || convoId === 'undefined') {
        showToast('Invalid conversation', 'error');
        return;
      }
      selectConversation(convoId, otherUserId, listingId);
    });
  });
}

// ========== Select Conversation ==========
async function selectConversation(convoId, otherUserId, listingId) {
  console.log('Select conversation:', convoId, otherUserId, listingId);
  if (!convoId) return;
  currentConversationId = convoId;
  currentOtherUserId = otherUserId;
  
  document.querySelectorAll('.convo-item').forEach(el => {
    if (el.dataset.convoId === convoId) el.classList.add('active');
    else el.classList.remove('active');
  });
  
  const emptyState = document.getElementById('chat-empty-state');
  const chatMain = document.getElementById('chat-main');
  if (emptyState) emptyState.style.display = 'none';
  if (chatMain) chatMain.style.display = 'flex';
  
  if (listingId && listingId !== 'undefined') {
    try {
      currentListing = await API.get(`/api/listings/${listingId}`, true);
      renderChatHeader(currentListing, otherUserId);
      const actionsDiv = document.getElementById('chat-input-actions');
      if (actionsDiv) actionsDiv.style.display = 'flex';
    } catch (e) { console.warn('Could not load listing:', e); }
  }
  
  await loadMessages(convoId);
  
  if (pollingInterval) clearInterval(pollingInterval);
  pollingInterval = setInterval(() => {
    if (currentConversationId) loadMessages(currentConversationId, true);
  }, 5000);
}

function renderChatHeader(listing, otherUserId) {
  const listingBanner = document.getElementById('chat-listing-banner');
  const listingTitleSpan = document.getElementById('chat-listing-title');
  const listingPriceSpan = document.getElementById('chat-listing-price');
  const otherNameSpan = document.getElementById('chat-other-name');
  const listingLabelSpan = document.getElementById('chat-listing-label');
  const viewListingBtn = document.getElementById('chat-view-listing-btn');
  if (listingBanner) {
    listingBanner.href = `../listing/view-listing.html?id=${listing.id}`;
    listingBanner.style.display = 'flex';
    const thumbDiv = document.getElementById('chat-listing-thumb');
    if (thumbDiv && listing.images && listing.images[0]) {
      thumbDiv.innerHTML = `<img src="${escapeHtml(listing.images[0].imageUrl || listing.images[0])}" style="width:100%;height:100%;object-fit:cover;">`;
    }
  }
  if (listingTitleSpan) listingTitleSpan.textContent = listing.title || 'Listing';
  if (listingPriceSpan) listingPriceSpan.textContent = `₱${listing.price?.toLocaleString() || '0'}${listing.type === 'RENT' ? '/day' : ''}`;
  if (otherNameSpan) otherNameSpan.textContent = listing.sellerUsername || 'User';
  if (listingLabelSpan) listingLabelSpan.textContent = listing.title ? `Listing: ${listing.title.substring(0, 30)}` : '';
  if (viewListingBtn) viewListingBtn.style.display = 'flex';
  const avatarText = document.getElementById('chat-header-avatar-text');
  if (avatarText) avatarText.textContent = (listing.sellerUsername?.charAt(0) || '?').toUpperCase();
}

// ========== Load Messages ==========
async function loadMessages(convoId, isPolling = false) {
  if (!convoId) {
    console.error('loadMessages called with invalid convoId');
    return;
  }
  const container = document.getElementById('messages-area');
  if (!container) return;
  if (!isPolling) {
    container.innerHTML = `<div class="msg-skeleton"><div class="skeleton-bubble"></div></div><div class="msg-skeleton own"><div class="skeleton-bubble"></div></div>`;
  }
  try {
    const messages = await API.get(`/api/conversations/${convoId}/messages`, true);
    renderMessages(messages);
  } catch (err) {
    console.error(err);
    if (!isPolling) container.innerHTML = `<div class="convo-empty"><p>Could not load messages. ${err.message || ''}</p></div>`;
  }
}

function renderMessages(messages) {
  const container = document.getElementById('messages-area');
  if (!container) return;
  if (!messages || !messages.length) {
    container.innerHTML = `<div class="convo-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 12h8M12 8v8M20 12a8 8 0 11-16 0 8 8 0 0116 0z"/></svg><p>No messages yet</p><p style="font-size:0.8rem">Send a message to start the conversation</p></div>`;
    return;
  }
  const currentUserId = getCurrentUserId();
  let lastDate = null;
  const html = messages.map(msg => {
    const msgDate = new Date(msg.createdAt).toDateString();
    let dateSep = '';
    if (msgDate !== lastDate) {
      dateSep = `<div class="msg-date-sep"><span>${new Date(msg.createdAt).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span></div>`;
      lastDate = msgDate;
    }
    const isOwn = msg.senderId === currentUserId;
    return `${dateSep}
      <div class="msg-row ${isOwn ? 'own' : 'other'}">
        <div class="msg-bubble">
          ${!isOwn ? `<div class="msg-sender">${escapeHtml(msg.senderName || 'User')}</div>` : ''}
          <div class="msg-content">${escapeHtml(msg.content)}</div>
          <div class="msg-time">${formatMessageTime(msg.createdAt)}</div>
        </div>
      </div>
    `;
  }).join('');
  container.innerHTML = html;
  container.scrollTop = container.scrollHeight;
}

// ========== Send Message ==========
async function sendMessage() {
  const input = document.getElementById('chat-textarea');
  const content = input.value.trim();
  if (!content) return;
  if (!currentConversationId) {
    showToast('No conversation selected', 'error');
    return;
  }
  const container = document.getElementById('messages-area');
  const dateSep = `<div class="msg-date-sep"><span>Just now</span></div>`;
  const newMsgHtml = `${dateSep}<div class="msg-row own"><div class="msg-bubble"><div class="msg-content">${escapeHtml(content)}</div><div class="msg-time">Just now</div></div></div>`;
  const existingHtml = container.innerHTML;
  container.innerHTML = existingHtml + newMsgHtml;
  container.scrollTop = container.scrollHeight;
  input.value = '';
  input.style.height = 'auto';
  const sendBtn = document.getElementById('chat-send-btn');
  if (sendBtn) sendBtn.disabled = true;
  try {
    await API.post('/api/conversations/messages/send', {
      conversationId: currentConversationId,
      content: content
    }, true);
    await loadMessages(currentConversationId);
    loadConversations();
  } catch (err) {
    showToast('Failed to send message', 'error');
    loadMessages(currentConversationId);
  } finally {
    if (sendBtn) sendBtn.disabled = false;
  }
}

// ========== Offer & Rent Modals (stubs – you can copy your existing modal code here) ==========
function openOfferInChat() {
  if (!currentListing) { showToast('No listing selected', 'error'); return; }
  // Implement openOfferModal(currentListing.id) using your existing code
  showToast('Offer modal - implement', 'info');
}
function openRentInChat() {
  if (!currentListing) { showToast('No listing selected', 'error'); return; }
  showToast('Rent modal - implement', 'info');
}
// You can paste your full modal implementations from the previous version here

// ========== Initialize ==========
document.addEventListener('DOMContentLoaded', () => {
  loadConversations();
  const sendBtn = document.getElementById('chat-send-btn');
  const msgInput = document.getElementById('chat-textarea');
  if (sendBtn) sendBtn.addEventListener('click', sendMessage);
  if (msgInput) {
    msgInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
    msgInput.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 120) + 'px';
      const sendBtn = document.getElementById('chat-send-btn');
      if (sendBtn) sendBtn.disabled = !this.value.trim();
    });
  }
  const searchInput = document.getElementById('convo-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      const filtered = conversations.filter(conv => 
        (conv.listingTitle || conv.listing?.title || '').toLowerCase().includes(term) ||
        (conv.otherUserName || conv.otherUser?.username || '').toLowerCase().includes(term)
      );
      renderConversations(filtered);
    });
  }
  const backBtn = document.getElementById('chat-back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      const emptyState = document.getElementById('chat-empty-state');
      const chatMain = document.getElementById('chat-main');
      if (emptyState) emptyState.style.display = 'flex';
      if (chatMain) chatMain.style.display = 'none';
      currentConversationId = null;
      if (pollingInterval) clearInterval(pollingInterval);
    });
  }
  const emptyState = document.getElementById('chat-empty-state');
  const chatMain = document.getElementById('chat-main');
  if (emptyState) emptyState.style.display = 'flex';
  if (chatMain) chatMain.style.display = 'none';
});