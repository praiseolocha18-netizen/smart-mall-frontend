/* ============ Auth logic (frontend) ============
   Talks to the backend once wired; for now validates and
   stores a mock session so protected pages are demoable.
   API base is centralised so swapping to Render is one edit. */
const Auth = (() => {
  const API = window.MALL_API || ''; // e.g. 'https://smart-mall-api.onrender.com'
  const SESSION = 'mall-session';

  function setErr(id, msg) { const e = document.getElementById(id); if (e) e.textContent = msg || ''; }
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  function togglePw(id, btn) {
    const i = document.getElementById(id);
    const show = i.type === 'password';
    i.type = show ? 'text' : 'password';
    btn.textContent = show ? 'Hide' : 'Show';
  }

  function strength(v) {
    const el = document.getElementById('pwStrength');
    let score = 0;
    if (v.length >= 8) score++;
    if (/[A-Z]/.test(v)) score++;
    if (/[0-9]/.test(v)) score++;
    if (/[^A-Za-z0-9]/.test(v)) score++;
    const labels = ['Too weak', 'Weak', 'Okay', 'Good', 'Strong'];
    const colors = ['#DC2626', '#DC2626', '#F59E0B', '#10B981', '#10B981'];
    el.textContent = v ? `Strength: ${labels[score]}` : 'Use 8+ characters with a mix of letters and numbers.';
    el.style.color = v ? colors[score] : 'var(--text-muted)';
  }

  async function login(e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const pw = document.getElementById('pw').value;
    if (!validEmail(email)) return setErr('loginErr', 'Enter a valid email address.'), false;
    if (pw.length < 6) return setErr('loginErr', 'Password is too short.'), false;
    setErr('loginErr', '');
    try {
      if (API) {
        const r = await fetch(`${API}/api/auth/login`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: pw }),
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data.message || 'Sign in failed.');
        localStorage.setItem(SESSION, JSON.stringify({ token: data.token, user: data.user }));
      } else {
        localStorage.setItem(SESSION, JSON.stringify({ token: 'demo', user: { name: 'Guest', email } }));
      }
      location.href = 'dashboard.html';
    } catch (err) { setErr('loginErr', err.message); }
    return false;
  }

  async function register(e) {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('remail').value.trim();
    const pw = document.getElementById('rpw').value;
    const agree = document.getElementById('agree').checked;
    if (name.length < 2) return setErr('regErr', 'Enter your full name.'), false;
    if (!validEmail(email)) return setErr('regErr', 'Enter a valid email address.'), false;
    if (pw.length < 8) return setErr('regErr', 'Password must be at least 8 characters.'), false;
    if (!agree) return setErr('regErr', 'Please accept the terms to continue.'), false;
    setErr('regErr', '');
    try {
      if (API) {
        const r = await fetch(`${API}/api/auth/register`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password: pw }),
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data.message || 'Registration failed.');
        localStorage.setItem(SESSION, JSON.stringify({ token: data.token, user: data.user }));
      } else {
        localStorage.setItem(SESSION, JSON.stringify({ token: 'demo', user: { name, email } }));
      }
      location.href = 'dashboard.html';
    } catch (err) { setErr('regErr', err.message); }
    return false;
  }

  function logout() { localStorage.removeItem(SESSION); location.href = 'index.html'; }
  function current() { try { return JSON.parse(localStorage.getItem(SESSION)); } catch { return null; } }

  return { login, register, togglePw, strength, logout, current };
})();
