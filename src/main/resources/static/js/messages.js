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
    ['messages-link','mobile-messages-link','sell-link','mobile-sell-link'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = '';
    });
  }

  await loadConversations();

  // Check URL for pre-selected conversation
  const params = new URLSearchParams(window.location.search);
  const preselect = params.get('conversation');
  if (preselect) {
    setTimeout(() => openConversation(preselect), 200);
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
}

function renderChatHeader(convo) {
  const nameEl    = document.getElementById('chat-other-name');
  const listingEl = document.getElementById('chat-listing-label');
  const headerAvatar = document.getElementById('chat-header-avatar-text');

  const myId     = String(_currentUser?.id || '');
  const isSeller = String(convo.sellerId) === myId;
  const initial  = (convo.listingTitle || 'U').charAt(0).toUpperCase();

  if (nameEl)       nameEl.textContent    = isSeller ? 'Buyer' : 'Seller';
  if (listingEl)    listingEl.textContent = convo.listingTitle || 'Conversation';
  if (headerAvatar) headerAvatar.textContent = initial;

  // Listing banner
  const banner = document.getElementById('chat-listing-banner');
  if (banner && convo.listingId) {
    banner.href = `../listing/view-listing.html?id=${convo.listingId}`;
    const titleEl = banner.querySelector('.chat-listing-title');
    if (titleEl) titleEl.textContent = convo.listingTitle || 'View Listing';
    banner.style.display = 'flex';
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

    html += `
      <div class="msg-row ${isOwn ? 'own' : ''}" data-msg-id="${escH(msg.id)}">
        ${!isOwn ? `<div class="msg-sender-avatar" aria-hidden="true">${escH(initial)}</div>` : ''}
        <div class="msg-bubble-wrap">
          ${!isOwn ? `<div class="msg-sender-name">${escH(msg.senderUsername || '')}</div>` : ''}
          <div class="msg-bubble">${escH(msg.content)}</div>
          ${time ? `<div class="msg-time">${time}</div>` : ''}
        </div>
      </div>`;
  });

  area.innerHTML = html;
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

    const msg = err?.data?.message || err?.message || 'Could not send message.';
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