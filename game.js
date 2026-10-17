'use strict';

/* ============ 資料 ============ */

// 指法：手(L/R) + 手指(0 小指,1 無名指,2 中指,3 食指,4 拇指)
const FINGER = {};
[['qaz', 'L0'], ['wsx', 'L1'], ['edc', 'L2'], ['rfvtgb', 'L3'],
 ['yhnujm', 'R3'], ['ik,', 'R2'], ['ol.', 'R1'], ['p;/', 'R0'], [' ', 'R4']]
  .forEach(([keys, f]) => [...keys].forEach(k => (FINGER[k] = f)));

const FINGER_NAME = ['小指', '無名指', '中指', '食指', '拇指'];
const FINGER_COLOR = ['--f-pinky', '--f-ring', '--f-middle', '--f-index', '--f-thumb'];
const ROWS = ['qwertyuiop', 'asdfghjkl;', 'zxcvbnm,./'];
const ABC = 'abcdefghijklmnopqrstuvwxyz';

// 關卡：keys 為累積可用按鍵，newKeys 為本關新教的鍵（出題時加重）
const LEVELS = [
  { name: '小麥粉入門', keys: 'qwer', newKeys: 'qwer', target: 10, time: 60, len: [1, 3] },
  { name: '奶油上排', keys: 'qwertyui', newKeys: 'tyui', target: 10, time: 60, len: [2, 3] },
  { name: '上排全制霸', keys: 'qwertyuiop', newKeys: 'op', target: 12, time: 60, len: [2, 4] },
  { name: '基準列 ASDF', keys: 'qwertyuiopasdf', newKeys: 'asdf', target: 12, time: 60, len: [2, 4] },
  { name: '基準列 JKL', keys: 'qwertyuiopasdfghjkl', newKeys: 'ghjkl', target: 12, time: 55, len: [2, 4] },
  { name: '下排 ZXCV', keys: 'qwertyuiopasdfghjklzxcv', newKeys: 'zxcv', target: 12, time: 55, len: [3, 5] },
  { name: '下排 BNM', keys: ABC, newKeys: 'bnm', target: 12, time: 50, len: [3, 5] },
  { name: '聖誕單字', keys: ABC, newKeys: '', target: 14, time: 50, len: [3, 6], wordsOnly: true },
  { name: '長長的樹幹蛋糕', keys: ABC, newKeys: '', target: 14, time: 50, len: [6, 12], wordsOnly: true },
  { name: '聖誕祝福', keys: ABC + ' ', newKeys: ' ', target: 8, time: 60, len: [6, 30], phrases: true },
  { name: '平安夜大訂單', keys: ABC + ' ', newKeys: '', target: 12, time: 60, len: [6, 30], phrases: true },
];

// 每關三星可得的收藏甜點
const DISHES = [
  { e: '🍪', name: '薑餅人餅乾', en: 'Gingerbread Man', desc: '加了薑與肉桂的香脆餅乾，笑臉是倉鼠店長親手擠上去的！' },
  { e: '🍬', name: '拐杖糖', en: 'Candy Cane', desc: '紅白條紋的薄荷糖，掛在聖誕樹上也很可愛。' },
  { e: '☕', name: '棉花糖熱可可', en: 'Hot Cocoa', desc: '濃濃的巧克力加上蓬鬆棉花糖，雪天裡最暖心的一杯。' },
  { e: '🧁', name: '雪人杯子蛋糕', en: 'Snowman Cupcake', desc: '奶油霜堆成的小雪人，戴著巧克力做的小帽子。' },
  { e: '🍩', name: '花圈甜甜圈', en: 'Wreath Donut', desc: '綠色抹茶糖霜配上紅莓，像一個可以吃的聖誕花圈。' },
  { e: '🥧', name: '肉桂蘋果派', en: 'Apple Pie', desc: '烤得金黃的派皮，切開就飄出蘋果與肉桂的香氣。' },
  { e: '🍞', name: '史多倫麵包', en: 'Stollen', desc: '德國的傳統聖誕麵包，裡面藏著果乾，外面撒滿糖粉雪。' },
  { e: '🍮', name: '聖誕布丁', en: 'Christmas Pudding', desc: '英國的聖誕節甜點，上面還插著一小枝冬青葉。' },
  { e: '🍫', name: '樹幹蛋糕', en: 'Bûche de Noël', desc: '捲成木頭形狀的巧克力蛋糕，旁邊還有蘑菇裝飾。' },
  { e: '🎂', name: '草莓聖誕蛋糕', en: 'Strawberry Cake', desc: '鬆軟海綿蛋糕配上鮮奶油和大顆草莓，是店裡的招牌。' },
  { e: '🏠', name: '薑餅屋', en: 'Gingerbread House', desc: '用薑餅和糖果蓋成的小屋，是平安夜最棒的禮物！' },
];

