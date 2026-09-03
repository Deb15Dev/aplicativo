export function renderWordList(container, {
  words,
  selectedWord,
  selectedIndex,
  invalidWord,
  locked,
  getLetters,
  isComplete,
  onSelect,
  onSelectBox,
}) {
  container.replaceChildren();

  words.forEach((word) => {
    const completed = isComplete(word);
    const row = document.createElement('button');
    row.type = 'button';
    row.className = `palavra-linha${selectedWord?.answer === word.answer ? ' selecionada' : ''}${completed ? ' completa' : ''}${invalidWord === word.answer ? ' erro' : ''}`;
    row.setAttribute('aria-label', `Selecionar palavra ${word.answer}`);
    row.dataset.answer = word.answer;
    row.addEventListener('click', () => {
      if (!locked) onSelect(word);
    });

    getLetters(word).forEach((letter, index) => {
      const box = document.createElement('span');
      const selectedBox = selectedWord?.answer === word.answer && selectedIndex === index;
      box.className = `caixa-letra${completed ? ' completa' : ''}${selectedBox ? ' selecionada' : ''}`;
      box.textContent = letter;
      if (!locked) {
        box.addEventListener('click', (e) => {
          e.stopPropagation();
          if (onSelectBox) onSelectBox(word, index);
        });
      }
      row.appendChild(box);
    });

    container.appendChild(row);
  });
}
