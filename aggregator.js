const REGIONS_ORDER = [
  { id: 'world', name: '🌍 МИР' },
  { id: 'usa', name: '🇺🇸 США' },
  { id: 'europe', name: '🇪🇺 ЕВРОПА' },
  { id: 'thailand', name: '🇹🇭 ТАИЛАНД' },
  { id: 'russia', name: '🇷🇺 РОССИЯ' },
  { id: 'barnaul', name: '📍 БАРНАУЛ' }
];
const CATS_ORDER = ['ОБЩИЕ', 'ЭКОНОМИКА', 'КРИМИНАЛ'];
const COUNTS = { 'ОБЩИЕ': 20, 'ЭКОНОМИКА': 15, 'КРИМИНАЛ': 15 };

let isBuilding = false;

async function loadNews() {
  const r = await fetch('./news.json?t=' + Date.now());
  if (!r.ok) throw new Error('news.json не найден');
  return await r.json();
}

function extractDomain(url) {
  try { return new URL(url).hostname; } catch { return 'example.com'; }
}

function card(item, cat) {
  const el = document.createElement('article');
  el.className = 'news-card';
  const imgHtml = item.thumbnail
    ? `<img loading="lazy" src="${item.thumbnail}" alt="" onerror="this.remove()">`
    : `<img loading="lazy" src="https://www.google.com/s2/favicons?sz=128&domain=${extractDomain(item.link)}" alt="">`;
  el.innerHTML = `
    <div class="photo">${imgHtml}</div>
    <h5 class="cat">${cat}</h5>
    <h4>${item.title}</h4>
    <p class="meta">${item.src} · ${new Date(item.pubDate).toLocaleDateString('ru-RU')}</p>
    <a href="${item.link}" target="_blank" rel="noopener">👉 первоисточник →</a>
  `;
  return el;
}

function buildRegion(regionId, regionName, data) {
  const sec = document.createElement('section');
  sec.className = 'region';
  sec.id = regionId;
  sec.innerHTML = `<h2 class="region-title">${regionName}</h2>`;
  const grid = document.createElement('div');
  grid.className = 'card-grid';
  sec.appendChild(grid);

  let totalLoaded = 0;
  for (const cat of CATS_ORDER) {
    const items = (data[regionId] && data[regionId][cat]) || [];
    items.slice(0, COUNTS[cat]).forEach(item => {
      grid.appendChild(card(item, cat));
      totalLoaded++;
    });
  }

  const total = Object.values(COUNTS).reduce((a, b) => a + b, 0);
  sec.querySelector('.region-title').textContent = `${regionName} — ${totalLoaded}/${total}`;
  return sec;
}

let lastUpdate = Date.now();
const REFRESH_INTERVAL = 2 * 60 * 60 * 1000;
let countdownInterval;

function startCountdown() {
  clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    const remaining = Math.max(0, REFRESH_INTERVAL - (Date.now() - lastUpdate));
    const mins = Math.floor(remaining / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);
    const el = document.getElementById('countdown');
    if (el) el.textContent = `Следующее обновление через: ${mins}м ${secs.toString().padStart(2, '0')}с`;
    if (remaining === 0) { buildAll(); lastUpdate = Date.now(); }
  }, 1000);
}

async function buildAll() {
  if (isBuilding) return;
  isBuilding = true;

  const app = document.getElementById('app');
  app.innerHTML = '<div class="loading">Загружаем новости…</div>';
  const nav = document.getElementById('nav');
  nav.innerHTML = '';

  try {
    const newsData = await loadNews();
    app.textContent = '';
    for (const r of REGIONS_ORDER) {
      nav.insertAdjacentHTML('beforeend', `<a href="#${r.id}">${r.name}</a>`);
      app.appendChild(buildRegion(r.id, r.name, newsData.regions));
    }
    lastUpdate = Date.now();
   
