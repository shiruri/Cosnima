/* ============================================
   COSNIMA — Shared Nav & UI Logic
   FIX: logout uses getPathPrefix() — correct path from any subfolder
   FIX: mobile drawer auth rendered via renderMobileAuth() with
        large tap targets, profile card + logout button always visible
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Show floating admin if admin ──
  setTimeout(() => {
    try {
      const storedUser = localStorage.getItem('cosnimaUser');
      const user = storedUser ? JSON.parse(storedUser) : null;
      const btn = document.getElementById('floating-admin-btn');
      if (btn && !user?.isBanned && (user?.role === 'ADMIN' || user?.role === 'MODERATOR')) {
        btn.style.display = 'flex';
      }
    } catch {/* silent */}
  }, 100);

  // ── Theme toggle ──
  const savedTheme = localStorage.getItem('cosnimaTheme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  const themeBtn = document.getElementById('theme-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('cosnimaTheme', next);
    });
  }

  // ── Navbar scroll ──
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ── Mobile nav ──
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  const overlay   = document.getElementById('mobile-overlay');

  const closeMenu = () => {
    hamburger?.setAttribute('aria-expanded', 'false');
    mobileNav?.classList.remove('open');
    overlay?.classList.remove('active');
    document.body.style.overflow = '';
  };
  const openMenu = () => {
    hamburger?.setAttribute('aria-expanded', 'true');
    mobileNav?.classList.add('open');
    overlay?.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  hamburger?.addEventListener('click', () => {
    hamburger.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu();
  });
  overlay?.addEventListener('click', closeMenu);
  // Close menu when tapping any link inside it
  mobileNav?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  // ── Auth nav state ──
  renderNavAuth(document.getElementById('nav-auth'));
  // FIX: use dedicated mobile renderer so it gets proper tap targets
  renderMobileAuth(document.getElementById('mobile-auth'));

  // Show logged-in-only links
  if (API.isLoggedIn()) {
    const storedUser = localStorage.getItem('cosnimaUser');
    let user = null;
    try { user = storedUser ? JSON.parse(storedUser) : null; } catch { user = null; }
    const loggedInLinks = [
      'sell-link', 'mobile-sell-link',
      'messages-link', 'mobile-messages-link',
      'offers-link', 'mobile-offers-link',
      'rentals-link', 'mobile-rentals-link',
      'ratings-link', 'mobile-ratings-link',
    ];
    loggedInLinks.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = '';
    });

    if (user?.role === 'ADMIN' || user?.role === 'MODERATOR') {
      const adminLink = document.getElementById('admin-link');
      const mobileAdminLink = document.getElementById('mobile-admin-link');
      const floatingAdminBtn = document.getElementById('floating-admin-btn');
      if (adminLink) adminLink.style.display = '';
      if (mobileAdminLink) mobileAdminLink.style.display = '';
      if (floatingAdminBtn) floatingAdminBtn.style.display = 'flex';
    }

    const heroSell = document.getElementById('hero-sell-btn');
    if (heroSell) heroSell.style.display = '';
  }

  // ── Scroll reveals ──
  const revealEls = document.querySelectorAll('.reveal, .stagger');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06 });
    revealEls.forEach(el => observer.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  // ── Smooth page transitions ──
  document.querySelectorAll('a[href]:not([href^="#"]):not([href^="http"]):not([href^="mailto"]):not([target]):not([data-nav-wired])').forEach(link => {
    link.setAttribute('data-nav-wired', 'true');
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#' || href.startsWith('javascript')) return;
      e.preventDefault();
      navigateTo(href);
    });
  });

  // ── Image fallback ──
  document.querySelectorAll('img').forEach(img => {
    if (img.dataset.fallbackWired) return;
    img.dataset.fallbackWired = 'true';
    img.addEventListener('error', () => {
      if (img.dataset.fallbackApplied) return;
      img.dataset.fallbackApplied = 'true';
      img.style.display = 'none';
      const placeholder = document.createElement('div');
      placeholder.className = 'card-thumb-placeholder';
      placeholder.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.2" style="width:32px;height:32px;opacity:0.4"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`;
      img.parentNode?.insertBefore(placeholder, img.nextSibling);
    });
  });

});

/* ── Path prefix detection ── */
function getPathPrefix() {
  const path = window.location.pathname;
  if (
    path.includes('/listing/') ||
    path.includes('/profile/')  ||
    path.includes('/login/')    ||
    path.includes('/signup/')   ||
    path.includes('/messages/') ||
    path.includes('/rentals/')  ||
    path.includes('/offers/')   ||
    path.includes('/admin/')
  ) return '../';
  return '';
}