const WORDS = `we were ewe err rew wee tree treat tire tie try yet quite quiet write wire tower power pour our out
up it to you your put pot top tip type pie pity poet port rope ripe pure sure tour toy
sad dad add as ask far fat fast feet free fresh tea eat seat sweet tart toast stir dip deep
egg jelly jam salt sugar flour dough fudge honey lake hill glass gift fold half sled jolly holly
cake bake cookie cream pie bun milk mix oven baker bread candy cocoa donut lemon mango melon
peach pear plum nut cheese sauce syrup toffee wafer cup box bowl spoon whisk butter
snow star bell elf tree gift cane noel santa merry sleigh ribbon wreath mitten scarf cozy
cupcake muffin pudding biscuit brownie caramel cinnamon pancake waffle croissant macaron
chocolate strawberry blueberry marshmallow vanilla pumpkin hamster bakery dessert sprinkle
christmas snowman reindeer present stocking ornament candle gingerbread snowflake peppermint
meringue raspberry cheesecake pineapple tiramisu chimney mistletoe`.split(/\s+/);

const PHRASES = ['merry christmas', 'jingle bells', 'let it snow', 'ho ho ho', 'hot cocoa', 'happy holidays',
  'silent night', 'deck the halls', 'snow is falling', 'a gift for you', 'bake a cake', 'warm milk',
  'gingerbread man', 'candy cane', 'thank you santa', 'happy hamster', 'sweet dreams', 'open the oven',
  'star on the tree', 'little baker', 'cookies for santa', 'one more muffin', 'see you next year'];

const DESSERTS = ['🍰', '🧁', '🍪', '🥐', '🍩', '🍮', '🥧', '🍞', '🍫', '🍬', '🍭', '🎂', '☕', '🥛'];
const CUSTOMERS = ['🐰', '🐻', '🐱', '🐶', '🐼', '🦊', '🐨', '🐷', '🐧', '🐹', '🦌', '⛄', '🐻‍❄️', '🦉'];
const HEARTS = 10; // 愛心總數，每顆代表 關卡時間 / HEARTS 秒

/* ============ 存檔 ============ */
const SAVE_KEY = 'hamster-bakery-v1';
let save = { coins: 0, unlocked: 1, stars: {}, bestWpm: 0, music: true, sfx: true };
try { Object.assign(save, JSON.parse(localStorage.getItem(SAVE_KEY)) || {}); } catch (e) {}
function persist() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) {} }
const hasDish = i => (save.stars[i] || 0) >= 3;

/* ============ 工具 ============ */
const $ = s => document.querySelector(s);
const rand = a => a[Math.floor(Math.random() * a.length)];
const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === 'screen-' + id));
  if (id === 'levels') renderLevels();
  if (id === 'collection') renderCollection();
  if (id === 'home') $('#home-best').textContent = save.bestWpm ? `🏆 最佳速度 ${save.bestWpm} 字/分` : '';
  updateCoins();
}
function updateCoins(bump) {
  document.querySelectorAll('.coin-count').forEach(e => (e.textContent = save.coins + (G && G.running ? G.coins : 0)));
  if (bump) document.querySelectorAll('.screen.active .coin-badge').forEach(b => FX.shake(b, 'bump'));
}

