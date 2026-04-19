/* ============================================
   COSNIMA — Shared Nav & UI Logic
   Updated: messages + rentals links, consistent auth
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Show floating admin if admin (check on every page load) ──
  setTimeout(() => {
    try {
      const storedUser = localStorage.getItem('cosnimaUser');
      const user = storedUser ? JSON.parse(storedUser) : null;
      const btn = document.getElementById('floating-admin-btn');
      // Show only if admin + not banned
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
  mobileNav?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  // ── Auth nav state ──
  renderNavAuth(document.getElementById('nav-auth'));
  renderNavAuth(document.getElementById('mobile-auth'));

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

    // Show admin link for ADMIN/MODERATOR
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

/* ── Render nav auth ── */
function renderNavAuth(container) {
  if (!container) return;
  const prefix = getPathPrefix();

  if (API.isLoggedIn()) {
    const user    = API.getUser();
    const name    = user?.username || 'Cosplayer';
    const initial = name.charAt(0).toUpperCase();
    const profilePath = prefix + 'profile/profile.html';
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
    
    // Fetch fresh user data to update profile image if not available
    if (!profileImage && user?.id) {
      API.get(`/api/users/${user.id}`, true).then(freshUser => {
        if (freshUser?.avatarUrl) {
          user.avatarUrl = freshUser.avatarUrl;
          localStorage.setItem('cosnimaUser', JSON.stringify(user));
          // Re-render with image
          renderNavAuth(container);
        }
      }).catch(() => {});
    }
  } else {
    const prefix = getPathPrefix();
    container.innerHTML = `
      <a href="${prefix}login/login.html" class="btn btn-ghost btn-nav">Log in</a>
      <a href="${prefix}signup/register.html" class="btn btn-primary btn-nav">Register</a>`;
  }
}

/* ── Logout ── */
function logout() {
  try { API.post('/api/auth/logout', {}, true); } catch {}
  API.clearSession();

  // Hide floating admin button if exists
  const btn = document.getElementById('floating-admin-btn');
  if (btn) btn.style.display = 'none';

  if (typeof showToast === 'function') showToast('Logged out. See you soon! 🦫', 'success', 2000);

  // Clean page transition then redirect to login
  document.body.classList.add('fade-out');
  setTimeout(() => {
    window.location.href = 'login/login.html';
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