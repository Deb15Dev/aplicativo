export function renderCategoryList(container, { categories, activeCategoryId, getProgress, onSelect }) {
  container.replaceChildren();

  categories.forEach((category) => {
    const playableLevels = category.levels.filter((level) => !level.demo);
    const progress = getProgress(category.id);
    const completed = playableLevels.filter((level) => progress[level.id] === 100).length;
    const card = document.createElement('button');
    card.type = 'button';
    card.className = `category-card${category.id === activeCategoryId ? ' selected' : ''}`;
    card.setAttribute('aria-label', `Selecionar categoria ${category.title}`);
    card.innerHTML = `
      <span class="category-icon" aria-hidden="true"><i class="${category.icon}"></i></span>
      <span class="category-info"><strong>${category.title}</strong><small>${category.description}</small></span>
      <span class="category-progress">${completed}/${playableLevels.length}<small>fases</small></span>`;
    card.addEventListener('click', () => onSelect(category));
    container.appendChild(card);
  });
}