/* ============ 插圖 ============ */
function hamsterSVG(mood = 'happy') {
  const mouth = mood === 'sad'
    ? '<path d="M92 118 q8 -6 16 0" stroke="#5a4032" stroke-width="3" fill="none" stroke-linecap="round"/>'
    : '<path d="M92 114 q4 6 8 0 q4 6 8 0" stroke="#5a4032" stroke-width="3" fill="none" stroke-linecap="round"/>';
  return `<svg viewBox="0 0 200 190" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="100" cy="178" rx="70" ry="8" fill="rgba(0,0,0,.15)"/>
    <ellipse cx="56" cy="58" rx="20" ry="20" fill="#e9a77a"/><ellipse cx="56" cy="60" rx="11" ry="11" fill="#f7c1c0"/>
    <ellipse cx="144" cy="58" rx="20" ry="20" fill="#e9a77a"/><ellipse cx="144" cy="60" rx="11" ry="11" fill="#f7c1c0"/>
    <ellipse cx="100" cy="115" rx="72" ry="64" fill="#f0b48a"/>
    <ellipse cx="100" cy="132" rx="50" ry="44" fill="#fff4e6"/>
    <path d="M58 58 C60 20 100 0 140 12 C158 18 166 30 164 44 L146 58 Z" fill="#d64545"/>
    <rect x="50" y="48" width="104" height="18" rx="9" fill="#fff"/>
    <circle cx="164" cy="44" r="11" fill="#fff"/>
    <circle cx="78" cy="96" r="7" fill="#3d2a20"/><circle cx="80" cy="93" r="2.2" fill="#fff"/>
    <circle cx="122" cy="96" r="7" fill="#3d2a20"/><circle cx="124" cy="93" r="2.2" fill="#fff"/>
    <ellipse cx="62" cy="112" rx="10" ry="6" fill="#f7a8a0" opacity=".7"/>
    <ellipse cx="138" cy="112" rx="10" ry="6" fill="#f7a8a0" opacity=".7"/>
    <ellipse cx="100" cy="106" rx="5" ry="3.5" fill="#d9786a"/>
    ${mouth}
    <path d="M70 150 q30 14 60 0 l-4 12 q-26 10 -52 0z" fill="#3e8e63"/>
    <ellipse cx="66" cy="164" rx="14" ry="9" fill="#e9a77a"/><ellipse cx="134" cy="164" rx="14" ry="9" fill="#e9a77a"/>
  </svg>`;
}

const PAW_SVG = `<svg class="paw" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <g fill="#fff" stroke="#d64545" stroke-width="3">
    <ellipse cx="32" cy="42" rx="15" ry="13"/>
    <ellipse cx="14" cy="26" rx="6.5" ry="8"/><ellipse cx="25" cy="15" rx="6.5" ry="8.5"/>
    <ellipse cx="39" cy="15" rx="6.5" ry="8.5"/><ellipse cx="50" cy="26" rx="6.5" ry="8"/>
  </g>
  <g fill="#f7a8b8"><ellipse cx="32" cy="43" rx="8" ry="6"/><circle cx="14" cy="27" r="3"/>
  <circle cx="25" cy="16" r="3"/><circle cx="39" cy="16" r="3"/><circle cx="50" cy="27" r="3"/></g>
</svg>`;

