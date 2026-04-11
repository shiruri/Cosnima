/* ============================================
   COSNIMA — Homepage JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // --- Loading Screen ---
  const loadingScreen = document.getElementById('loading-screen');
  const hideLoader = () => {
    if (!loadingScreen) return;
    loadingScreen.classList.add('hide');
    loadingScreen.addEventListener('transitionend', () => loadingScreen.remove(), { once: true });
  };

  // Hide loader after page is fully ready (min 800ms for the cute animation)
  const loaderMin = new Promise(res => setTimeout(res, 800));
  const pageReady = new Promise(res => {
    if (document.readyState === 'complete') res();
    else window.addEventListener('load', res, { once: true });
  });
  Promise.all([loaderMin, pageReady]).then(hideLoader);

  // --- Dark Mode ---
  const savedTheme = localStorage.getItem('cosnimaTheme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  const themeToggle = document.getElementById('theme-btn');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('cosnimaTheme', next);
    });
  }

  // --- Navbar scroll shadow ---
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // --- Hamburger Menu ---
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  let mobileOverlay = document.querySelector('.mobile-overlay');

  if (!mobileOverlay && mobileNav) {
    mobileOverlay = document.createElement('div');
    mobileOverlay.className = 'mobile-overlay';
    document.body.appendChild(mobileOverlay);
  }

  if (hamburger && mobileNav) {
    const toggleMenu = () => {
      const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
      hamburger.setAttribute('aria-expanded', String(!isOpen));
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

  // --- Auth nav state ---
  const navAuth = document.getElementById('nav-auth');
  const mobileAuth = document.getElementById('mobile-auth');

  const renderAuthButtons = (container) => {
    if (!container) return;
    if (API.isLoggedIn()) {
      const user = API.getUser();
      const name = user?.username || 'Cosplayer';
      const initial = name.charAt(0).toUpperCase();
      container.innerHTML = `
        <div class="auth-greeting">
          <a href="profile/profile.html" style="text-decoration:none; display:flex; align-items:center; gap:0.5rem;">
            <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--accent-dark));color:white;font-size:0.72rem;font-weight:700;display:flex;align-items:center;justify-content:center;">
              ${initial}
            </div>
            <span class="greeting-text">Hi, <strong>${name}</strong></span>
          </a>
          <button class="btn btn-ghost btn-nav" onclick="logout()" style="padding:0.35rem 0.8rem;font-size:0.8rem;">Log out</button>
        </div>
      `;
    } else {
      container.innerHTML = `
        <a href="login/login.html" class="btn btn-ghost btn-nav">Log in</a>
        <a href="signup/register.html" class="btn btn-primary btn-nav">Register</a>
      `;
    }
  };

  renderAuthButtons(navAuth);
  renderAuthButtons(mobileAuth);

  // --- Scroll reveals ---
  const revealEls = document.querySelectorAll('.reveal, .stagger');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  revealEls.forEach(el => observer.observe(el));

  // --- Series pills ---
  const pills = document.querySelectorAll('.pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      // In a real app, you'd filter the listings here
    });
  });

  // --- Wishlist heart toggle ---
  document.querySelectorAll('.card-wish').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!API.isLoggedIn()) {
        showToast('Log in to save to your wishlist', 'info');
        setTimeout(() => {
          document.body.classList.add('fade-out');
          setTimeout(() => { window.location.href = 'login/login.html'; }, 280);
        }, 900);
        return;
      }
      const isActive = btn.classList.toggle('active');
      // Update SVG fill to indicate saved state
      const svg = btn.querySelector('svg');
      if (svg) {
        svg.style.fill = isActive ? 'var(--accent)' : 'none';
        svg.style.stroke = 'var(--accent)';
      }
      showToast(isActive ? 'Added to wishlist' : 'Removed from wishlist', isActive ? 'success' : 'info', 2000);
    });
  });

  // --- Smooth page transitions ---
  document.querySelectorAll('a[href]:not([href^="#"]):not([href^="http"]):not([href^="mailto"]):not([target])').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      e.preventDefault();
      document.body.classList.add('fade-out');
      setTimeout(() => { window.location.href = href; }, 260);
    });
  });

  // --- Image error fallback ---
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', () => {
      img.style.background = 'var(--bg-alt)';
      img.removeAttribute('src');
    });
  });

});

// --- Search handler ---
function handleSearch() {
  const val = document.getElementById('hero-search-input')?.value?.trim();
  if (!val) return;
  // Scroll to listings section and show toast; real implementation would filter
  document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth' });
  showToast(`Searching for "${val}"...`, 'info', 2000);
}

// Also allow Enter key in search
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('hero-search-input');
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSearch();
    });
  }
});

// --- Logout ---
async function logout() {
  try {
    await API.post('/api/auth/logout', {}, true);
  } catch (err) {
    // Proceed with client-side logout even if server call fails
    console.warn('Server logout failed:', err);
  } finally {
    API.clearSession();
    showToast('Logged out successfully', 'success', 1500);
    setTimeout(() => {
      document.body.classList.add('fade-out');
      setTimeout(() => { window.location.href = 'login/login.html'; }, 280);
    }, 600);
  }
}