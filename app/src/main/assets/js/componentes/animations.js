const REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function animateRobot(el) {
  if (!el || REDUCED) return;
  el.classList.add('robot-animate');
  window.setTimeout(() => el.classList.remove('robot-animate'), 700);
}

function createCanvas() {
  const canvas = document.createElement('canvas');
  canvas.className = 'confetti-canvas';
  canvas.style.position = 'fixed';
  canvas.style.left = '0';
  canvas.style.top = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = 9999;
  return canvas;
}

function random(min, max) { return Math.random() * (max - min) + min; }

export function fireConfetti(targetEl, { count = 24, spread = 45 } = {}) {
  if (REDUCED) return;
  const canvas = createCanvas();
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);

  const rect = targetEl ? targetEl.getBoundingClientRect() : { x: window.innerWidth / 2, y: window.innerHeight / 3, width: 0, height: 0 };
  const originX = rect.left + rect.width / 2;
  const originY = rect.top + rect.height / 2;

  const colors = ['#7c3aed','#a78bfa','#6d28d9','#8b5cf6','#c4b5fd','#6b21a8'];
  const pieces = [];
  for (let i = 0; i < count; i += 1) {
    pieces.push({
      x: originX,
      y: originY,
      vx: Math.cos((random(-spread, spread) * Math.PI) / 180) * random(2, 6),
      vy: Math.sin((random(-spread, spread) * Math.PI) / 180) * random(-8, -3),
      size: random(6, 12),
      color: colors[i % colors.length],
      rot: random(0, Math.PI * 2),
      vr: random(-0.2, 0.2),
      life: 0,
    });
  }

  const start = performance.now();
  function frame(now) {
    const t = (now - start) / 1000;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach((p) => {
      p.life += 1/60;
      p.vy += 0.35; // gravity
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
      ctx.restore();
    });
    if (t < 1.2) requestAnimationFrame(frame);
    else { document.body.removeChild(canvas); }
  }
  requestAnimationFrame(frame);

  // try play sound if exists
  try {
    const sfx = document.getElementById('sfx-correct');
    if (sfx && typeof sfx.play === 'function') sfx.currentTime = 0, sfx.play().catch(() => {});
  } catch (_) {}
}

export function fireSparkles(targetEl, { count = 14, spread = 30, size = 8 } = {}) {
  if (REDUCED) return;
  const colors = ['#7c3aed','#a78bfa','#6d28d9','#8b5cf6','#c4b5fd','#6b21a8'];
  const rect = targetEl ? targetEl.getBoundingClientRect() : { left: window.innerWidth/2, top: window.innerHeight/3, width: 0, height: 0 };
  const originX = rect.left + rect.width / 2;
  const originY = rect.top + rect.height / 2;

  const created = [];
  for (let i = 0; i < count; i += 1) {
    const el = document.createElement('div');
    el.className = 'sparkle';
    const angle = (Math.PI * 2) * Math.random();
    const r = Math.random() * spread;
    const dx = Math.cos(angle) * r;
    const dy = Math.sin(angle) * r;
    const left = originX + dx;
    const top = originY + dy;
    const s = (size * (0.8 + Math.random() * 0.8)).toFixed(1);
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
    el.style.width = `${s}px`;
    el.style.height = `${s}px`;
    el.style.background = colors[i % colors.length];
    el.style.transform = `translate(-50%, -50%) scale(${0.6 + Math.random()*0.8}) rotate(${Math.random()*360}deg)`;
    el.style.opacity = '1';
    document.body.appendChild(el);
    created.push(el);
    // stagger
    el.style.animationDelay = `${Math.random()*120}ms`;
  }

  // cleanup after animation
  window.setTimeout(() => { created.forEach((e) => e.remove()); }, 900);

  // play sound if available
  try { const sfx = document.getElementById('sfx-correct'); if (sfx && typeof sfx.play === 'function') sfx.currentTime = 0, sfx.play().catch(() => {}); } catch (_) {}
}

export function showHappyRobotAt(targetEl, { src = 'assets/imagens/robo-feliz.gif', duration = 1100 } = {}) {
  if (REDUCED) return;
  const rect = targetEl ? targetEl.getBoundingClientRect() : { left: window.innerWidth/2, top: window.innerHeight/3, width: 0, height: 0 };
  const img = document.createElement('img');
  img.src = src;
  img.alt = 'robo feliz';
  img.className = 'happy-robot-anim';
  img.style.position = 'fixed';
  img.style.left = `${rect.left + rect.width/2}px`;
  img.style.top = `${rect.top + rect.height/2}px`;
  img.style.transform = 'translate(-50%, -50%) scale(0.95)';
  img.style.zIndex = 10000;
  img.style.pointerEvents = 'none';
  img.style.width = '140px';
  img.style.height = '140px';
  document.body.appendChild(img);
  // pop in
  requestAnimationFrame(() => { img.style.transition = 'transform 260ms ease-out, opacity 260ms ease-out'; img.style.transform = 'translate(-50%, -50%) scale(1)'; img.style.opacity = '1'; });
  window.setTimeout(() => { img.style.opacity = '0'; img.style.transform = 'translate(-50%, -50%) scale(0.8)'; }, duration - 220);
  window.setTimeout(() => { img.remove(); }, duration);
}