// 手：依手指畫出圓角矩形；左手由左到右為 小指→拇指，右手相反
function handSVG(side) {
  const fingers = [
    { x: 10, h: 62, y: 58 },  // 小指
    { x: 46, h: 82, y: 34 },  // 無名指
    { x: 82, h: 92, y: 22 },  // 中指
    { x: 118, h: 84, y: 32 }, // 食指
  ];
  let parts = fingers.map((f, i) =>
    `<rect class="finger" id="f-${side}${i}" x="${f.x}" y="${f.y}" width="30" height="${f.h}" rx="15"
       fill="var(${FINGER_COLOR[i]})" stroke="#c9a385" stroke-width="2"/>`).join('');
  parts += `<rect class="finger" id="f-${side}4" x="150" y="118" width="28" height="62" rx="14"
     transform="rotate(-50 164 150)" fill="var(${FINGER_COLOR[4]})" stroke="#c9a385" stroke-width="2"/>`;
  // 手套：紅色袖口加白毛邊
  const palm = `<rect x="8" y="104" width="144" height="96" rx="40" fill="#ffe3cf" stroke="#c9a385" stroke-width="2"/>
    <rect x="18" y="186" width="124" height="22" rx="8" fill="#d64545"/><rect x="14" y="180" width="132" height="12" rx="6" fill="#fff"/>`;
  const flip = side === 'R' ? 'transform="translate(200 0) scale(-1 1)"' : '';
  return `<svg viewBox="0 0 200 210" xmlns="http://www.w3.org/2000/svg"><g ${flip}>${palm}${parts}</g></svg>`;
}

function buildLights() {
  const colors = ['#ff5a5a', '#ffd34d', '#5ad17a', '#5ab4ff', '#ff8ad8'];
  const n = Math.ceil(innerWidth / 48);
  $('#lights').innerHTML = Array.from({ length: n }, (_, i) =>
    `<span class="bulb" style="background:${colors[i % 5]};color:${colors[i % 5]};animation-delay:${(i % 3) * 0.5}s"></span>`).join('');
}

/* ============ 鍵盤 ============ */
function buildKeyboard(allowed) {
  const kb = $('#keyboard');
  kb.innerHTML = '';
  ROWS.forEach((row, ri) => {
    const r = document.createElement('div');
    r.className = 'krow';
    r.style.marginLeft = `calc(var(--k) * ${ri * 0.42})`;
    [...row].forEach(k => r.appendChild(makeKey(k, allowed)));
    kb.appendChild(r);
  });
  const sr = document.createElement('div');
  sr.className = 'krow';
  sr.appendChild(makeKey(' ', allowed));
  kb.appendChild(sr);
}
function makeKey(k, allowed) {
  const el = document.createElement('div');
  el.className = 'key' + (k === ' ' ? ' space' : '') + ('fj'.includes(k) ? ' homebump' : '');
  if (!allowed.includes(k)) el.classList.add('off');
  el.dataset.key = k;
  el.textContent = k === ' ' ? '空白鍵' : k;
  el.style.setProperty('--fc', `var(${FINGER_COLOR[+FINGER[k][1]]})`);
  return el;
}
const keyEl = k => document.querySelector(`.key[data-key="${CSS.escape(k)}"]`);

function highlightNext(ch) {
  document.querySelectorAll('.key.next').forEach(e => e.classList.remove('next'));
  document.querySelectorAll('.paw').forEach(e => e.remove());
  document.querySelectorAll('.finger.active').forEach(e => e.classList.remove('active'));
  if (ch == null) return;
  const el = keyEl(ch);
  if (el) { el.classList.add('next'); el.insertAdjacentHTML('beforeend', PAW_SVG); }
  const f = FINGER[ch];
  if (f) document.getElementById('f-' + f)?.classList.add('active');
}
function fingerText(ch) {
  const f = FINGER[ch];
  return `${f[0] === 'L' ? '左手' : '右手'}${FINGER_NAME[+f[1]]}`;
}

