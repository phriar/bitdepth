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
