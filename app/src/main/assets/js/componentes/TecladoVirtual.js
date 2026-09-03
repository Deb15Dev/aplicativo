const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'APAGAR'],
];

export function renderKeyboard(container, { locked, onType, onErase }) {
  container.replaceChildren();

  KEYBOARD_ROWS.forEach((keys) => {
    const row = document.createElement('div');
    row.className = 'linha-teclado';

    keys.forEach((key) => {
      const button = document.createElement('button');
      const erase = key === 'APAGAR';
      button.type = 'button';
      button.className = erase ? 'tecla apagar' : 'tecla';
      button.textContent = erase ? '⌫' : key;
      button.disabled = locked;
      button.setAttribute('aria-label', erase ? 'Apagar letra' : `Letra ${key}`);
      button.addEventListener('click', () => erase ? onErase() : onType(key));
      row.appendChild(button);
    });

    container.appendChild(row);
  });
}