/* ============ 出題 ============ */
function makeQuestion(lv) {
  const [minL, maxL] = lv.len;
  if (lv.phrases) return rand(PHRASES.filter(p => p.length <= maxL));
  const ok = w => [...w].every(c => lv.keys.includes(c)) && w.length >= minL && w.length <= maxL;
  const pool = WORDS.filter(ok);
  if (lv.wordsOnly || (pool.length >= 6 && Math.random() < 0.5)) return rand(pool.length ? pool : WORDS);
  // 隨機字母組合，一半機率加入新教的鍵
  const n = randInt(minL, maxL);
  let s = '';
  for (let i = 0; i < n; i++) {
    const src = lv.newKeys.trim() && Math.random() < 0.5 ? lv.newKeys.trim() : lv.keys.replace(' ', '');
    s += rand([...src]);
  }
  return s;
}

/* ============ 遊戲狀態 ============ */
let G = null;

function startLevel(idx) {
  const lv = LEVELS[idx];
  G = { idx, lv, word: '', pos: 0, done: 0, correctWords: 0, keyHits: 0, keyMiss: 0,
        wordHadError: false, coins: 0, timeLeft: lv.time, timer: null, running: false, lastQ: '',
        startAt: 0, endAt: 0, wpm: 0, heartsLeft: HEARTS,
        customers: Array.from({ length: lv.target }, () => rand(CUSTOMERS)) };
  showScreen('play');
  $('#play-level-name').textContent = `第 ${idx + 1} 關・${lv.name}`;
  $('#hud-target').textContent = lv.target;
  $('#hud-done').textContent = 0;
  $('#hud-wpm').textContent = 0;
  $('#hint').textContent = ' ';
  $('#hearts').innerHTML = Array.from({ length: HEARTS }, () => '<span class="heart"><i>♥</i>♥</span>').join('');
  renderHearts(lv.time);
  $('#play-hamster').innerHTML = hamsterSVG();
  buildKeyboard(lv.keys);
  $('#hands').innerHTML = handSVG('L') + handSVG('R');
  nextWord();
  countdown(() => {
    G.running = true;
    G.startAt = performance.now();
    G.endAt = G.startAt + lv.time * 1000;
    G.timer = setInterval(tick, 200);
  });
}

function countdown(cb) {
  const ov = $('#countdown'), num = $('#count-num');
  let n = 3;
  ov.classList.add('show');
  const step = () => {
    num.textContent = n > 0 ? n : '開始烘焙！';
    num.style.animation = 'none'; void num.offsetWidth; num.style.animation = '';
    if (n > 0) Sound.count();
    else if (n === 0) Sound.go();
    if (n < 0) { ov.classList.remove('show'); cb(); return; }
    n--;
    G.cdTimer = setTimeout(step, n < 0 ? 700 : 900);
  };
  step();
}

// 每顆愛心依剩餘時間填滿比例
function renderHearts(timeLeft) {
  const per = G.lv.time / HEARTS;
  const hearts = document.querySelectorAll('#hearts .heart');
  hearts.forEach((h, i) => {
    const fill = Math.min(1, Math.max(0, (timeLeft - i * per) / per));
    h.firstChild.style.width = fill * 100 + '%';
  });
  const left = Math.ceil(timeLeft / per);
  if (left < G.heartsLeft) {
    G.heartsLeft = left;
    if (hearts[left]) FX.shake(hearts[left], 'lost');
    Sound.heart();
  }
  const worried = timeLeft <= G.lv.time * 0.3;
  $('#patience').classList.toggle('warn', worried);
  $('#queue').classList.toggle('worried', worried);
}

function renderQueue(leaving) {
  const q = $('#queue');
  const rest = G.customers.slice(G.done, G.done + 5);
  q.innerHTML = rest.map((c, i) => i === 0
    ? `<div class="customer front">${c}<span class="order">${$('#dessert').textContent}</span></div>`
    : `<div class="customer">${c}</div>`).join('');
  const more = G.customers.length - G.done - rest.length;
  if (more > 0) q.insertAdjacentHTML('beforeend', `<div class="more">+${more}</div>`);
  if (leaving) {
    q.insertAdjacentHTML('beforeend', `<div class="customer happy leave">${leaving}</div>`);
    setTimeout(() => q.querySelector('.leave')?.remove(), 500);
  }
}

