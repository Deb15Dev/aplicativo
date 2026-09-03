const HELP_COUNT = { facil: 2, medio: 3, dificil: 4 };
import { animateRobot } from './animations.js';

export function renderHelpButton(container, {
  word,
  difficulty,
  used,
  locked,
  completed,
  onReveal,
}) {
  container.replaceChildren();
  if (!word) return;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn-ajuda';
  button.disabled = used || locked || completed;
  button.innerHTML = `<span class="area-robo"><img src="assets/imagens/robo-ajuda.png" alt="" /><b>${HELP_COUNT[difficulty]}</b></span><span>${used ? 'Usado' : 'Revelar'}</span>`;
  button.addEventListener('click', (e) => {
    // animate local robot icon
    const area = button.querySelector('.area-robo');
    try { animateRobot(area); } catch (_) {}
    if (typeof onReveal === 'function') onReveal(e);
  });
  container.appendChild(button);
}
