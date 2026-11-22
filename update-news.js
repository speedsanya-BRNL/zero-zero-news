const https = require('https');
const fs = require('fs');

const G = 'https://news.google.com/rss';

const REGIONS = {
  world: {
    'ОБЩИЕ': `${G}/headlines/section/topic/WORLD?hl=ru&gl=RU&ceid=RU:ru`,
    'ЭКОНОМИКА': `${G}/search?q=(экономика OR рынок OR бизнес OR финансы)&hl=ru&gl=RU&ceid=RU:ru`,
    'КРИМИНАЛ': `${G}/search?q=(арест OR полиция OR суд OR преступление OR ДТП)&hl=ru&gl=RU&ceid=RU:ru`
  },
  usa: {
    'ОБЩИЕ': `${G}/headlines/section/topic/NATIONAL?hl=en-US&gl=US&ceid=US:en`,
    'ЭКОНОМИКА': `${G}/search?q=(US economy OR stock OR Fed OR inflation OR business)&hl=en-US&gl=US&ceid=US:en`,
    'КРИМИНАЛ': `${G}/search?q=(US police OR arrest OR crime OR charged OR FBI)&hl=en-US&gl=US&ceid=US:en`
  },
  europe: {
    'ОБЩИЕ': `${G}/search?q=(Europe OR EU OR UK OR France OR Germany)&hl=en-GB&gl=GB&ceid=GB:en`,
    'ЭКОНОМИКА': `${G}/search?q=(Europe economy OR ECB OR inflation OR energy)&hl=en-GB&gl=GB&ceid=GB:en`,
    'КРИМИНАЛ': `${G}/search?q=(Europe police OR crime OR court OR fraud)&hl=en-GB&gl=GB&ceid=GB:en`
  },
  thailand: {
    'ОБЩИЕ': `${G}/search?q=(Thailand OR Bangkok OR Phuket)&hl=en-US&gl=TH&ceid=TH:en`,
    'ЭКОНОМИКА': `${G}/search?q=(Thailand economy OR baht OR trade OR tourism)&hl=en-US&gl=TH&ceid=TH:en`,
    'КРИМИНАЛ': `${G}/search?q=(Thailand police OR arrest OR raid OR scam)&hl=en-US&gl=TH&ceid=TH:en`
  },
  russia: {
    'ОБЩИЕ': `${G}/headlines/section/topic/NATIONAL?hl=ru&gl=RU&ceid=RU:ru`,
    'ЭКОНОМИКА': `${G}/search?q=(экономика OR бюджет OR курс OR ЦБ OR нефть)&hl=ru&gl=RU&ceid=RU:ru`,
    'КРИМИНАЛ': `${G}/search?q=(происшествия OR задержали OR уголовное OR суд OR ФСБ)&hl=ru&gl=RU&ceid=RU:ru`
  },
  barnaul: {
    'ОБЩИЕ': `${G}/search?q=(Барнаул OR Алтайский край)&hl=ru&gl=RU&ceid=RU:ru`,
    'ЭКОНОМИКА': `${G}/search?q=Барнаул (экономика OR бюджет OR бизнес OR стройка)&hl=ru&gl=RU&ceid=RU:ru`,
    'КРИМИНАЛ': `${G}/search?q=Барнаул (суд OR задержали OR уголовное OR мошенничество)&hl=ru&gl=RU&ceid=RU:ru`
  }
};

const COUNTS = { 'ОБЩИЕ': 20, 'ЭКОНОМИКА': 15, 'КРИМИНАЛ': 15 };

function fetchRSS(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode !== 200) { reject(new Error(`HTTP ${res.statusCode}`)); return; }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseRSS(xml) {
  const items = [];
  const regex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    const itemXml = match[1];
    const title = (itemXml.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
    const link = (itemXml.match(/<link>([\s\S]*?)<\/link>/) || [])[1] || '';
    const pubDate = (itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1] || '';
    const description = (itemXml.match(/<description>([\s\S]*?)<\/description>/) || [])[1] || '';
    const parts = title.split(' - ');
    const src = parts.length > 1 ? parts[parts.length - 1].trim() : '';
    const cleanTitle = parts.length > 1 ? parts.slice(0, -1).join(' - ').trim() : title;
    const imgMatch = description.match(/src="([^"]+)"/);
    const thumbnail = imgMatch ? imgMatch[1] : '';
    items.push({ title: cleanTitle, link, pubDate, src, thumbnail });
  }
  return items.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
}

async function main() {
  const result = { updated: new Date().toISOString(), regions: {} };

  for (const [regionId, categories] of Object.entries(REGIONS)) {
    result.regions[regionId] = {};
    for (const [catName, feedUrl] of Object.entries(categories)) {
      try {
        const xml = await fetchRSS(feedUrl);
        const items = parseRSS(xml).slice(0, COUNTS[catName]);
        result.regions[regionId][catName] = items;
        console.log(`✅ ${regionId}/${catName}: ${items.length} новостей`);
      } catch (e) {
        console.error(`❌ ${regionId}/${catName}: ${e.message}`);
        result.regions[regionId][catName] = [];
      }
    }
  }

  fs.writeFileSync('news.json', JSON.stringify(result, null, 2));
  console.log('💾 news.json сохранён');
}

main().catch(e => { console.error(e); process.exit(1); });