// 每分鐘字數：以 5 個正確字元為 1 字（業界標準）
function calcWpm() {
  const min = (performance.now() - G.startAt) / 60000;
  return min > 0.05 ? Math.round(G.keyHits / 5 / min) : 0;
}

function tick() {
  G.timeLeft = Math.max(0, (G.endAt - performance.now()) / 1000);
  renderHearts(G.timeLeft);
  G.wpm = calcWpm();
  $('#hud-wpm').textContent = G.wpm;
  if (G.timeLeft <= 0) endLevel(false);
}

function nextWord() {
  let w;
  do { w = makeQuestion(G.lv); } while (w === G.lastQ && G.lv.keys.length > 1);
  G.lastQ = G.word = w;
  G.pos = 0;
  G.wordHadError = false;
  $('#dessert').textContent = rand(DESSERTS);
  renderQueue();
  renderWord();
}

function renderWord() {
  $('#word').innerHTML = [...G.word].map((c, i) => {
    const cls = i < G.pos ? 'done' : i === G.pos ? 'cur' : 'todo';
    return `<span class="${cls}">${c === ' ' ? '&nbsp;' : c}</span>`;
  }).join('');
  $('#typed').textContent = G.word.slice(0, G.pos);
  highlightNext(G.pos < G.word.length ? G.word[G.pos] : null);
}

