/* ============================================================
   Smart Mall — catalogue data layer
   Provides window.MallData with { categories, products }.
   - If the backend (window.MALL_API) is configured, load() fetches
     live data and normalises it into the shape the UI expects.
   - Otherwise it falls back to the built-in mock catalogue so the
     site still runs standalone.
   ============================================================ */
window.MallData = (() => {
  const grad = (a, b) => `linear-gradient(135deg,${a},${b})`;

  // Deterministic gradient per id, so backend products (which have no
  // gradient field) still get a consistent colourful placeholder.
  const PALETTES = [
    ['#2563EB', '#14B8A6'], ['#F59E0B', '#EF4444'], ['#8B5CF6', '#2563EB'],
    ['#EC4899', '#F59E0B'], ['#10B981', '#2563EB'], ['#06B6D4', '#8B5CF6'],
    ['#22C55E', '#84CC16'], ['#F97316', '#EAB308'], ['#EC4899', '#8B5CF6'],
  ];
  function bgFor(key) {
    let h = 0;
    const s = String(key);
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    const [a, b] = PALETTES[h % PALETTES.length];
    return grad(a, b);
  }

  // ---- Built-in mock (fallback) ----
  const mockCategories = [
    { id: 'electronics', name: 'Electronics', count: 1240, bg: grad('#2563EB', '#14B8A6') },
    { id: 'fashion', name: 'Fashion', count: 2380, bg: grad('#F59E0B', '#EF4444') },
    { id: 'home', name: 'Home & Living', count: 940, bg: grad('#8B5CF6', '#2563EB') },
    { id: 'beauty', name: 'Beauty', count: 610, bg: grad('#EC4899', '#F59E0B') },
    { id: 'sports', name: 'Sports', count: 720, bg: grad('#10B981', '#2563EB') },
    { id: 'toys', name: 'Toys & Kids', count: 430, bg: grad('#06B6D4', '#8B5CF6') },
    { id: 'grocery', name: 'Grocery', count: 1580, bg: grad('#22C55E', '#84CC16') },
    { id: 'books', name: 'Books', count: 890, bg: grad('#F97316', '#EAB308') },
  ];
  const mockProducts = [
    { id: 'p1', name: 'Aurora Wireless Buds', cat: 'electronics', price: 42000, old: 55000, rating: 4.8, reviews: 320, bg: grad('#2563EB', '#14B8A6'), badges: ['sale', 'best'] },
    { id: 'p2', name: 'Solace Smartwatch', cat: 'electronics', price: 89500, rating: 4.7, reviews: 210, bg: grad('#F59E0B', '#EF4444'), badges: ['new'] },
    { id: 'p3', name: 'Nimbus Backpack', cat: 'fashion', price: 27900, rating: 4.9, reviews: 540, bg: grad('#8B5CF6', '#2563EB'), badges: ['best'] },
    { id: 'p4', name: 'Lumen Desk Lamp', cat: 'home', price: 18500, old: 22000, rating: 4.6, reviews: 130, bg: grad('#EC4899', '#F59E0B'), badges: ['sale'] },
    { id: 'p5', name: 'Terra Running Shoes', cat: 'sports', price: 63000, rating: 4.8, reviews: 410, bg: grad('#10B981', '#2563EB'), badges: ['new'] },
    { id: 'p6', name: 'Velvet Skincare Set', cat: 'beauty', price: 34500, old: 41000, rating: 4.9, reviews: 275, bg: grad('#EC4899', '#8B5CF6'), badges: ['sale', 'best'] },
    { id: 'p7', name: 'Cobalt Blender Pro', cat: 'home', price: 52000, rating: 4.5, reviews: 98, bg: grad('#06B6D4', '#2563EB'), badges: [] },
    { id: 'p8', name: 'Atlas Hardcover Set', cat: 'books', price: 15900, rating: 4.7, reviews: 64, bg: grad('#F97316', '#EAB308'), badges: ['new'] },
  ];

  // Live catalogue starts as the mock, replaced by load() when the API is on.
  const state = { categories: mockCategories.slice(), products: mockProducts.slice(), source: 'mock', loaded: false };

  // ---- Normalisers: backend shape -> UI shape ----
  function normCategory(c) {
    return { id: c.slug, _id: c._id, name: c.name, count: c.productCount || 0, bg: bgFor(c.slug || c.name) };
  }
  function normProduct(p) {
    const catSlug = (p.category && p.category.slug) || p.category || '';
    return {
      id: p.slug,          // used in URLs (?id=slug)
      _id: p._id,          // real Mongo id, used for cart/order calls
      slug: p.slug,
      name: p.name,
      cat: catSlug,
      price: p.price,
      old: p.compareAtPrice || undefined,
      rating: p.ratingAverage || 0,
      reviews: p.ratingCount || 0,
      stock: p.stock,
      badges: p.badges || [],
      bg: bgFor(p.slug || p._id || p.name),
    };
  }

  /**
   * Load the catalogue. When the API is configured, fetch categories and
   * a page of products and normalise them. Falls back to mock on any error.
   * Safe to call multiple times; only fetches once.
   */
  async function load() {
    if (state.loaded) return state;
    if (!window.MallAPI || !window.MallAPI.enabled()) { state.loaded = true; return state; }
    try {
      const [catRes, prodRes] = await Promise.all([
        window.MallAPI.listCategories(),
        window.MallAPI.listProducts('?limit=60'),
      ]);
      const cats = (catRes.data.categories || []).map(normCategory);
      const prods = (prodRes.data.products || []).map(normProduct);
      if (cats.length) state.categories = cats;
      if (prods.length) state.products = prods;
      state.source = 'api';
    } catch (err) {
      console.warn('Falling back to mock catalogue:', err.message);
      state.source = 'mock';
    }
    state.loaded = true;
    return state;
  }

  return {
    get categories() { return state.categories; },
    get products() { return state.products; },
    get source() { return state.source; },
    bgFor,
    load,
  };
})();
