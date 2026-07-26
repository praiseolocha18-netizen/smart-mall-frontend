/* ============ Cart logic ============ */
(() => {
  const fmt = n => '₦' + n.toLocaleString('en-NG');
  const KEY = 'mall-cart';
  const SHIPPING = 2500;

  function raw() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } }
  function save(arr) { localStorage.setItem(KEY, JSON.stringify(arr)); const c = document.querySelector('[data-cart-count]'); if (c) c.textContent = arr.length; }

  // collapse [id,id,id] into {id: qty}
  function grouped() {
    const g = {}; raw().forEach(id => g[id] = (g[id] || 0) + 1); return g;
  }

  function render() {
    const g = grouped();
    const ids = Object.keys(g);
    const layout = document.getElementById('cartLayout');
    const empty = document.getElementById('cartEmpty');
    if (!ids.length) { layout.style.display = 'none'; empty.hidden = false; return; }
    layout.style.display = ''; empty.hidden = true;

    const items = ids.map(id => {
      const p = MallData.products.find(x => x.id === id); if (!p) return '';
      const cat = MallData.categories.find(c => c.id === p.cat);
      return `<div class="cart-item">
        <div class="thumb" style="background:${p.bg}"></div>
        <div><span class="ci-cat">${cat ? cat.name : ''}</span><h3>${p.name}</h3><span class="ci-price">${fmt(p.price)}</span></div>
        <div class="ci-controls">
          <div class="qty-sm"><button onclick="Cart.dec('${id}')" aria-label="Decrease">−</button><span>${g[id]}</span><button onclick="Cart.inc('${id}')" aria-label="Increase">+</button></div>
          <button class="ci-remove" onclick="Cart.remove('${id}')">Remove</button>
        </div></div>`;
    }).join('');
    document.getElementById('cartItems').innerHTML = items;

    const subtotal = ids.reduce((s, id) => {
      const p = MallData.products.find(x => x.id === id); return s + (p ? p.price * g[id] : 0);
    }, 0);
    const total = subtotal + SHIPPING;
    document.getElementById('cartSummary').innerHTML = `
      <h3>Order summary</h3>
      <div class="sum-row"><span>Subtotal</span><span>${fmt(subtotal)}</span></div>
      <div class="sum-row"><span>Shipping</span><span>${fmt(SHIPPING)}</span></div>
      <div class="promo"><input class="input" placeholder="Promo code" id="promo"><button class="btn btn-ghost" onclick="Cart.promo()">Apply</button></div>
      <div class="sum-row total"><span>Total</span><span>${fmt(total)}</span></div>
      <a class="btn btn-primary btn-block" href="checkout.html" style="margin-top:1rem">Proceed to checkout</a>
      <a class="btn btn-ghost btn-block" href="products.html" style="margin-top:.6rem">Continue shopping</a>`;
  }

  window.Cart = {
    inc(id) { const a = raw(); a.push(id); save(a); render(); },
    dec(id) { const a = raw(); const i = a.indexOf(id); if (i > -1) a.splice(i, 1); save(a); render(); },
    remove(id) { save(raw().filter(x => x !== id)); render(); },
    promo() { const el = document.getElementById('promo'); if (el && el.value.trim()) { el.value = ''; alert('Promo codes apply at checkout once the backend is connected.'); } },
  };
  document.addEventListener('DOMContentLoaded', render);
})();
