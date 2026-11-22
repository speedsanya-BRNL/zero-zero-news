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

function extractDomain(url) {
  try { return new URL(url).hostname; } catch { return 'example.com'; }
}

function card(item, cat) {
  const el = document.createElement('article');
  el.className = 'news-card';
  const img = item.thumbnail
    ? `<img loading="lazy" src="${item.thumbnail}" alt="" onerror="this.remove()">`
    : `<img loading="lazy" src="https://www.google.com/s2/favicons?sz=128&domain=${extractDomain(item.link)}" alt="">`;
  el.innerHTML = '<div class="photo">' + img + '</div>'
    + '<h5 class="cat">' + cat + '</h5>'
    + '<h4>' + item.title + '</h4>'
    + '<p class="meta">' + item.src + ' · ' + new Date(item.pubDate).toLocaleDateString('ru-RU') + '</p>'
    + '<a href="' + item.link + '" target="_blank" rel="noopener">👉 первоисточник →</a>';
  return el;
}

function buildRegion(regionId, regionName, data) {
  const sec = document.createElement('section');
  sec.className = 'region';
  sec.id = regionId;
  sec.innerHTML = '<h2 class="region-title">' + regionName + '</h2>';
  const grid = document.createElement('div');
  grid.className = 'card-grid';
  sec.appendChild(grid);
  let totalLoaded = 0;
  for (const cat of CATS_ORDER) {
    const items = (data[regionId] && data[regionId][cat]) || [];
    items.slice(0, COUNTS[cat]).forEach(function(item) {
      grid.appendChild(card(item, cat));
      totalLoaded++;
    });
  }
  const total = 50;
  sec.querySelector('.region-title').textContent = regionName + ' — ' + totalLoaded + '/' + total;
  return sec;
}

let lastUpdate = Date.now();
const REFRESH_INTERVAL = 2 * 60 * 60 * 1000;
let countdownInterval;

function startCountdown() {
  clearInterval(countdownInterval);
  countdownInterval = setInterval(function() {
    const remaining = Math.max(0, REFRESH_INTERVAL - (Date.now() - lastUpdate));
    const mins = Math.floor(remaining / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);
    const el = document.getElementById('countdown');
    if (el) el.textContent = 'Следующее обновление через: ' + mins + 'м ' + secs.toString().padStart(2, '0') + 'с';
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
    const r = await fetch('./news.json?t=' + Date.now());
    if (!r.ok) throw new Error('news.json не найден');
    const newsData = await r.json();
    app.textContent = '';
    for (const reg of REGIONS_ORDER) {
      nav.insertAdjacentHTML('beforeend', '<a href="#' + reg.id + '">' + reg.name + '</a>');
      app.appendChild(buildRegion(reg.id, reg.name, newsData.regions));
    }
    lastUpdate = Date.now();
    const upd = document.getElementById('updated');
    if (upd) upd.textContent = 'Обновлено: ' + new Date(newsData.updated).toLocaleString('ru-RU');
  } catch (e) {
   