function onKey(e) {
  if ($('#unlock').classList.contains('show') && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault();
    return closeUnlock();
  }
  if (!G || !$('#screen-play').classList.contains('active')) return;
  if (e.isComposing || e.key === 'Process' || /[㄀-ㄯ一-鿿]/.test(e.key)) {
    $('#ime-warn').classList.add('show');
    return;
  }
  $('#ime-warn').classList.remove('show');
  if (!G.running || e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
  e.preventDefault();

  const k = e.key.toLowerCase();
  const expect = G.word[G.pos];
  const el = keyEl(k);
  if (el) { el.classList.add('press'); setTimeout(() => el.classList.remove('press'), 120); }

  if (k === expect) {
    G.keyHits++;
    G.pos++;
    Sound.key(G.pos);
    if (el) FX.shake(el, 'hit');
    $('#hint').textContent = ' ';
    if (G.pos >= G.word.length) return wordComplete();
    renderWord();
  } else {
    // 答錯：溫和提示，不扣分
    G.keyMiss++;
    G.wordHadError = true;
    Sound.bad();
    if (el) { el.classList.add('wrong'); setTimeout(() => el.classList.remove('wrong'), 300); }
    FX.shake($('#typed-box'));
    const hint = $('#hint');
    hint.classList.remove('good');
    hint.textContent = `沒關係～試試「${expect === ' ' ? '空白鍵' : expect.toUpperCase()}」，用${fingerText(expect)}喔！`;
  }
}

function wordComplete() {
  G.done++;
  const gain = G.wordHadError ? 1 : 2 + Math.floor(G.word.length / 4);
  if (!G.wordHadError) G.correctWords++;
  G.coins += gain;
  $('#hud-done').textContent = G.done;
  Sound.good();
  setTimeout(Sound.coin, 150);
  FX.shake($('#dessert'), 'pop');
  FX.shake($('#play-hamster'), 'cheer');
  FX.burstAt($('#dessert'), { chars: G.wordHadError ? ['✨', '❄️'] : ['✨', '❄️', '⭐', '💖'] });
  updateCoins(true);
  const hint = $('#hint');
  hint.classList.add('good');
  hint.textContent = rand(['做得好！', '好香喔～', '完美出爐！', '太棒了！', '客人很開心！', '聖誕快樂！']);
  floatCoin(`+${gain} 🪙`);
  if (G.done >= G.lv.target) return endLevel(true);
  G.running = false;
  renderWord();
  const served = G.customers[G.done - 1];
  setTimeout(() => { if (G) { G.running = true; nextWord(); renderQueue(served); } }, 280);
}

function floatCoin(text) {
  const r = $('#dessert').getBoundingClientRect();
  const el = document.createElement('div');
  el.className = 'float-coin';
  el.textContent = text;
  el.style.left = r.left + r.width / 2 - 20 + 'px';
  el.style.top = r.top + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

function stopTimers() {
  if (!G) return;
  clearInterval(G.timer);
  clearTimeout(G.cdTimer);
  $('#countdown').classList.remove('show');
}

function endLevel(finished) {
  stopTimers();
  G.running = false;
  G.wpm = calcWpm();
  const total = G.keyHits + G.keyMiss;
  const acc = total ? Math.round((G.keyHits / total) * 100) : 0;
  const passed = finished && acc >= 70;
  let stars = 0;
  if (passed) stars = acc >= 95 ? 3 : acc >= 85 ? 2 : 1;
  if (passed) G.coins += 5 * stars;

  const newDish = stars === 3 && !hasDish(G.idx);
  save.coins += G.coins;
  save.stars[G.idx] = Math.max(save.stars[G.idx] || 0, stars);
  if (passed) save.unlocked = Math.max(save.unlocked, Math.min(G.idx + 2, LEVELS.length));
  save.bestWpm = Math.max(save.bestWpm || 0, G.wpm);
  persist();

  $('#result-title').textContent = passed ? '烘焙完成！' : finished ? '再練習一下吧！' : '時間到囉！';
  $('#result-stars').innerHTML = [0, 1, 2].map(i =>
    `<span class="${i < stars ? 'in' : 'dim'}" style="animation-delay:${0.3 + i * 0.25}s">★</span>`).join('');
  $('#result-hamster').innerHTML = hamsterSVG(passed ? 'happy' : 'sad');
  $('#r-done').textContent = G.done;
  $('#r-correct').textContent = G.correctWords;
  $('#r-acc').textContent = acc + '%';
  $('#r-coins').textContent = G.coins;
  $('#r-wpm').textContent = G.wpm + ' 字/分';
  $('#result-msg').textContent = passed
    ? (stars === 3 ? '完美！店長以你為傲！' : '很棒！拿到三顆星就能收藏這關的甜點喔！')
    : finished ? '正確率需要 70% 才能過關，慢慢來沒關係～' : `還差 ${G.lv.target - G.done} 份訂單，下次一定可以！`;
  const hasNext = G.idx + 1 < LEVELS.length && save.unlocked > G.idx + 1;
  $('#btn-next').disabled = !hasNext;
  highlightNext(null);
  showScreen('result');

  if (passed) { Sound.win(); FX.confetti(stars * 40); } else Sound.lose();
  for (let i = 0; i < stars; i++) setTimeout(Sound.coin, 400 + i * 250);
  if (newDish) setTimeout(() => openUnlock(G.idx), 1400);
}

/* ============ 收藏 ============ */
function openUnlock(i) {
  const d = DISHES[i];
  $('#unlock-emoji').textContent = d.e;
  $('#unlock-name').textContent = `${d.name}`;
  $('#unlock-desc').textContent = d.desc;
  $('#unlock').classList.add('show');
  Sound.unlock();
  FX.confetti(120);
  setTimeout(() => FX.burstAt($('#unlock-emoji'), { n: 24, spread: 140, chars: ['✨', '⭐', '❄️', '🎉'] }), 300);
}
function closeUnlock() {
  Sound.click();
  $('#unlock').classList.remove('show');
}

let selectedDish = 0;
function renderCollection() {
  const got = DISHES.filter((_, i) => hasDish(i)).length;
  $('#col-count').textContent = `已收集 ${got} / ${DISHES.length}`;
  $('#col-grid').innerHTML = DISHES.map((d, i) => `
    <button class="col-item ${hasDish(i) ? '' : 'locked'} ${i === selectedDish ? 'sel' : ''}" data-i="${i}">
      <div class="plate"><span>${d.e}</span></div>
      <div class="nm">${hasDish(i) ? d.name : '？？？'}</div>
    </button>`).join('');
  $('#col-grid').querySelectorAll('.col-item').forEach(b => (b.onclick = () => {
    selectedDish = +b.dataset.i;
    Sound.click();
    renderCollection();
  }));
  const d = DISHES[selectedDish], own = hasDish(selectedDish);
  $('#col-detail').innerHTML = own
    ? `<div class="plate"><span>${d.e}</span></div><h3>${d.name}</h3><div class="en">${d.en}</div><p>${d.desc}</p>`
    : `<div class="plate" style="filter:grayscale(1)"><span style="filter:brightness(0);opacity:.25">${d.e}</span></div>
       <h3>？？？</h3><p>在第 ${selectedDish + 1} 關拿到 ⭐⭐⭐ 就能解鎖這道甜點！</p>`;
}

/* ============ 關卡列表 ============ */
function renderLevels() {
  const grid = $('#level-grid');
  grid.innerHTML = '';
  LEVELS.forEach((lv, i) => {
    const b = document.createElement('button');
    b.className = 'level-card';
    b.disabled = i >= save.unlocked;
    const st = save.stars[i] || 0;
    const keysText = lv.newKeys === ' ' ? '新按鍵：空白鍵'
      : lv.newKeys ? '新按鍵：' + lv.newKeys.toUpperCase().split('').join(' ')
      : lv.phrases ? '片語練習' : '單字練習';
    b.innerHTML = `<div class="reward ${hasDish(i) ? '' : 'locked'}">${hasDish(i) ? DISHES[i].e : '🎁'}</div>
      <div class="lv">${b.disabled ? '🔒' : '🎄'} 第 ${i + 1} 關</div>
      <div class="nm">${lv.name}</div>
      <div class="keys">${keysText}</div>
      <div class="keys">⏱ ${lv.time} 秒・${lv.target} 份訂單</div>
      <div class="st">${'★'.repeat(st)}${'☆'.repeat(3 - st)}</div>`;
    b.onclick = () => { Sound.click(); startLevel(i); };
    grid.appendChild(b);
  });
}

/* ============ 聲音設定 ============ */
function applySoundUI() {
  $('#btn-music').classList.toggle('off', !save.music);
  $('#btn-sfx').classList.toggle('off', !save.sfx);
  Sound.setMusic(save.music);
  Sound.setSfx(save.sfx);
}
$('#btn-music').onclick = () => { Sound.init(); save.music = !save.music; persist(); applySoundUI(); Sound.click(); };
$('#btn-sfx').onclick = () => { Sound.init(); save.sfx = !save.sfx; persist(); applySoundUI(); Sound.click(); };

// 瀏覽器要求使用者互動後才能播放聲音
const unlockAudio = () => { Sound.init(); applySoundUI(); };
addEventListener('pointerdown', unlockAudio, { once: true });
addEventListener('keydown', unlockAudio, { once: true });

/* ============ 綁定 ============ */
document.addEventListener('keydown', onKey);
document.addEventListener('click', e => {
  if (e.target.closest('.btn, .icon-btn.back')) Sound.click();
});
$('#home-hamster').innerHTML = hamsterSVG();
$('#btn-start').onclick = () => showScreen('levels');
document.querySelectorAll('[data-go]').forEach(b => (b.onclick = () => showScreen(b.dataset.go)));
$('#btn-quit').onclick = () => { stopTimers(); G = null; showScreen('levels'); };
$('#btn-retry').onclick = () => startLevel(G.idx);
$('#btn-next').onclick = () => startLevel(G.idx + 1);
$('#btn-unlock-ok').onclick = closeUnlock;
addEventListener('resize', buildLights);
buildLights();
Sound.setMusic(save.music);
Sound.setSfx(save.sfx);
$('#btn-music').classList.toggle('off', !save.music);
$('#btn-sfx').classList.toggle('off', !save.sfx);
showScreen('home');
