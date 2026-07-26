/* ============ Shop logic ============ */
(() => {
  const params = new URLSearchParams(location.search);
  const state = {
    cats: new Set(params.get('cat') ? [params.get('cat')] : []),
    maxPrice: 100000, minRating: 0, sort: 'pop', query: params.get('q') || '',
    deals: params.get('deals') === '1',
  };

  const els = {
    results: document.getElementById('results'),
    noResults: document.getElementById('noResults'),
    count: document.getElementById('shopCount'),
    title: document.getElementById('shopTitle'),
    search: document.getElementById('searchBox'),
    sort: document.getElementById('sortSelect'),
    price: document.getElementById('priceRange'),
    priceOut: document.getElementById('priceOut'),
    catFilters: document.getElementById('catFilters'),
    ratingFilters: document.getElementById('ratingFilters'),
    reset: document.getElementById('resetFilters'),
    filters: document.querySelector('.filters'),
    fToggle: document.getElementById('filterToggle'),
    fClose: document.getElementById('filterClose'),
  };

  function buildCatFilters() {
    els.catFilters.innerHTML = MallData.categories.map(c => `
      <label class="check">
        <input type="checkbox" value="${c.id}" ${state.cats.has(c.id) ? 'checked' : ''}>
        ${c.name}
      </label>`).join('');
    els.catFilters.querySelectorAll('input').forEach(i =>
      i.addEventListener('change', () => {
        i.checked ? state.cats.add(i.value) : state.cats.delete(i.value);
        render();
      }));
  }

  function apply() {
    let list = MallData.products.slice();
    if (state.cats.size) list = list.filter(p => state.cats.has(p.cat));
    if (state.deals) list = list.filter(p => p.old);
    list = list.filter(p => p.price <= state.maxPrice && p.rating >= state.minRating);
    if (state.query) {
      const q = state.query.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q));
    }
    const s = state.sort;
    if (s === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (s === 'price-desc') list.sort((a, b) => b.price - a.price);
    else if (s === 'rating') list.sort((a, b) => b.rating - a.rating);
    else if (s === 'pop') list.sort((a, b) => b.reviews - a.reviews);
    return list;
  }

  // reuse Home.productCard markup via a light copy (Home keeps it private, so replicate minimal)
  const fmt = n => '₦' + n.toLocaleString('en-NG');
  function card(p) {
    const cat = MallData.categories.find(c => c.id === p.cat);
    const stars = '★'.repeat(Math.round(p.rating)) + '☆'.repeat(5 - Math.round(p.rating));
    const badges = (p.badges || []).map(k => {
      const m = { sale: ['badge-sale', 'Sale'], new: ['badge-new', 'New'], best: ['badge-best', 'Best seller'] }[k];
      return m ? `<span class="badge ${m[0]}">${m[1]}</span>` : '';
    }).join('');
    return `<article class="card p-card reveal in">
      <a class="p-media" href="product.html?id=${p.id}">
        <div class="ph" style="background:${p.bg}"></div>
        <div class="p-badges">${badges}</div>
      </a>
      <div class="p-body">
        <span class="p-cat">${cat ? cat.name : ''}</span>
        <a class="p-name" href="product.html?id=${p.id}">${p.name}</a>
        <span class="p-rating">${stars} <span style="color:var(--text-muted)">(${p.reviews})</span></span>
        <div class="p-foot">
          <span class="p-price">${fmt(p.price)}${p.old ? `<span class="p-old">${fmt(p.old)}</span>` : ''}</span>
          <button class="btn btn-primary p-add" onclick="Home.add(event,'${p.id}')">Add</button>
        </div>
      </div>
    </article>`;
  }

  function render() {
    const list = apply();
    els.results.innerHTML = list.map(card).join('');
    els.noResults.hidden = list.length > 0;
    els.count.textContent = `${list.length} product${list.length === 1 ? '' : 's'}`;
    if (state.cats.size === 1) {
      const c = MallData.categories.find(x => x.id === [...state.cats][0]);
      els.title.textContent = c ? c.name : 'All products';
    } else {
      els.title.textContent = state.deals ? "Today's deals" : 'All products';
    }
  }

  function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

  // Wire events
  buildCatFilters();
  if (state.query) els.search.value = state.query;
  els.search.addEventListener('input', debounce(e => { state.query = e.target.value.trim(); render(); }, 250));
  els.sort.addEventListener('change', e => { state.sort = e.target.value; render(); });
  els.price.addEventListener('input', e => {
    state.maxPrice = +e.target.value;
    els.priceOut.textContent = '₦' + Math.round(state.maxPrice / 1000) + 'k';
    render();
  });
  els.ratingFilters.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    els.ratingFilters.querySelectorAll('button').forEach(x => x.classList.remove('active'));
    b.classList.add('active'); state.minRating = +b.dataset.rating; render();
  });
  els.reset.addEventListener('click', () => {
    state.cats.clear(); state.maxPrice = 100000; state.minRating = 0; state.query = ''; state.deals = false;
    els.price.value = 100000; els.priceOut.textContent = '₦100k'; els.search.value = '';
    els.ratingFilters.querySelectorAll('button').forEach((x, i) => x.classList.toggle('active', i === 0));
    buildCatFilters(); render();
  });
  els.fToggle?.addEventListener('click', () => els.filters.classList.add('open'));
  els.fClose?.addEventListener('click', () => els.filters.classList.remove('open'));

  // Load live catalogue (if API configured) then render.
  (async () => {
    if (window.MallData && MallData.load) { try { await MallData.load(); } catch {} }
    buildCatFilters();
    render();
  })();
})();