/* ── Desktop nav auth ── */
function renderNavAuth(container) {
  if (!container) return;
  const prefix = getPathPrefix();

  if (API.isLoggedIn()) {
    const user         = API.getUser();
    const name         = user?.username || 'Cosplayer';
    const initial      = name.charAt(0).toUpperCase();
    const profilePath  = prefix + 'profile/profile.html';
    const profileImage = user?.avatarUrl;

    const avatarHtml = profileImage
      ? `<img src="${escapeHtml(profileImage)}" alt="${escapeHtml(name)}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`
      : escapeHtml(initial);

    container.innerHTML = `
      <div class="auth-greeting">
        <a href="${profilePath}" style="text-decoration:none;display:flex;align-items:center;gap:0.5rem;" aria-label="My profile">
          <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--beaver),var(--accent));color:white;font-size:0.78rem;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;border:2px solid var(--card);box-shadow:0 0 0 2px var(--accent);overflow:hidden;">
            ${avatarHtml}
          </div>
          <span class="greeting-text" style="display:none;">Hi, <strong>${escapeHtml(name)}</strong></span>
        </a>
        <button class="btn btn-ghost btn-nav" onclick="logout()" style="padding:0.4rem 0.8rem;font-size:0.8rem;" aria-label="Log out">Log out</button>
      </div>`;

    const greetSpan = container.querySelector('.greeting-text');
    if (greetSpan && window.innerWidth >= 1024) greetSpan.style.display = 'inline';

    if (!profileImage && user?.id) {
      API.get(`/api/users/${user.id}`, true).then(freshUser => {
        if (freshUser?.avatarUrl) {
          user.avatarUrl = freshUser.avatarUrl;
          localStorage.setItem('cosnimaUser', JSON.stringify(user));
          renderNavAuth(container);
        }
      }).catch(() => {});
    }
  } else {
    container.innerHTML = `
      <a href="${prefix}login/login.html" class="btn btn-ghost btn-nav">Log in</a>
      <a href="${prefix}signup/register.html" class="btn btn-primary btn-nav">Register</a>`;
  }
}

/* ── Mobile drawer auth ──
   Separate from renderNavAuth so we can use large, finger-friendly
   tap targets. Sits at the bottom of the drawer with a divider.
   -webkit-tap-highlight-color:transparent removes the grey flash on tap. ── */
function renderMobileAuth(container) {
  if (!container) return;
  const prefix = getPathPrefix();

  if (API.isLoggedIn()) {
    const user         = API.getUser();
    const name         = user?.username || 'Cosplayer';
    const initial      = name.charAt(0).toUpperCase();
    const profilePath  = prefix + 'profile/profile.html';
    const profileImage = user?.avatarUrl;

    const avatarHtml = profileImage
      ? `<img src="${escapeHtml(profileImage)}" alt="${escapeHtml(name)}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`
      : escapeHtml(initial);

    container.innerHTML = `
      <div style="
        border-top: 1.5px solid var(--border);
        padding-top: var(--space-lg);
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
      ">
        <a
          href="${profilePath}"
          style="
            display: flex;
            align-items: center;
            gap: var(--space-md);
            padding: var(--space-md);
            border-radius: var(--radius);
            background: var(--bg-alt);
            text-decoration: none;
            -webkit-tap-highlight-color: transparent;
            min-height: 56px;
          "
          aria-label="View my profile"
        >
          <div style="
            width: 44px; height: 44px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--beaver), var(--accent));
            color: white;
            font-size: 1rem;
            font-weight: 800;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            overflow: hidden;
            box-shadow: 0 0 0 2px var(--accent);
          ">${avatarHtml}</div>
          <div style="min-width: 0; flex: 1;">
            <div style="
              font-size: 1rem;
              font-weight: 700;
              color: var(--ink);
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            ">${escapeHtml(name)}</div>
            <div style="font-size: 0.75rem; color: var(--accent); font-weight: 600; margin-top: 2px;">
              View Profile →
            </div>
          </div>
        </a>

        <button
          onclick="logout()"
          style="
            width: 100%;
            min-height: 52px;
            padding: var(--space-md);
            border-radius: var(--radius);
            border: 1.5px solid var(--border);
            background: transparent;
            color: var(--ink-muted);
            font-size: 0.95rem;
            font-weight: 700;
            font-family: var(--font-body);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--space-sm);
            -webkit-tap-highlight-color: transparent;
          "
          aria-label="Log out"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;flex-shrink:0;">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          Log out
        </button>
      </div>`;

  } else {
    container.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
        border-top: 1.5px solid var(--border);
        padding-top: var(--space-lg);
      ">
        <a
          href="${prefix}login/login.html"
          class="btn btn-outline"
          style="justify-content: center; width: 100%; min-height: 52px; -webkit-tap-highlight-color: transparent;"
        >Log in</a>
        <a
          href="${prefix}signup/register.html"
          class="btn btn-primary"
          style="justify-content: center; width: 100%; min-height: 52px; -webkit-tap-highlight-color: transparent;"
        >Register</a>
      </div>`;
  }
}

/* ── Logout ── */
function logout() {
  try { API.post('/api/auth/logout', {}, true); } catch {}
  API.clearSession();

  const floatBtn = document.getElementById('floating-admin-btn');
  if (floatBtn) floatBtn.style.display = 'none';

  if (typeof showToast === 'function') showToast('Logged out. See you soon! 🦫', 'success', 2000);

  // FIX: prefix ensures correct path from any subfolder (messages/, offers/, etc.)
  const prefix = getPathPrefix();
  document.body.classList.add('fade-out');
  setTimeout(() => {
    window.location.href = prefix + 'login/login.html';
  }, 300);
}

/* ── Navigation ── */
function navigateTo(url) {
  document.body.classList.add('fade-out');
  setTimeout(() => { window.location.href = url; }, 260);
}

function redirectTo(url) { navigateTo(url); }

/* ── Escape helper ── */
function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
