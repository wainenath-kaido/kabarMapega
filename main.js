/* ============================================================
   MAPEGA.CO — main.js
   Handles: Dark/Light Mode, Live Clock, Ticker, Scroll-to-top,
            Counter animation, Search overlay, Navbar scroll
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  
  /* ─────────────────────────────────────────
     1. DARK / LIGHT MODE TOGGLE
  ───────────────────────────────────────── */
  const html      = document.documentElement;
  const toggleBtn = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');

  const savedTheme = localStorage.getItem('mapega-theme') || 'light';
  applyTheme(savedTheme);

  toggleBtn.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('mapega-theme', theme);
    if (theme === 'dark') {
      themeIcon.classList.replace('fa-moon', 'fa-sun');
      toggleBtn.setAttribute('aria-label', 'Aktifkan mode terang');
    } else {
      themeIcon.classList.replace('fa-sun', 'fa-moon');
      toggleBtn.setAttribute('aria-label', 'Aktifkan mode gelap');
    }
  }


  /* ─────────────────────────────────────────
     2. LIVE DATE & TIME (WIB / Papua)
  ───────────────────────────────────────── */
  const dateEl = document.getElementById('live-date');
  const timeEl = document.getElementById('live-time');

  const DAYS   = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];

  function updateClock() {
    const now = new Date();
    // Papua WIT = UTC+9
    const wit = new Date(now.getTime() + (9 * 3600000) - (now.getTimezoneOffset() * 60000 - (9 * 3600000)));
    const realNow = new Date();

    if (dateEl) {
      dateEl.textContent =
        `${DAYS[realNow.getDay()]}, ${realNow.getDate()} ${MONTHS[realNow.getMonth()]} ${realNow.getFullYear()}`;
    }
    if (timeEl) {
      const hh = String(realNow.getHours()).padStart(2,'0');
      const mm = String(realNow.getMinutes()).padStart(2,'0');
      const ss = String(realNow.getSeconds()).padStart(2,'0');
      timeEl.textContent = `${hh}:${mm}:${ss} WIT`;
    }
  }
  updateClock();
  setInterval(updateClock, 1000);


  /* ─────────────────────────────────────────
     3. BREAKING NEWS TICKER — duplicate items
  ───────────────────────────────────────── */
  const ticker = document.getElementById('tickerItems');
  if (ticker) {
    // Duplicate for seamless loop
    ticker.innerHTML += ticker.innerHTML;
  }


  /* ─────────────────────────────────────────
     4. NAVBAR SCROLL BEHAVIOUR
  ───────────────────────────────────────── */
  const navbar = document.getElementById('mainNavbar');
  let lastScrollY = 0;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (navbar) {
      if (y > 80) {
        navbar.classList.add('navbar-scrolled');
      } else {
        navbar.classList.remove('navbar-scrolled');
      }
    }
    lastScrollY = y;
  }, { passive: true });

  // Add scrolled style dynamically
  const styleTag = document.createElement('style');
  styleTag.textContent = `
    .navbar-scrolled {
      box-shadow: 0 4px 24px rgba(14,165,233,0.18) !important;
    }
  `;
  document.head.appendChild(styleTag);


  /* ─────────────────────────────────────────
     5. SCROLL TO TOP BUTTON
  ───────────────────────────────────────── */
  const scrollTopBtn = document.getElementById('scrollTop');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      scrollTopBtn?.classList.add('show');
    } else {
      scrollTopBtn?.classList.remove('show');
    }
  }, { passive: true });

  scrollTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });


  /* ─────────────────────────────────────────
     6. COUNTER / STATS ANIMATION
  ───────────────────────────────────────── */
  const statNums = document.querySelectorAll('.stat-num[data-target]');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statNums.forEach(el => counterObserver.observe(el));

  function animateCounter(el) {
    const target  = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1800;
    const start    = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(ease * target);

      // Format with dots for thousands
      el.textContent = value.toLocaleString('id-ID');

      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString('id-ID');
    }
    requestAnimationFrame(step);
  }


  /* ─────────────────────────────────────────
     7. SEARCH INPUT — keyboard shortcut
  ───────────────────────────────────────── */
  const searchInput = document.getElementById('searchInput');

  document.addEventListener('keydown', (e) => {
    // Press "/" to focus search
    if (e.key === '/' && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput?.focus();
      searchInput?.select();
    }
    // Escape to blur
    if (e.key === 'Escape') searchInput?.blur();
  });

  searchInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && searchInput.value.trim()) {
      const query = encodeURIComponent(searchInput.value.trim());
      // Placeholder search action
      console.log(`Mencari: ${searchInput.value}`);
      // window.location.href = `/search?q=${query}`;
    }
  });


  /* ─────────────────────────────────────────
     8. POLL — click to highlight option
  ───────────────────────────────────────── */
  const pollOptions = document.querySelectorAll('.poll-option');
  pollOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      pollOptions.forEach(o => o.querySelector('.poll-bar').style.outline = 'none');
      opt.querySelector('.poll-bar').style.outline = '2px solid var(--sky-dark)';
    });
  });


  /* ─────────────────────────────────────────
     9. NEWS CARD — click ripple effect
  ───────────────────────────────────────── */
  document.querySelectorAll('.news-card, .side-card, .hero-card').forEach(card => {
    card.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position:absolute; border-radius:50%;
        width:80px; height:80px;
        background:rgba(56,189,248,0.18);
        transform:translate(-50%,-50%) scale(0);
        animation:ripple-anim 0.5s ease-out forwards;
        pointer-events:none; z-index:99;
        left:${e.offsetX}px; top:${e.offsetY}px;
      `;
      this.style.position = this.style.position || 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  // Ripple keyframe
  const rippleStyle = document.createElement('style');
  rippleStyle.textContent = `
    @keyframes ripple-anim {
      to { transform: translate(-50%,-50%) scale(6); opacity: 0; }
    }
  `;
  document.head.appendChild(rippleStyle);


  /* ─────────────────────────────────────────
     10. NEWSLETTER FORM — feedback toast
  ───────────────────────────────────────── */
  const nlBtn = document.querySelector('.btn-newsletter');
  const nlInput = document.querySelector('.newsletter-form input[type="email"]');

  nlBtn?.addEventListener('click', () => {
    const email = nlInput?.value?.trim();
    if (!email || !email.includes('@')) {
      showToast('Masukkan alamat email yang valid!', 'warning');
      return;
    }
    showToast(`Terima kasih! ${email} telah terdaftar.`, 'success');
    if (nlInput) nlInput.value = '';
  });

  function showToast(msg, type = 'success') {
    const colors = { success: '#10B981', warning: '#F59E0B', error: '#EF4444' };
    const toast = document.createElement('div');
    toast.style.cssText = `
      position:fixed; bottom:70px; right:24px; z-index:9999;
      background:${colors[type]}; color:#fff;
      padding:12px 20px; border-radius:10px;
      font-size:13.5px; font-weight:500;
      box-shadow:0 4px 20px rgba(0,0,0,0.2);
      transform:translateY(20px); opacity:0;
      transition:all 0.3s ease;
      max-width:300px;
    `;
    toast.textContent = msg;
    document.body.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.transform = 'translateY(0)';
      toast.style.opacity = '1';
    });
    setTimeout(() => {
      toast.style.transform = 'translateY(20px)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }


  /* ─────────────────────────────────────────
     11. LAZY LOAD IMAGES — fade-in on enter
  ───────────────────────────────────────── */
  const imgObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        imgObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.news-card, .side-card, .video-card, .photo-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.45s ease, transform 0.45s ease, box-shadow 0.25s ease';
    imgObserver.observe(el);
  });

  console.log('%c Mapega.co Portal Berita Papua ', 'background:#0EA5E9;color:#fff;font-size:14px;padding:6px 12px;border-radius:4px;');
  console.log('%c Powered by Mapega Digital Media ', 'color:#0EA5E9;font-size:12px;');

}); // end DOMContentLoaded
