/* ============ Product detail logic ============ */
(async () => {
  if (window.MallData && MallData.load) { try { await MallData.load(); } catch {} }
  const fmt = n => '₦' + n.toLocaleString('en-NG');
  const id = new URLSearchParams(location.search).get('id') || (MallData.products[0] && MallData.products[0].id);
  const p = MallData.products.find(x => x.id === id) || MallData.products[0];
  const cat = MallData.categories.find(c => c.id === p.cat);
  const mount = document.querySelector('[data-product]');
  let qty = 1;

  // track recently viewed (local, for the "recently viewed" UI)
  try {
    const rv = JSON.parse(localStorage.getItem('mall-recent') || '[]').filter(x => x !== p.id);
    rv.unshift(p.id); localStorage.setItem('mall-recent', JSON.stringify(rv.slice(0, 8)));
  } catch {}

  // track the view server-side so the recommendation engine learns from it
  if (window.MallAPI && MallAPI.enabled() && p._id) {
    MallAPI.trackView(p._id).catch(() => {});
  }

  const stars = '★'.repeat(Math.round(p.rating)) + '☆'.repeat(5 - Math.round(p.rating));
  const stock = p.stock != null ? p.stock : 14;
  // Initial recs: naive category match (instant render / offline fallback).
  // Replaced by the real engine's "frequently bought together" after load.
  const recs = MallData.products.filter(x => x.cat === p.cat && x.id !== p.id).slice(0, 4)
    .concat(MallData.products.filter(x => x.cat !== p.cat).slice(0, 4)).slice(0, 4);

  const recCard = r => {
    const rc = MallData.categories.find(c => c.id === r.cat);
    return `<article class="card p-card">
      <a class="p-media" href="product.html?id=${r.id}"><div class="ph" style="background:${r.bg}"></div></a>
      <div class="p-body"><span class="p-cat">${rc ? rc.name : ''}</span>
      <a class="p-name" href="product.html?id=${r.id}">${r.name}</a>
      <div class="p-foot"><span class="p-price">${fmt(r.price)}</span>
      <button class="btn btn-primary p-add" onclick="Home.add(event,'${r.id}')">Add</button></div></div></article>`;
  };

  mount.innerHTML = `
    <nav aria-label="Breadcrumb" style="font-size:.85rem;color:var(--text-muted);margin-bottom:1.5rem">
      <a href="index.html">Home</a> / <a href="products.html?cat=${p.cat}">${cat ? cat.name : ''}</a> / ${p.name}
    </nav>
    <div class="pd-layout">
      <div class="pd-gallery">
        <div class="pd-main-img"><div class="ph" id="mainImg" style="background:${p.bg}"></div></div>
        <div class="pd-thumbs">
          ${[p.bg, 'linear-gradient(135deg,#64748B,#0F172A)', 'linear-gradient(135deg,#F59E0B,#EAB308)']
            .map((b, i) => `<button class="pd-thumb ${i === 0 ? 'active' : ''}" onclick="ProductPage.pick(this,'${b}')"><div class="ph" style="background:${b}"></div></button>`).join('')}
        </div>
      </div>
      <div class="pd-info">
        <span class="pd-cat">${cat ? cat.name : ''}</span>
        <h1 class="pd-title">${p.name}</h1>
        <div class="pd-rating">${stars} <span style="color:var(--text-muted)">${p.rating} · ${p.reviews} reviews</span></div>
        <div class="pd-price">${fmt(p.price)}${p.old ? `<span class="old">${fmt(p.old)}</span>` : ''}</div>
        <p class="pd-desc">Premium ${cat ? cat.name.toLowerCase() : 'product'} engineered for everyday performance. Thoughtful design, durable materials, and a finish that looks as good as it works.</p>
        <dl class="pd-meta">
          <div><dt>Brand</dt><dd>Smart Mall Select</dd></div>
          <div><dt>SKU</dt><dd>${p.id.toUpperCase()}-${p.cat.slice(0,3).toUpperCase()}</dd></div>
          <div><dt>Availability</dt><dd class="pd-stock ${stock > 10 ? 'in' : 'low'}">${stock > 10 ? 'In stock' : 'Low stock'} (${stock})</dd></div>
          <div><dt>Warranty</dt><dd>12 months</dd></div>
        </dl>
        <div class="pd-actions">
          <div class="qty"><button onclick="ProductPage.qty(-1)" aria-label="Decrease">−</button><span id="qtyVal">1</span><button onclick="ProductPage.qty(1)" aria-label="Increase">+</button></div>
          <button class="btn btn-primary" onclick="ProductPage.addCart()">Add to cart</button>
          <button class="btn btn-ghost" onclick="Home.fav(event,'${p.id}')">♡ Wishlist</button>
        </div>
        <div class="pd-tabs">
          <div class="tab-heads">
            <button class="tab-head active" onclick="ProductPage.tab(this,'desc')">Description</button>
            <button class="tab-head" onclick="ProductPage.tab(this,'specs')">Specifications</button>
            <button class="tab-head" onclick="ProductPage.tab(this,'rev')">Reviews (${p.reviews})</button>
          </div>
          <div class="tab-panel active" id="tab-desc"><p style="color:var(--text-muted)">Built to last with a refined design language. Includes everything you need in the box and ships with Smart Mall's buyer protection.</p></div>
          <div class="tab-panel" id="tab-specs"><dl class="pd-meta" style="grid-template-columns:1fr">
            <div><dt>Material</dt><dd>Aerospace-grade composite</dd></div>
            <div><dt>Weight</dt><dd>320g</dd></div>
            <div><dt>Colour options</dt><dd>Graphite, Sky, Sand</dd></div>
            <div><dt>In the box</dt><dd>Device, cable, quick-start guide</dd></div></dl></div>
          <div class="tab-panel" id="tab-rev">
            <div class="review"><div class="review-head"><b>Chidi N.</b><span style="color:var(--accent)">★★★★★</span></div><p style="color:var(--text-muted)">Exceeded expectations. Fast delivery and great quality.</p></div>
            <div class="review"><div class="review-head"><b>Amara K.</b><span style="color:var(--accent)">★★★★☆</span></div><p style="color:var(--text-muted)">Really solid for the price. Would buy again.</p></div>
          </div>
        </div>
      </div>
    </div>

    <section class="section" style="padding-top:1rem">
      <div class="sec-head"><span class="eyebrow">Smart suggestions</span><h2>Customers also bought</h2></div>
      <div class="grid product-grid" id="recGrid">${recs.map(recCard).join('')}</div>
    </section>`;

  window.ProductPage = {
    pick(el, bg) { document.querySelectorAll('.pd-thumb').forEach(t => t.classList.remove('active')); el.classList.add('active'); document.getElementById('mainImg').style.background = bg; },
    qty(d) { qty = Math.max(1, qty + d); document.getElementById('qtyVal').textContent = qty; },
    tab(el, name) { document.querySelectorAll('.tab-head').forEach(t => t.classList.remove('active')); el.classList.add('active'); document.querySelectorAll('.tab-panel').forEach(t => t.classList.remove('active')); document.getElementById('tab-' + name).classList.add('active'); },
    addCart() { const cart = JSON.parse(localStorage.getItem('mall-cart') || '[]'); for (let i = 0; i < qty; i++) cart.push(p.id); localStorage.setItem('mall-cart', JSON.stringify(cart)); const c = document.querySelector('[data-cart-count]'); if (c) c.textContent = cart.length; Home.add(new Event('x'), p.id); },
  };
  document.title = `${p.name} — Smart Mall`;

  // ---- Swap in real engine recommendations when the API is live ----
  if (window.MallAPI && MallAPI.enabled() && p._id) {
    (async () => {
      try {
        const res = await MallAPI.recBoughtTogether(p._id, 4);
        const list = (res.data && res.data.products) || [];
        if (!list.length) return; // keep the fallback recs
        const cards = list.map((r) => {
          const bg = (MallData.bgFor && MallData.bgFor(r.slug || r._id)) || 'linear-gradient(135deg,#2563EB,#14B8A6)';
          const catName = (r.category && r.category.name) || '';
          const url = `product.html?id=${r.slug || r._id}`;
          return `<article class="card p-card">
            <a class="p-media" href="${url}"><div class="ph" style="background:${bg}"></div></a>
            <div class="p-body"><span class="p-cat">${catName}</span>
            <a class="p-name" href="${url}">${r.name}</a>
            <div class="p-foot"><span class="p-price">${fmt(r.price)}</span>
            <button class="btn btn-primary p-add" onclick="Home.add(event,'${r._id}')">Add</button></div></div></article>`;
        }).join('');
        const grid = document.getElementById('recGrid');
        if (grid) grid.innerHTML = cards;
      } catch { /* keep fallback recs */ }
    })();
  }
})();
