/* ============ Home page logic ============ */
const Home = (() => {
  const fmt = n => '₦' + n.toLocaleString('en-NG');

  function badgeHtml(b) {
    const map = { sale: ['badge-sale', 'Sale'], new: ['badge-new', 'New'], best: ['badge-best', 'Best seller'] };
    return (b || []).map(k => map[k] ? `<span class="badge ${map[k][0]}">${map[k][1]}</span>` : '').join('');
  }

  function productCard(p) {
    const cat = MallData.categories.find(c => c.id === p.cat);
    const stars = '★'.repeat(Math.round(p.rating)) + '☆'.repeat(5 - Math.round(p.rating));
    return `
      <article class="card p-card reveal">
        <a class="p-media" href="product.html?id=${p.id}" aria-label="${p.name}">
          <div class="ph" style="background:${p.bg}"></div>
          <div class="p-badges">${badgeHtml(p.badges)}</div>
          <button class="icon-btn p-fav" aria-label="Add ${p.name} to wishlist" onclick="Home.fav(event,'${p.id}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
          </button>
        </a>
        <div class="p-body">
          <span class="p-cat">${cat ? cat.name : ''}</span>
          <a class="p-name" href="product.html?id=${p.id}">${p.name}</a>
          <span class="p-rating" aria-label="Rated ${p.rating} of 5">${stars} <span style="color:var(--text-muted)">(${p.reviews})</span></span>
          <div class="p-foot">
            <span class="p-price">${fmt(p.price)}${p.old ? `<span class="p-old">${fmt(p.old)}</span>` : ''}</span>
            <button class="btn btn-primary p-add" onclick="Home.add(event,'${p.id}')">Add</button>
          </div>
        </div>
      </article>`;
  }

  function categoryCard(c) {
    return `
      <a class="cat-card reveal" href="products.html?cat=${c.id}" style="background:${c.bg}">
        <div><span>${c.name}</span><small>${c.count.toLocaleString()} items</small></div>
      </a>`;
  }

  function renderCategories() {
    const el = document.querySelector('[data-categories]');
    if (el) el.innerHTML = MallData.categories.slice(0, 4).map(categoryCard).join('');
  }
  function renderFeatured() {
    const el = document.querySelector('[data-featured]');
    if (el) el.innerHTML = MallData.products.slice(0, 8).map(productCard).join('');
  }

  function animateCounters() {
    const nums = document.querySelectorAll('[data-count]');
    const run = el => {
      const target = +el.dataset.count; const dur = 1400; const t0 = performance.now();
      const tick = now => {
        const p = Math.min((now - t0) / dur, 1);
        el.textContent = Math.floor(target * (1 - Math.pow(1 - p, 3))).toLocaleString();
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver((e) => e.forEach(en => {
      if (en.isIntersecting) { run(en.target); io.unobserve(en.target); }
    }), { threshold: 0.6 });
    nums.forEach(n => io.observe(n));
  }

  /* Cart / wishlist stubs (localStorage until backend wired) */
  function loggedIn() {
    try { return !!(JSON.parse(localStorage.getItem('mall-session') || '{}').token); } catch { return false; }
  }

  async function add(e, id) {
    if (e && e.preventDefault) e.preventDefault();
    // Always keep a local count for instant feedback / guest carts.
    const cart = JSON.parse(localStorage.getItem('mall-cart') || '[]');
    cart.push(id); localStorage.setItem('mall-cart', JSON.stringify(cart));
    const c = document.querySelector('[data-cart-count]'); if (c) c.textContent = cart.length;

    // If the API is on and the user is signed in, persist to the server cart.
    if (window.MallAPI && MallAPI.enabled() && loggedIn()) {
      const prod = (window.MallData ? MallData.products.find(p => p.id === id || p._id === id) : null);
      const realId = prod && prod._id;
      if (realId) {
        try { await MallAPI.addToCart(realId, 1); toast('Added to cart'); return; }
        catch (err) { toast(err.message || 'Could not add to cart'); return; }
      }
    }
    toast('Added to cart');
  }
  function fav(e, id) {
    e.preventDefault();
    const w = new Set(JSON.parse(localStorage.getItem('mall-wishlist') || '[]'));
    w.has(id) ? w.delete(id) : w.add(id);
    localStorage.setItem('mall-wishlist', JSON.stringify([...w]));
    toast(w.has(id) ? 'Saved to wishlist' : 'Removed from wishlist');
  }
  function subscribe(e) {
    e.preventDefault(); e.target.reset(); toast("You're subscribed — welcome!"); return false;
  }

  function toast(msg) {
    let t = document.getElementById('toast');
    if (!t) {
      t = document.createElement('div'); t.id = 'toast';
      t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);background:var(--dark);color:#fff;padding:.7rem 1.2rem;border-radius:999px;font-weight:600;font-size:.9rem;z-index:300;box-shadow:var(--shadow-lg);opacity:0;transition:.3s;';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'translateX(-50%) translateY(0)'; });
    clearTimeout(t._h); t._h = setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(-50%) translateY(20px)'; }, 2200);
  }

  document.addEventListener('DOMContentLoaded', async () => {
    if (window.MallData && MallData.load) { try { await MallData.load(); } catch {} }
    renderCategories(); renderFeatured(); animateCounters();
    // re-observe freshly injected .reveal cards
    setTimeout(() => document.querySelectorAll('.reveal:not(.in)').forEach(el => {
      new IntersectionObserver((en, o) => en.forEach(x => { if (x.isIntersecting) { x.target.classList.add('in'); o.disconnect(); } }), { threshold: .1 }).observe(el);
    }), 50);
  });

  return { add, fav, subscribe };
})();
