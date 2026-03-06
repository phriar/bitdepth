// ─── BITDEPTH SHARED JS ───────────────────────────────────────────
// Live price data shared across all pages via sessionStorage
// so tool pages can read btcPriceForTools without re-fetching

const $ = id => document.getElementById(id);

function fmt(n, decimals = 0) {
  return n.toLocaleString('en-US', { maximumFractionDigits: decimals });
}
function fmtUSD(n) {
  if (n >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T';
  if (n >= 1e9)  return '$' + (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6)  return '$' + (n / 1e6).toFixed(1) + 'M';
  return '$' + fmt(n);
}

// Shared live price — stored in sessionStorage so tool pages can read it
let btcPriceForTools = parseFloat(sessionStorage.getItem('btcPrice') || '0');

function setBtcPrice(p) {
  btcPriceForTools = p;
  sessionStorage.setItem('btcPrice', p);
  sessionStorage.setItem('btcPriceTs', Date.now());
  // Dispatch event so tool pages can react
  window.dispatchEvent(new CustomEvent('btcPriceUpdated', { detail: p }));
}

// Read back stored price (used by tool pages)
function getStoredBtcPrice() {
  const ts = parseInt(sessionStorage.getItem('btcPriceTs') || '0');
  const age = Date.now() - ts;
  if (age < 120_000) return parseFloat(sessionStorage.getItem('btcPrice') || '0');
  return 0;
}

// ─── TICKER UPDATE ────────────────────────────────────────────────
function updateTicker(data) {
  const set = (ids, val) => ids.forEach(id => { const el = $(id); if (el) el.textContent = val; });
  const setClass = (ids, cls) => ids.forEach(id => { const el = $(id); if (el) el.className = cls; });

  if (data.price) {
    set(['tick-price','tick-price-2'], '$' + fmt(data.price));
  }
  if (data.change24h !== undefined) {
    const pos = data.change24h >= 0;
    const str = (pos ? '+' : '') + data.change24h.toFixed(2) + '%';
    const cls = pos ? 't-up' : 't-down';
    ['tick-change-1','tick-change-3'].forEach(id => { const el=$(id); if(el){el.textContent=str;el.className=cls;}});
    ['tick-change-2','tick-change-4'].forEach(id => { const el=$(id); if(el){el.textContent=str;el.className=cls;}});
  }
  if (data.hashrate)   set(['tick-hashrate','tick-hashrate-2'], data.hashrate);
  if (data.difficulty) set(['tick-difficulty','tick-difficulty-2'], data.difficulty);
  if (data.mempool)    set(['tick-mempool','tick-mempool-2'], data.mempool);
  if (data.halving)    set(['tick-halving','tick-halving-2'], data.halving);
  if (data.supply)     set(['tick-supply','tick-supply-2'], data.supply);
  if (data.mcap)       set(['tick-mcap','tick-mcap-2'], data.mcap);
  if (data.fees)       set(['tick-fees','tick-fees-2'], data.fees);
}

// ─── FETCH PRICE (mini — for tool pages that just need current price) ─
async function fetchBtcPriceMini() {
  // First try sessionStorage cache
  const cached = getStoredBtcPrice();
  if (cached > 0) {
    btcPriceForTools = cached;
    window.dispatchEvent(new CustomEvent('btcPriceUpdated', { detail: cached }));
    return cached;
  }
  // Otherwise fetch fresh
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
    const d = await res.json();
    const p = d.bitcoin.usd;
    setBtcPrice(p);
    return p;
  } catch(e) {
    return 0;
  }
}

// ─── NAV LAST UPDATED ─────────────────────────────────────────────
function updateNavTime() {
  const el = $('nav-last-updated');
  if (el) el.textContent = 'UPDATED ' + new Date().toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
}

// ─── HIGHLIGHT ACTIVE NAV LINK ────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href')?.split('/').pop();
    if (href === path) a.classList.add('active');
  });
});

// ─── HAMBURGER NAV ────────────────────────────────────────────────
(function() {
  function initBurger() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    // Create overlay (appended to body, behind drawer)
    const overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);

    // Create drawer (appended to body, not inside nav)
    const drawer = document.createElement('div');
    drawer.className = 'nav-drawer';
    drawer.setAttribute('aria-hidden', 'true');

    const navLinks = [
      { href: 'index.html',           label: '⌂ Home' },
      { href: 'index.html#tools',     label: '⚙ All Tools' },
      { href: 'tool-etf.html',        label: '🏦 ETF → 1 BTC' },
      { href: 'tool-satstack.html',   label: '📈 Sat Stack' },
      { href: 'tool-address.html',    label: '🔍 Address Checker' },
      { href: 'tool-fee.html',        label: '⛽ Fee Estimator' },
      { href: 'tool-alarm.html',      label: '🔔 Fee Alarm' },
      { href: 'tool-converter.html',  label: '🔄 Sats Converter' },
      { href: 'tool-halving.html',    label: '📉 Halving' },
      { href: 'tool-cheap.html',      label: '🎯 Is BTC Cheap?' },
      { href: 'tool-signal.html',     label: '📡 BTC Signal' },
      { href: 'tool-regret.html',     label: '😢 Regret Calc' },
      { href: 'index.html#markets',   label: '📊 Markets' },
      { href: 'index.html#onchain',   label: '⛓ On-Chain' },
      { href: 'index.html#mining',    label: '⛏ Mining' },
      { href: 'index.html#lightning', label: '⚡ Lightning' },
      { href: 'https://x.com/btc_journey', label: '𝕏 @btc_journey' },
    ];

    const curFile = window.location.pathname.split('/').pop() || 'index.html';
    navLinks.forEach(({ href, label }) => {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = label;
      if (href.split('/').pop().split('#')[0] === curFile) a.classList.add('active');
      if (href.startsWith('http')) { a.target = '_blank'; a.rel = 'noopener'; }
      drawer.appendChild(a);
    });
    document.body.appendChild(drawer);

    // Create burger button — insert before nav-status so flex order is correct
    const burger = document.createElement('button');
    burger.className = 'nav-burger';
    burger.setAttribute('aria-label', 'Open menu');
    burger.setAttribute('aria-expanded', 'false');
    burger.innerHTML = '<span></span><span></span><span></span>';

    // Insert burger as last child of nav (after logo, nav-links, nav-status)
    nav.appendChild(burger);

    function openMenu() {
      burger.classList.add('open');
      burger.setAttribute('aria-expanded', 'true');
      drawer.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeMenu() {
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    burger.addEventListener('click', (e) => {
      e.stopPropagation();
      burger.classList.contains('open') ? closeMenu() : openMenu();
    });
    overlay.addEventListener('click', closeMenu);
    drawer.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => { closeMenu(); });
    });
    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBurger);
  } else {
    initBurger(); // DOM already ready
  }
})();
