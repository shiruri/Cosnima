/* ============================================
   COSNIMA — Homepage JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Dark Mode ────────────────────────────────────
  const savedTheme = localStorage.getItem('cosnimaTheme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('cosnimaTheme', next);
    });
  }

  // ── Navbar scroll shadow ─────────────────────────
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    const onScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ── Auth nav state ───────────────────────────────
  const navAuth = document.getElementById('nav-auth');
  if (navAuth) {
    if (API.isLoggedIn()) {
      const user = API.getUser();
      navAuth.innerHTML = `
        <span style="font-size:0.85rem;color:var(--ink-muted);">
          Hi, <strong style="color:var(--ink)">${user?.username || 'Cosplayer'}</strong>
        </span>
        <button class="btn btn-outline btn-nav" onclick="logout()">Log out</button>
      `;
    } else {
      navAuth.innerHTML = `
        <a href="login/login.html"    class="btn btn-outline btn-nav">Log in</a>
        <a href="signup/register.html" class="btn btn-primary btn-nav">Register</a>
      `;
    }
  }

  // ── Scroll reveals ───────────────────────────────
  const revealEls = document.querySelectorAll('.reveal, .stagger');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => observer.observe(el));

  // ── Series pills ─────────────────────────────────
  const pills = document.querySelectorAll('.series-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      // TODO: Filter listings by series when backend is connected
    });
  });

  // ── Wishlist heart toggle (visual only for now) ──
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!API.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
      }
      btn.classList.toggle('active');
      btn.textContent = btn.classList.contains('active') ? '♥' : '♡';
      btn.style.color = btn.classList.contains('active') ? 'var(--error)' : '';
    });
  });

  // ── Smooth page link transitions ─────────────────
  document.querySelectorAll('a[href]:not([href^="#"]):not([target])').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('mailto')) return;
      e.preventDefault();
      document.body.classList.add('fade-out');
      setTimeout(() => { window.location.href = href; }, 260);
    });
  });
});

// ── Logout ─────────────────────────────────────────
function logout() {
  API.clearSession();
  document.body.classList.add('fade-out');
  setTimeout(() => { window.location.href = 'login.html'; }, 260);
}
