'use strict';

// 視覺特效：飄雪背景、粒子爆發、彩帶
const FX = (() => {
  const cv = document.getElementById('snow');
  const c = cv.getContext('2d');
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  let W = 0, H = 0;
  function resize() { W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr; }
  resize();
  addEventListener('resize', resize);

  const flake = any => ({
    x: Math.random() * W, y: any ? Math.random() * H : -10,
    r: (0.8 + Math.random() * 2.6) * dpr, s: (0.3 + Math.random() * 0.9) * dpr, w: Math.random() * 6.28,
  });
  const flakes = Array.from({ length: 110 }, () => flake(true));
  (function loop() {
    c.clearRect(0, 0, W, H);
    c.fillStyle = 'rgba(255,255,255,.8)';
    for (const f of flakes) {
      f.y += f.s; f.w += 0.012; f.x += Math.sin(f.w) * 0.4 * dpr;
      if (f.y > H + 10) Object.assign(f, flake(false));
      c.beginPath(); c.arc(f.x, f.y, f.r, 0, 6.283); c.fill();
    }
    requestAnimationFrame(loop);
  })();

  function burst(x, y, { n = 14, chars = ['✨', '❄️', '⭐'], spread = 90 } = {}) {
    for (let i = 0; i < n; i++) {
      const p = document.createElement('div');
      p.className = 'fx-particle';
      p.textContent = chars[i % chars.length];
      const a = Math.random() * Math.PI * 2, d = spread * (0.5 + Math.random() * 0.7);
      p.style.left = x + 'px'; p.style.top = y + 'px';
      p.style.setProperty('--dx', Math.cos(a) * d + 'px');
      p.style.setProperty('--dy', Math.sin(a) * d - 30 + 'px');
      p.style.setProperty('--rot', (Math.random() * 360 - 180) + 'deg');
      p.style.fontSize = 12 + Math.random() * 14 + 'px';
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 900);
    }
  }
  function burstAt(el, opts) {
    const r = el.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, opts);
  }
  function confetti(n = 90) {
    const colors = ['#d64545', '#3e8e63', '#f2c14e', '#fff', '#f7a8b8', '#a8d8ea'];
    for (let i = 0; i < n; i++) {
      const p = document.createElement('div');
      p.className = 'confetti';
      p.style.left = Math.random() * 100 + 'vw';
      p.style.background = colors[i % colors.length];
      p.style.setProperty('--dx', (Math.random() * 200 - 100) + 'px');
      p.style.animationDuration = 1.8 + Math.random() * 1.4 + 's';
      p.style.animationDelay = Math.random() * 0.5 + 's';
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 3500);
    }
  }
  function shake(el, cls = 'shake') {
    el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
  }
  return { burst, burstAt, confetti, shake };
})();
