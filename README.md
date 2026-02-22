# BitDepth 🟠

> Deep Bitcoin Intelligence — [bitdepth.app](https://bitdepth.app)

A terminal-grade Bitcoin research platform covering price, on-chain data, mining, and the Lightning Network.

---

## 🚀 Deploy (GitHub Pages + Cloudflare)

### 1. GitHub Setup

```bash
# Clone this repo
git clone https://github.com/YOUR_USERNAME/bitdepth.git
cd bitdepth

# The site lives at the root — just push and enable Pages
git add .
git commit -m "initial"
git push origin main
```

Then go to **Settings → Pages** in your GitHub repo and set:
- **Source:** Deploy from a branch
- **Branch:** `main` / `root`

Your site will be live at `https://YOUR_USERNAME.github.io/bitdepth`

---

### 2. Cloudflare Setup

1. Buy `bitdepth.app` on Namecheap
2. In Cloudflare, add the site and set nameservers (Cloudflare will give you two)
3. Update nameservers in Namecheap dashboard
4. In Cloudflare DNS, add:

| Type  | Name | Content                        | Proxy |
|-------|------|--------------------------------|-------|
| CNAME | @    | YOUR_USERNAME.github.io        | ✅    |
| CNAME | www  | YOUR_USERNAME.github.io        | ✅    |

5. In GitHub → Settings → Pages → Custom Domain, enter `bitdepth.app`
6. GitHub will create a `CNAME` file automatically

**Cloudflare settings to enable:**
- SSL/TLS: **Full (strict)**
- Always use HTTPS: **On**
- Auto Minify: JS, CSS, HTML
- Caching: Standard

---

## 📁 File Structure

```
bitdepth/
├── index.html       ← Main page (everything lives here for now)
├── CNAME            ← Auto-created by GitHub for custom domain
└── README.md
```

---

## 🔌 Suggested Free APIs (next steps)

| Data | API |
|------|-----|
| BTC Price | [CoinGecko API](https://www.coingecko.com/api) (free) |
| Block data | [Mempool.space API](https://mempool.space/docs/api) (free) |
| On-chain metrics | [Blockchain.info API](https://www.blockchain.com/explorer/api) |
| Lightning Network | [Mempool.space Lightning API](https://mempool.space/docs/api/lightning) |

---

## 📝 License

MIT