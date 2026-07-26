/* ============================================================
   Smart Mall — Shared client logic
   Theme toggle, mobile nav, scroll reveal, header/footer render.
   Framework-free (ES6+), portable across all pages.
   ============================================================ */

/* ---- Backend API location (set once for the whole site) ----
   Local development points at your backend on port 5000.
   When you deploy, change this ONE line to your Render URL,
   e.g. "https://smart-mall-api.onrender.com".
   Leave it as an empty string ("") to run the site on mock data
   only, with no backend. Any page that already sets window.MALL_API
   itself (via an inline <script>) will keep its own value. */
if (typeof window.MALL_API === 'undefined') {
  window.MALL_API = 'http://localhost:5000';
}

const NAV_LINKS = [
  { href: 'index.html', label: 'Home' },
  { href: 'products.html', label: 'Products' },
  { href: 'categories.html', label: 'Categories' },
  { href: 'about.html', label: 'About' },
  { href: 'contact.html', label: 'Contact' },
];

/* ---------- Theme ---------- */
const THEME_KEY = 'mall-theme';
function getTheme() {
  return localStorage.getItem(THEME_KEY) ||
    (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem(THEME_KEY, t);
  const btn = document.querySelector('[data-theme-toggle]');
  if (btn) btn.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
}
function toggleTheme() { applyTheme(getTheme() === 'dark' ? 'light' : 'dark'); }
applyTheme(getTheme()); // apply immediately to avoid flash

/* ---------- Cart count (localStorage stub until backend wired) ---------- */
function cartCount() {
  try { return (JSON.parse(localStorage.getItem('mall-cart') || '[]')).length; }
  catch { return 0; }
}

/* ---------- Header ---------- */
function renderHeader() {
  const mount = document.querySelector('[data-header]');
  if (!mount) return;
  const current = location.pathname.split('/').pop() || 'index.html';
  const links = NAV_LINKS.map(l =>
    `<a href="${l.href}" class="${l.href === current ? 'active' : ''}">${l.label}</a>`
  ).join('');

  mount.innerHTML = `
    <header class="nav glass" role="banner">
      <div class="container">
        <a class="brand" href="index.html" aria-label="Smart Mall home">
          <span class="brand-mark">SM</span> Smart Mall
        </a>
        <nav class="nav-links" id="navLinks" aria-label="Primary">${links}</nav>
        <div class="nav-actions">
          <button class="icon-btn" data-theme-toggle aria-label="Toggle theme">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/>
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
          </button>
          <a class="icon-btn" href="wishlist.html" aria-label="Wishlist">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
          </a>
          <a class="icon-btn" href="cart.html" aria-label="Cart">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>
            <span class="cart-count" data-cart-count>${cartCount()}</span>
          </a>
          <a class="btn btn-primary" href="login.html" style="padding:.55rem 1.1rem">Sign in</a>
          <button class="icon-btn nav-toggle" id="navToggle" aria-label="Open menu" aria-expanded="false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
          </button>
        </div>
      </div>
    </header>`;

  document.querySelector('[data-theme-toggle]').addEventListener('click', toggleTheme);
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('navLinks');
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
}

/* ---------- Footer ---------- */
function renderFooter() {
  const mount = document.querySelector('[data-footer]');
  if (!mount) return;
  const y = new Date().getFullYear();
  mount.innerHTML = `
    <footer class="footer" role="contentinfo">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-col">
            <a class="brand" href="index.html" style="color:#fff;margin-bottom:.75rem">
              <span class="brand-mark">SM</span> Smart Mall</a>
            <p style="max-width:34ch;color:#94A3B8;font-size:.9rem">
              A smarter place to shop. Curated stores, personalised picks, and one seamless checkout.</p>
          </div>
          <div class="footer-col"><h4>Shop</h4><ul>
            <li><a href="products.html">All products</a></li>
            <li><a href="categories.html">Categories</a></li>
            <li><a href="products.html?deals=1">Today's deals</a></li>
            <li><a href="wishlist.html">Wishlist</a></li></ul></div>
          <div class="footer-col"><h4>Company</h4><ul>
            <li><a href="about.html">About</a></li>
            <li><a href="contact.html">Contact</a></li>
            <li><a href="faq.html">FAQ</a></li>
            <li><a href="terms.html">Terms</a></li></ul></div>
          <div class="footer-col"><h4>Account</h4><ul>
            <li><a href="login.html">Sign in</a></li>
            <li><a href="register.html">Create account</a></li>
            <li><a href="dashboard.html">My dashboard</a></li>
            <li><a href="privacy.html">Privacy</a></li></ul></div>
        </div>
        <div class="footer-bottom">
          <span>&copy; ${y} Smart Mall. Built as a final-year CS project.</span>
          <span>Made with care in Lagos, Nigeria</span>
        </div>
      </div>
    </footer>`;
}

/* ---------- Scroll reveal ---------- */
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || !els.length) { els.forEach(e => e.classList.add('in')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  els.forEach(e => io.observe(e));
}

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  renderHeader();
  renderFooter();
  initReveal();
});

/* PWA: register service worker */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
