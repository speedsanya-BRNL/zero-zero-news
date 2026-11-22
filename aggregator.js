// === ИСТОЧНИКИ НОВОСТЕЙ ===
const RSS2JSON = 'https://api.rss2json.com/v1/api.json?rss_url=';
const PROXIES = [
  u => `https://corsproxy.io/?${encodeURIComponent(u)}`,
  u => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
];
const G = 'https://news.google.com/rss';

const REGIONS = [
  { id:'world', name:'🌍 МИР', counts:[20,15,15], feeds:[
      `${G}/headlines/section/topic/WORLD?hl=ru&gl=RU&ceid=RU:ru`,
      `${G}/search?q=(экономика OR рынок OR бизнес OR финансы)&hl=ru&gl=RU&ceid=RU:ru`,
      `${G}/search?q=(арест OR полиция OR суд OR преступление OR ДТП)&hl=ru&gl=RU&ceid=RU:ru` ]},
  { id:'usa', name:'🇺🇸 США', counts:[20,15,15], feeds:[
      `${G}/headlines/section/topic/NATIONAL?hl=en-US&gl=US&ceid=US:en`,
      `${G}/search?q=(US economy OR stock OR Fed OR inflation OR business)&hl=en-US&gl=US&ceid=US:en`,
      `${G}/search?q=(US police OR arrest OR crime OR charged OR FBI)&hl=en-US&gl=US&ceid=US:en` ]},
  { id:'europe', name:'🇪🇺 ЕВРОПА', counts:[20,15,15], feeds:[
      `${G}/search?q=(Europe OR EU OR UK OR France OR Germany)&hl=en-GB&gl=GB&ceid=GB:en`,
      `${G}/search?q=(Europe economy OR ECB OR inflation OR energy)&hl=en-GB&gl=GB&ceid=GB:en`,
      `${G}/search?q=(Europe police OR crime OR court OR fraud)&hl=en-GB&gl=GB&ceid=GB:en` ]},
  { id:'thailand', name:'🇹🇭 ТАИЛАНД', counts:[20,15,15], feeds:[
      `${G}/search?q=(Thailand OR Bangkok OR Phuket)&hl=en-US&gl=TH&ceid=TH:en`,
      `${G}/search?q=(Thailand economy OR baht OR trade OR tourism)&hl=en-US&gl=TH&ceid=TH:en`,
      `${G}/search?q=(Thailand police OR arrest OR raid OR scam)&hl=en-US&gl=TH&ceid=TH:en` ]},
  { id:'russia', name:'🇷🇺 РОССИЯ', counts:[20,15,15], feeds:[
      `${G}/headlines/section/topic/NATIONAL?hl=ru&gl=RU&ceid=RU:ru`,
      `${G}/search?q=(экономика OR бюджет OR курс OR ЦБ OR нефть)&hl=ru&gl=RU&ceid=RU:ru`,
      `${G}/search?q=(происшествия OR задержали OR уголовное OR суд OR ФСБ)&hl=ru&gl=RU&ceid=RU:ru` ]},
  { id:'barnaul', name:'📍 БАРНАУЛ', counts:[20,15,15], feeds:[
      `${G}/search?q=(Барнаул OR Алтайский край)&hl=ru&gl=RU&ceid=RU:ru`,
      `${G}/search?q=Барнаул (экономика OR бюджет OR бизнес OR стройка)&hl=ru&gl
