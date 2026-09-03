function iconSvg(type) {
  const path = type === 'home'
    ? 'M3 10.7 12 3l9 7.7v9.8a.5.5 0 0 1-.5.5h-5.4v-6.5H8.9V21H3.5a.5.5 0 0 1-.5-.5z'
    : 'M20 11H8l5-5-1.4-1.4L4.2 12l7.4 7.4L13 18l-5-5h12z';

  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}" /></svg>`;
}

function createIconButton(type, label, handler) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'icon-button';
  button.setAttribute('aria-label', label);
  button.innerHTML = iconSvg(type);
  button.addEventListener('click', handler);
  return button;
}

export function renderGameHeader(container, { onHome, onBack }) {
  container.replaceChildren(
    createIconButton('home', 'Ir para a tela inicial', onHome),
    createIconButton('back', 'Voltar para as fases', onBack),
  );
}
