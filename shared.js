/* ════════════════════════════════
   DIGIYAAN360 – Shared JS
   ════════════════════════════════ */

// ── THEME ──────────────────────────────────────────────────────
(function () {
  const html = document.documentElement;
  const icon = document.getElementById('themeIcon');
  const btn  = document.getElementById('themeToggle');

  function applyTheme(t) {
    html.setAttribute('data-theme', t);
    if (icon) icon.textContent = t === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('dg360-theme', t);
  }

  // On first load: read saved pref, else detect system
  const saved  = localStorage.getItem('dg360-theme');
  const system = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  applyTheme(saved || system);

  // Toggle button
  if (btn) {
    btn.addEventListener('click', function () {
      const current = html.getAttribute('data-theme');
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // React to OS changes if no manual override
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    if (!localStorage.getItem('dg360-theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
})();

// ── CURSOR ─────────────────────────────────────────────────────
(function () {
  const dot  = document.getElementById('cursor');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', function (e) {
    mx = e.clientX; my = e.clientY;
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';
  });

  function animRing() {
    rx += (mx - rx) * 0.14;
    ry += (my - ry) * 0.14;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animRing);
  }
  animRing();

  document.addEventListener('mousedown', function () {
    dot.style.transform = 'translate(-50%,-50%) scale(0.6)';
    ring.style.transform = 'translate(-50%,-50%) scale(1.4)';
  });
  document.addEventListener('mouseup', function () {
    dot.style.transform = 'translate(-50%,-50%) scale(1)';
    ring.style.transform = 'translate(-50%,-50%) scale(1)';
  });

  // Hide on mobile
  if ('ontouchstart' in window) {
    document.body.style.cursor = 'auto';
    dot.style.display = 'none';
    ring.style.display = 'none';
  }
})();

// ── SPLASH ─────────────────────────────────────────────────────
window.closeSplash = function () {
  const s = document.getElementById('splash');
  if (s) s.classList.add('hide');
};

// Auto-close splash after 4s on home page
(function () {
  const s = document.getElementById('splash');
  if (!s) return;
  const visited = sessionStorage.getItem('dg360-visited');
  if (visited) { s.classList.add('hide'); return; }
  sessionStorage.setItem('dg360-visited', '1');
  setTimeout(function () { s.classList.add('hide'); }, 4000);
})();

// ── HAMBURGER NAV ───────────────────────────────────────────────
(function () {
  const btn   = document.getElementById('hamburger');
  const links = document.getElementById('navLinks');
  if (!btn || !links) return;
  btn.addEventListener('click', function () {
    links.classList.toggle('open');
    btn.textContent = links.classList.contains('open') ? '✕' : '☰';
  });
  // close on link click
  links.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      links.classList.remove('open');
      btn.textContent = '☰';
    });
  });
})();

// ── SCROLL REVEAL ───────────────────────────────────────────────
(function () {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(function (el) { observer.observe(el); });
})();
