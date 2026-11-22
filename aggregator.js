var REGIONS_ORDER = [
  { id: 'world', name: '🌍 МИР' },
  { id: 'usa', name: '🇺🇸 США' },
  { id: 'europe', name: '🇪🇺 ЕВРОПА' },
  { id: 'thailand', name: '🇹🇭 ТАИЛАНД' },
  { id: 'russia', name: '🇷🇺 РОССИЯ' },
  { id: 'barnaul', name: '📍 БАРНАУЛ' }
];
var CATS_ORDER = ['ОБЩИЕ', 'ЭКОНОМИКА', 'КРИМИНАЛ'];
var COUNTS = { 'ОБЩИЕ': 20, 'ЭКОНОМИКА': 15, 'КРИМИНАЛ': 15 };
var isBuilding = false;

function extractDomain(url) {
  try { return new URL(url).hostname; } catch (e) { return 'example.com'; }
}

function card(item, cat) {
  var el = document.createElement('article');
  el.className = 'news-card';
  var imgSrc = item.thumbnail ? item.thumbnail : 'https://www.google.com/s2/favicons?sz=128&domain=' + extractDomain(item.link);
  var dateStr = new Date(item.pubDate).toLocaleDateString('ru-RU');
  el.innerHTML = '<div class="photo"><img loading="lazy" src="' + imgSrc + '" alt="" onerror="this.remove()"></div>' +
    '<h5 class="cat">' + cat + '</h5>' +
    '<h4>' + item.title + '</h4>' +
    '<p class="meta">' + item.src + ' · ' + dateStr + '</p>' +
    '<a href="' + item.link + '" target="_blank" rel="noopener">👉 первоисточник →</a>';
  return el;
}

function buildRegion(regionId, regionName, data) {
  var sec = document.createElement('section');
  sec.className = 'region';
  sec.id = regionId;
  sec.innerHTML = '<h2 class="region-title">' + regionName + '</h2>';
  var grid = document.createElement('div');
  grid.className = 'card-grid';
  sec.appendChild(grid);
  var totalLoaded = 0;
  for (var i = 0; i < CATS_ORDER.length; i++) {
    var cat = CATS_ORDER[i];
    var items = (data[regionId] && data[regionId][cat]) || [];
    var limit = COUNTS[cat];
    for (var j = 0; j < items.length && j < limit; j++) {
      grid.appendChild(card(items[j], cat));
      totalLoaded++;
    }
  }
  sec.querySelector('.region-title').textContent = regionName + ' — ' + totalLoaded + '/50';
  return sec;
}

var lastUpdate = Date.now();
var REFRESH_INTERVAL = 2 * 60 * 60 * 1000;
var countdownInterval;

function startCountdown() {
  clearInterval(countdownInterval);
  countdownInterval = setInterval(function() {
    var remaining = Math.max(0, REFRESH_INTERVAL - (Date.now() - lastUpdate));
    var mins = Math.floor(remaining / 60000);
    var secs = Math.floor((remaining % 60000) / 1000);
    var el = document.getElementById('countdown');
    if (el) el.textContent = 'Следующее обновление через: ' + mins + 'м ' + secs.toString().padStart(2, '0') + 'с';
    if (remaining === 0) { buildAll(); lastUpdate = Date.now(); }
  }, 1000);
}

function buildAll() {
  if (isBuilding) return;
  isBuilding = true;
  var app = document.getElementById('app');
  app.innerHTML = '<div class="loading">Загружаем новости…</div>';
  var nav = document.getElementById('nav');
  nav.innerHTML = '';
  fetch('./news.json?t=' + Date.now())
    .then(function(r) {
      if (!r.ok) throw new Error('news.json не найден');
      return r.json();
    })
    .then(function(newsData) {
      app.textContent = '';
      for (var i = 0; i < REGIONS_ORDER.length; i++) {
        var reg = REGIONS_ORDER[i];
        nav.insertAdjacentHTML('beforeend', '<a href="#' + reg.id + '">' + reg.name + '</a>');
        app.appendChild(buildRegion(reg.id, reg.name, newsData.regions));
      }
      lastUpdate = Date.now();
      var upd = document.getElementById('updated');
      if (upd) upd.textContent = 'Обновлено: ' + new Date(newsData.updated).toLocaleString('ru-RU');
    })
    .catch(function(e) {
      app.innerHTML = '<div class="loading">⚠ Ошибка: ' + e.message + '</div>';
    });
  startCountdown();
  isBuilding = false;
}

document.getElementById('today').textContent =
  new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
document.getElementById('refresh').onclick = buildAll;

if (!window._initialized) {
  window._initialized = true;
  buildAll();
}
