/* ============================================
   COSNIMA — Shared Nav & UI Logic
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

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
  const mobileNav  = document.getElementById('mobile-nav');
  const overlay    = document.getElementById('mobile-overlay');

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
  const toggleMenu = () => hamburger?.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu();

  hamburger?.addEventListener('click', toggleMenu);
  overlay?.addEventListener('click', closeMenu);
  mobileNav?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  // ── Auth nav state ──
  renderNavAuth(document.getElementById('nav-auth'));
  renderNavAuth(document.getElementById('mobile-auth'));

  // Show sell link if logged in
  if (API.isLoggedIn()) {
    document.querySelectorAll('#sell-link, #mobile-sell-link').forEach(el => {
      if (el) el.style.display = '';
    });
    const heroSell = document.getElementById('hero-sell-btn');
    if (heroSell) heroSell.style.display = '';
  }

  // ── Scroll reveals ──
  const revealEls = document.querySelectorAll('.reveal, .stagger');
  if (revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06 });
    revealEls.forEach(el => observer.observe(el));
  }

  // ── Smooth page transitions ──
  document.querySelectorAll('a[href]:not([href^="#"]):not([href^="http"]):not([href^="mailto"]):not([target])').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#' || href.startsWith('javascript')) return;
      e.preventDefault();
      document.body.classList.add('fade-out');
      setTimeout(() => { window.location.href = href; }, 260);
    });
  });

  // ── Image fallback ──
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', () => {
      img.style.display = 'none';
      const placeholder = document.createElement('div');
      placeholder.className = 'card-thumb-placeholder';
      placeholder.textContent = '🌸';
      img.parentNode?.appendChild(placeholder);
    });
  });

});

/* ── Render nav auth buttons ── */
function renderNavAuth(container) {
  if (!container) return;
  if (API.isLoggedIn()) {
    const user = API.getUser();
    const name = user?.username || 'Cosplayer';
    const initial = name.charAt(0).toUpperCase();
    // Figure out profile path (1 or 2 levels deep)
    const isRoot = !window.location.pathname.includes('/listing/') &&
                   !window.location.pathname.includes('/profile/') &&
                   !window.location.pathname.includes('/login/') &&
                   !window.location.pathname.includes('/signup/');
    const profilePath = isRoot ? 'profile/profile.html' : '../profile/profile.html';
    container.innerHTML = `
      <div class="auth-greeting">
        <a href="${profilePath}" style="text-decoration:none;display:flex;align-items:center;gap:0.5rem;">
          <div style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,var(--beaver),var(--accent));color:white;font-size:0.75rem;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            ${initial}
          </div>
          <span class="greeting-text" style="display:none;">Hi, <strong>${name}</strong></span>
        </a>
        <button class="btn btn-ghost btn-nav" onclick="logout()" style="padding:0.4rem 0.8rem;font-size:0.8rem;">Log out</button>
      </div>
    `;
    // Show name on desktop
    const greetSpan = container.querySelector('.greeting-text');
    if (greetSpan && window.innerWidth >= 1024) greetSpan.style.display = 'inline';
  } else {
    const isRoot = !window.location.pathname.includes('/listing/') &&
                   !window.location.pathname.includes('/profile/') &&
                   !window.location.pathname.includes('/login/') &&
                   !window.location.pathname.includes('/signup/');
    const prefix = isRoot ? '' : '../';
    container.innerHTML = `
      <a href="${prefix}login/login.html" class="btn btn-ghost btn-nav">Log in</a>
      <a href="${prefix}signup/register.html" class="btn btn-primary btn-nav">Register</a>
    `;
  }
}

/* ── Logout ── */
async function logout() {
  try { await API.post('/api/auth/logout', {}, true); } catch (e) { /* ignore */ }
  API.clearSession();
  showToast('Logged out. See you soon! 🦫', 'success', 2000);
  setTimeout(() => {
    document.body.classList.add('fade-out');
    const isRoot = !window.location.pathname.includes('/listing/') && !window.location.pathname.includes('/profile/');
    setTimeout(() => { window.location.href = (isRoot ? '' : '../') + 'login/login.html'; }, 280);
  }, 600);
}

/* ── Redirect helper ── */
function redirectTo(url) {
  document.body.classList.add('fade-out');
  setTimeout(() => { window.location.href = url; }, 260);
}