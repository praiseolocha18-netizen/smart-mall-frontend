/* ============================================================
   Smart Mall — API client
   One place that talks to the backend. If window.MALL_API is
   unset, callers fall back to the local mock catalogue so the
   site still runs standalone.
   ============================================================ */
window.MallAPI = (() => {
  const base = () => window.MALL_API || '';
  const SESSION = 'mall-session';

  function token() {
    try { return (JSON.parse(localStorage.getItem(SESSION) || '{}')).token || null; }
    catch { return null; }
  }

  async function request(path, { method = 'GET', body, auth = false } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth && token()) headers.Authorization = `Bearer ${token()}`;
    const res = await fetch(`${base()}${path}`, {
      method,
      headers,
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    });
    let data = {};
    try { data = await res.json(); } catch { /* empty body */ }
    if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
    return data;
  }

  const enabled = () => !!base();

  return {
    enabled,
    // catalogue
    listProducts: (qs = '') => request(`/api/products${qs}`),
    getProduct: (slug) => request(`/api/products/${slug}`),
    getProductById: (id) => request(`/api/products/id/${id}`),
    listCategories: () => request('/api/categories'),
    // cart (auth)
    getCart: () => request('/api/cart', { auth: true }),
    addToCart: (productId, quantity = 1) => request('/api/cart/items', { method: 'POST', auth: true, body: { productId, quantity } }),
    updateCartItem: (productId, quantity) => request(`/api/cart/items/${productId}`, { method: 'PATCH', auth: true, body: { quantity } }),
    removeCartItem: (productId) => request(`/api/cart/items/${productId}`, { method: 'DELETE', auth: true }),
    clearCart: () => request('/api/cart', { method: 'DELETE', auth: true }),
    // orders (auth)
    createOrder: (payload) => request('/api/orders', { method: 'POST', auth: true, body: payload }),
    listOrders: () => request('/api/orders', { auth: true }),
    getOrder: (id) => request(`/api/orders/${id}`, { auth: true }),
    verifyPayment: (id) => request(`/api/orders/${id}/verify`, { method: 'POST', auth: true }),
    // recommendations
    recTrending: (limit = 8) => request(`/api/recommendations/trending?limit=${limit}`),
    recSimilar: (productId, limit = 6) => request(`/api/recommendations/similar/${productId}?limit=${limit}`),
    recBoughtTogether: (productId, limit = 4) => request(`/api/recommendations/bought-together/${productId}?limit=${limit}`),
    recForYou: (limit = 8) => request(`/api/recommendations/for-you?limit=${limit}`, { auth: true }),
    trackView: (productId) => request(`/api/recommendations/view/${productId}`, { method: 'POST', auth: true }),
    raw: request,
  };
})();
