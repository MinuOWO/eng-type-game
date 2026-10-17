'use strict';

// 所有聲音皆以 Web Audio 即時合成，不需要音檔
const Sound = (() => {
  let ctx = null, master, musicGain, sfxGain, noiseBuf;
  let musicOn = true, sfxOn = true, musicTimer = null;
  const midi = m => 440 * Math.pow(2, (m - 69) / 12);

  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
    musicGain = ctx.createGain(); musicGain.gain.value = musicOn ? 0.22 : 0; musicGain.connect(master);
    sfxGain = ctx.createGain(); sfxGain.gain.value = 0.6; sfxGain.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    if (musicOn) startMusic();
  }

  function tone(freq, t, dur, { type = 'sine', vol = 0.2, dest = sfxGain, to = null, attack = 0.005 } = {}) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest);
    o.start(t); o.stop(t + dur + 0.05);
  }

  // 音樂盒般的鐘聲：基頻 + 泛音
  function bell(freq, t, dur, vol = 0.2, dest = sfxGain) {
    tone(freq, t, dur, { vol, dest });
    tone(freq * 2, t, dur * 0.6, { vol: vol * 0.35, dest });
    tone(freq * 3.01, t, dur * 0.3, { vol: vol * 0.12, dest });
  }

  // 雪橇鈴：高通濾波的短噪音
  function jingle(t, vol = 0.05, dest = sfxGain) {
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf;
    f.type = 'highpass'; f.frequency.value = 7000;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    s.connect(f); f.connect(g); g.connect(dest);
    s.start(t); s.stop(t + 0.15);
  }

  /* ---------- 背景音樂：Jingle Bells（公有領域）---------- */
  const BPM = 116, SPB = 60 / BPM;
  const A = [[76, 1], [76, 1], [76, 2], [76, 1], [76, 1], [76, 2], [76, 1], [79, 1], [72, 1.5], [74, 0.5], [76, 4]];
  const F = [[77, 1], [77, 1], [77, 1.5], [77, 0.5], [77, 1], [76, 1], [76, 1], [76, 0.5], [76, 0.5]];
  const MELODY = [...A, ...F, [76, 1], [74, 1], [74, 1], [76, 1], [74, 2], [79, 2],
    ...A, ...F, [79, 1], [79, 1], [77, 1], [74, 1], [72, 4]];
  const BASS = [48, 48, 48, 48, 53, 48, 50, 55, 48, 48, 48, 48, 53, 48, 55, 48];
  const LOOP = 64;
  const EVENTS = [];
  { let b = 0; MELODY.forEach(([n, d]) => { EVENTS.push({ b, kind: 'mel', n, d }); b += d; }); }
  BASS.forEach((n, bar) => {
    EVENTS.push({ b: bar * 4, kind: 'bass', n });
    EVENTS.push({ b: bar * 4 + 2, kind: 'bass', n: n + 7 });
  });
  for (let b = 0; b < LOOP; b++) EVENTS.push({ b: b + 0.5, kind: 'jingle' });
  EVENTS.sort((x, y) => x.b - y.b);

  let idx = 0, loopStart = 0;
  function playEvent(ev, t) {
    if (ev.kind === 'mel') bell(midi(ev.n), t, Math.max(0.35, ev.d * SPB * 1.1), 0.16, musicGain);
    else if (ev.kind === 'bass') tone(midi(ev.n), t, SPB * 1.6, { type: 'triangle', vol: 0.13, dest: musicGain, attack: 0.02 });
    else jingle(t, 0.025, musicGain);
  }
  function scheduler() {
    while (true) {
      const ev = EVENTS[idx];
      const t = loopStart + ev.b * SPB;
      if (t > ctx.currentTime + 0.3) break;
      if (t >= ctx.currentTime - 0.05) playEvent(ev, t);
      if (++idx >= EVENTS.length) { idx = 0; loopStart += LOOP * SPB; }
    }
  }
  function startMusic() {
    if (!ctx || musicTimer) return;
    idx = 0; loopStart = ctx.currentTime + 0.15;
    musicGain.gain.cancelScheduledValues(ctx.currentTime);
    musicGain.gain.setTargetAtTime(0.22, ctx.currentTime, 0.2);
    musicTimer = setInterval(scheduler, 60);
  }
  function stopMusic() {
    if (!ctx) return;
    clearInterval(musicTimer); musicTimer = null;
    musicGain.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
  }

  /* ---------- 音效 ---------- */
  const now = () => ctx.currentTime;
  const sfx = fn => (...a) => { if (ctx && sfxOn) fn(...a); };

  return {
    init,
    setMusic(on) { musicOn = on; on ? startMusic() : stopMusic(); },
    setSfx(on) { sfxOn = on; },
    click: sfx(() => tone(700, now(), 0.08, { vol: 0.12, to: 1000 })),
    key: sfx(i => tone(900 * Math.pow(2, (i % 8) / 24), now(), 0.05, { vol: 0.06, type: 'triangle' })),
    bad: sfx(() => tone(260, now(), 0.18, { type: 'triangle', vol: 0.14, to: 190 })),
    good: sfx(() => { const t = now(); [1047, 1319, 1568].forEach((f, i) => bell(f, t + i * 0.06, 0.4, 0.12)); jingle(t, 0.06); }),
    coin: sfx(() => { const t = now(); tone(988, t, 0.08, { type: 'square', vol: 0.04 }); tone(1319, t + 0.07, 0.2, { type: 'square', vol: 0.04 }); }),
    count: sfx(() => bell(660, now(), 0.3, 0.2)),
    go: sfx(() => { const t = now(); bell(1047, t, 0.6, 0.22); jingle(t); jingle(t + 0.1); }),
    heart: sfx(() => tone(330, now(), 0.15, { vol: 0.08, to: 300 })),
    win: sfx(() => {
      const t = now();
      [72, 76, 79, 84, 79, 84].forEach((n, i) => bell(midi(n), t + i * 0.12, 0.6, 0.18));
      for (let i = 0; i < 6; i++) jingle(t + i * 0.12, 0.06);
    }),
    lose: sfx(() => { const t = now(); [67, 64, 60].forEach((n, i) => bell(midi(n), t + i * 0.18, 0.5, 0.15)); }),
    unlock: sfx(() => {
      const t = now();
      [72, 76, 79, 84, 88, 91, 96].forEach((n, i) => bell(midi(n), t + i * 0.07, 0.8, 0.15));
      for (let i = 0; i < 10; i++) jingle(t + i * 0.06, 0.05);
    }),
  };
})();
