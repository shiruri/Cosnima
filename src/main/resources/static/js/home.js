/* ============================================
   COSNIMA — Homepage JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // Dark Mode
  const savedTheme = localStorage.getItem('cosnimaTheme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  const themeToggle = document.getElementById('theme-btn');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next    = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('cosnimaTheme', next);
    });
  }

  // Navbar scroll shadow
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Hamburger Menu
  const hamburger   = document.getElementById('hamburger');
  const mobileNav   = document.getElementById('mobile-nav');
  let mobileOverlay = document.querySelector('.mobile-overlay');

  if (!mobileOverlay && mobileNav) {
    mobileOverlay = document.createElement('div');
    mobileOverlay.className = 'mobile-overlay';
    document.body.appendChild(mobileOverlay);
  }

  if (hamburger && mobileNav) {
    const toggleMenu = () => {
      const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
      hamburger.setAttribute('aria-expanded', !isOpen);
      mobileNav.classList.toggle('open');
      if (mobileOverlay) mobileOverlay.classList.toggle('active');
      document.body.style.overflow = isOpen ? '' : 'hidden';
    };

    hamburger.addEventListener('click', toggleMenu);
    if (mobileOverlay) mobileOverlay.addEventListener('click', toggleMenu);
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (mobileNav.classList.contains('open')) toggleMenu();
      });
    });
  }

  // Auth nav state
  const navAuth    = document.getElementById('nav-auth');
  const mobileAuth = document.getElementById('mobile-auth');

  const renderAuthButtons = (container) => {
    if (!container) return;
    if (API.isLoggedIn()) {
      const user = API.getUser();
      container.innerHTML = `
        <a href="profile/profile.html" style="text-decoration:none;">
          <span style="font-size:0.82rem;color:var(--ink-muted);">
            Hi, <strong style="color:var(--ink)">${user?.username || 'Cosplayer'}</strong>
          </span>
        </a>
        <button class="btn btn-outline btn-nav" onclick="logout()">Log out</button>
      `;
    } else {
      container.innerHTML = `
        <a href="login/login.html"    class="btn btn-outline btn-nav">Log in</a>
        <a href="signup/register.html" class="btn btn-primary btn-nav">Register</a>
      `;
    }
  };

  renderAuthButtons(navAuth);
  renderAuthButtons(mobileAuth);

  // Scroll reveals
  const revealEls = document.querySelectorAll('.reveal, .stagger');
  const observer  = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  revealEls.forEach(el => observer.observe(el));

  // Series pills
  const pills = document.querySelectorAll('.pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
    });
  });

  // Wishlist heart toggle
  document.querySelectorAll('.card-wish').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!API.isLoggedIn()) {
        window.location.href = 'login/login.html';
        return;
      }
      btn.classList.toggle('active');
    });
  });

  // Smooth page transitions (internal links only)
  document.querySelectorAll('a[href]:not([href^="#"]):not([target])').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('javascript:')) return;
      e.preventDefault();
      document.body.classList.add('fade-out');
      setTimeout(() => { window.location.href = href; }, 260);
    });
  });
});

// Logout
async function logout() {
  try {
    await API.post('/api/auth/logout', {}, true);
  } catch (err) {
    console.warn('Server logout failed:', err);
  } finally {
    API.clearSession();
    document.body.classList.add('fade-out');
    setTimeout(() => { window.location.href = 'login/login.html'; }, 280);
  }
}