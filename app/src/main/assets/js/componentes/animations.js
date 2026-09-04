const prefersReducedMotion = () => (
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
);

function playCorrectSound() {
  const sound = document.getElementById('sfx-correct');
  if (sound?.src) {
    sound.currentTime = 0;
    sound.play().catch(() => {});
    return;
  }

  // Pequeno "ping" de confirmação, sem depender de um arquivo de áudio.
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(660, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(880, context.currentTime + 0.12);
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.18);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.2);
    oscillator.addEventListener('ended', () => context.close());
  } catch (_) {
    // O efeito é opcional; falhas de áudio não devem interromper o jogo.
  }
}

export function fireConfetti(target) {
  playCorrectSound();
  if (prefersReducedMotion()) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'confetti-canvas';
  document.body.appendChild(canvas);

  const context = canvas.getContext('2d');
  const pixelRatio = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * pixelRatio;
  canvas.height = window.innerHeight * pixelRatio;
  context.scale(pixelRatio, pixelRatio);

  const rect = target?.getBoundingClientRect();
  const originX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
  const originY = rect ? rect.top + rect.height / 2 : window.innerHeight / 3;
  const colors = ['#7c3aed', '#a855f7', '#ec4899', '#f59e0b', '#22c55e', '#38bdf8'];
  const pieces = Array.from({ length: 28 }, (_, index) => {
    const angle = (-90 + (Math.random() - 0.5) * 100) * (Math.PI / 180);
    const speed = 3 + Math.random() * 4;
    return {
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 5 + Math.random() * 5,
      color: colors[index % colors.length],
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.3,
    };
  });

  const startedAt = performance.now();
  const draw = (now) => {
    const elapsed = now - startedAt;
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    pieces.forEach((piece) => {
      piece.vy += 0.16;
      piece.x += piece.vx;
      piece.y += piece.vy;
      piece.rotation += piece.spin;
      context.save();
      context.translate(piece.x, piece.y);
      context.rotate(piece.rotation);
      context.fillStyle = piece.color;
      context.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.65);
      context.restore();
    });

    if (elapsed < 1000) window.requestAnimationFrame(draw);
    else canvas.remove();
  };
  window.requestAnimationFrame(draw);
}
