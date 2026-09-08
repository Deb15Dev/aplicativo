import { CATEGORIES } from './data/categorias.js';
import { ABOUT_CARDS } from './data/sobre.js';
import { renderGameHeader as renderHeaderComponent } from './componentes/HeaderTela.js';
import { renderKeyboard as renderKeyboardComponent } from './componentes/TecladoVirtual.js';
import { renderWordList } from './componentes/Palavras.js';
import { renderCategoryList } from './componentes/Categorias.js';
import { fireConfetti } from './componentes/animations.js';

const STORAGE_KEY = 'techcross-web-state-v1';
const MAX_ERRORS = { facil: 5, medio: 4, dificil: 3 };

//
const defaultState = () => ({
  musicOn: true,
  darkMode: false,
  difficulty: 'facil',
  activeCategoryId: 'tecnologia',
  progress: {},
  unlocked: {},
  currentLevel: null,
  selectedWord: null,
  selectedLetterIndex: null,
  answers: {},
  revealed: {},
  errors: 0,
  invalidWord: null,
  locked: false,
  sessions: {},
});

const state = defaultState();

function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}

function loadSavedState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || typeof saved !== 'object') return;

    state.musicOn = saved.musicOn !== false;
    state.darkMode = Boolean(saved.darkMode);
    state.difficulty = MAX_ERRORS[saved.difficulty] ? saved.difficulty : 'facil';
    state.activeCategoryId = CATEGORIES.some((category) => category.id === saved.activeCategoryId)
      ? saved.activeCategoryId
      : 'tecnologia';
    state.progress = normalizeProgress(saved.progress);
    state.unlocked = normalizeUnlocked(saved.unlocked);
  } catch (_) {
    // WebView storage may be disabled; the game remains fully usable in memory.
  }
}

function savePersistentState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      musicOn: state.musicOn,
      darkMode: state.darkMode,
      difficulty: state.difficulty,
      activeCategoryId: state.activeCategoryId,
      progress: state.progress,
      unlocked: state.unlocked,
    }));
  } catch (_) {
    // No persistence is preferable to interrupting the game in a restricted WebView.
  }
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach((screen) => {
    screen.classList.toggle('active', screen.id === id);
  });
  if (id === 'levels-screen') renderLevels();
  if (id === 'categories-screen') renderCategories();
}

function applyTheme() {
  document.documentElement.dataset.theme = state.darkMode ? 'dark' : 'light';
  document.getElementById('logo-home').src = state.darkMode ? 'imagens/logo-techcross-dark.png' : 'imagens/logo-techcross.png';
  document.getElementById('logo-about').src = state.darkMode ? 'imagens/logo-techcross-dark.png' : 'imagens/logo-techcross.png';
  const toggle = document.getElementById('btn-tema');
  toggle.classList.toggle('active', state.darkMode);
  toggle.setAttribute('aria-pressed', String(state.darkMode));
}

function normalizeProgress(savedProgress) {
  if (!savedProgress || typeof savedProgress !== 'object') return {};
  const values = Object.values(savedProgress);
  if (values.every((value) => typeof value === 'number')) {
    return { tecnologia: savedProgress };
  }
  return savedProgress;
}

function normalizeUnlocked(savedUnlocked) {
  if (Array.isArray(savedUnlocked)) return { tecnologia: savedUnlocked };
  return savedUnlocked && typeof savedUnlocked === 'object' ? savedUnlocked : {};
}

function getActiveCategory() {
  return CATEGORIES.find((category) => category.id === state.activeCategoryId) || CATEGORIES[0];
}

function getCategoryProgress(categoryId = state.activeCategoryId) {
  state.progress[categoryId] ||= {};
  return state.progress[categoryId];
}

function getUnlockedLevels(categoryId = state.activeCategoryId) {
  state.unlocked[categoryId] ||= [1];
  return state.unlocked[categoryId];
}

function updateLevelProgress(level, categoryId = state.activeCategoryId) {
  if (!level) return;
  const progressByLevel = getCategoryProgress(categoryId);
  const total = level.words?.length || 0;
  if (!total) return;
  const completed = level.words.filter((w) => wordComplete(w)).length;
  const pct = Math.round((completed / total) * 100);
  progressByLevel[level.id] = pct;
  savePersistentState();
  // update UI list of levels
  renderLevels();
}

function renderCategories() {
  renderCategoryList(document.getElementById('lista-categorias'), {
    categories: CATEGORIES,
    activeCategoryId: state.activeCategoryId,
    getProgress: getCategoryProgress,
    onSelect: (category) => {
      state.activeCategoryId = category.id;
      savePersistentState();
      showScreen('levels-screen');
    },
  });
}

function renderLevels() {
  const container = document.getElementById('lista-fases');
  const category = getActiveCategory();
  const progressByLevel = getCategoryProgress(category.id);
  const unlockedLevels = getUnlockedLevels(category.id);
  document.getElementById('levels-screen-title').textContent = `Fases de ${category.title}`;
  container.replaceChildren();

  category.levels.forEach((level) => {
    const locked = !unlockedLevels.includes(level.id);
    const card = document.createElement('button');
    card.type = 'button';
    card.className = `level-card${locked ? ' locked' : ''}`;
    card.disabled = locked;
    const progress = progressByLevel[level.id] || 0;
    const name = locked ? '' : level.title;
    const status = level.demo ? 'Disponível em breve' : `${progress}%`;
    card.innerHTML = `
      <span class="level-info"><strong>Fase ${level.id}${locked ? ' <span class="lock-icon" aria-label="Bloqueada">&#128274;</span>' : ''}</strong><small>${name}</small></span>
      <span class="level-progress"><span>${status}</span><span class="progress-track"><span class="progress-value" style="width: ${level.demo ? 0 : progress}%"></span></span></span>`;
    if (!locked && !level.demo) card.addEventListener('click', () => openLevel(level));
    container.appendChild(card);
  });
}

function renderAbout() {
  const container = document.getElementById('sobre-cards');
  container.replaceChildren();
  ABOUT_CARDS.forEach((cardData) => {
    const card = document.createElement('article');
    card.className = 'about-card';
    const title = document.createElement('h4');
    title.textContent = cardData.title;
    card.appendChild(title);
    if (cardData.text) {
      const text = document.createElement('p');
      text.textContent = cardData.text;
      card.appendChild(text);
    } else {
      const list = document.createElement('ul');
      cardData.items.forEach((item) => {
        const row = document.createElement('li');
        row.textContent = item;
        list.appendChild(row);
      });
      card.appendChild(list);
    }
    container.appendChild(card);
  });
}

function answerArray(word, answer = state.answers[word.answer]) {
  return Array.from({ length: word.answer.length }, (_, index) => answer?.[index] || '');
}

function wordComplete(word, answers = state.answers) {
  return answerArray(word, answers[word.answer]).join('').toUpperCase() === word.answer;
}

function saveSession() {
  if (!state.currentLevel) return;
  state.sessions[`${state.activeCategoryId}-${state.currentLevel.id}`] = {
    answers: cloneData(state.answers),
    revealed: cloneData(state.revealed),
    errors: state.errors,
  };
}

function openLevel(level) {
  const saved = state.sessions[`${state.activeCategoryId}-${level.id}`];
  state.currentLevel = level;
  state.answers = saved ? cloneData(saved.answers) : {};
  state.revealed = saved ? cloneData(saved.revealed) : {};
  state.errors = saved?.errors || 0;
  state.invalidWord = null;
  state.locked = false;
  state.selectedWord = level.words.find((word) => !wordComplete(word)) || level.words[0];
  state.selectedLetterIndex = null;
  renderGame();
  showScreen('game-screen');
  // ensure progress bar reflects current answers when opening a level
  updateLevelProgress(state.currentLevel);
}

function renderGameHeader() {
  const header = document.getElementById('header-game-left');
  renderHeaderComponent(header, {
    onHome: () => { saveSession(); showScreen('home-screen'); },
    onBack: () => { saveSession(); showScreen('levels-screen'); },
  });
}

function renderGame() {
  const level = state.currentLevel;
  if (!level) return;
  const selected = state.selectedWord;
  document.getElementById('game-level-id').textContent = `Level ${level.id}`;
  document.getElementById('game-level-title').textContent = level.title;
  document.getElementById('game-level-status').textContent = `${state.difficulty.toUpperCase()} · ERROS ${state.errors}/${MAX_ERRORS[state.difficulty]}`;
  document.getElementById('texto-dica-atual').textContent = selected?.hint || '';
  renderGameHeader();
  renderWords();
  renderKeyboard();
}

function renderWords() {
  const area = document.getElementById('area-palavras-jogo');
  renderWordList(area, {
    words: state.currentLevel.words,
    selectedWord: state.selectedWord,
    selectedIndex: state.selectedLetterIndex,
    invalidWord: state.invalidWord,
    locked: state.locked,
    getLetters: (word) => answerArray(word),
    isComplete: wordComplete,
    onSelect: (word) => {
      state.selectedWord = word;
      state.selectedLetterIndex = null;
      renderGame();
    },
    onSelectBox: (word, index) => {
      state.selectedWord = word;
      state.selectedLetterIndex = index;
      renderGame();
    },
  });
  // Scroll the selected word into view (centered) after rendering
  try {
    const selected = state.selectedWord;
    if (selected) {
      const row = area.querySelector(`[data-answer="${selected.answer}"]`);
      if (row && typeof row.scrollIntoView === 'function') {
        row.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      }
    }
  } catch (_) {}
}

function renderKeyboard() {
  const container = document.getElementById('teclado-container');
  renderKeyboardComponent(container, {
    locked: state.locked,
    onType: typeLetter,
    onErase: eraseLetter,
  });
}

function typeLetter(letter) {
  const word = state.selectedWord;
  if (!word || state.locked || wordComplete(word)) return;
  const answer = answerArray(word);
  if (state.selectedLetterIndex != null && state.selectedLetterIndex >= 0 && state.selectedLetterIndex < answer.length) {
    answer[state.selectedLetterIndex] = letter;
    // advance selection to next empty cell
    const nextEmpty = answer.findIndex((item, idx) => item === '' && idx > state.selectedLetterIndex);
    state.selectedLetterIndex = nextEmpty !== -1 ? nextEmpty : null;
  } else {
    const empty = answer.findIndex((item) => item === '');
    if (empty === -1) return;
    answer[empty] = letter;
    const nextEmpty = answer.findIndex((item) => item === '');
    state.selectedLetterIndex = nextEmpty !== -1 ? nextEmpty : null;
  }
  state.answers[word.answer] = answer;
  if (!answer.includes('')) evaluateWord(word);
  renderGame();
}

function eraseLetter() {
  const word = state.selectedWord;
  if (!word || state.locked || wordComplete(word)) return;
  const answer = answerArray(word);
  const revealed = new Set(state.revealed[word.answer] || []);
  for (let index = answer.length - 1; index >= 0; index -= 1) {
    if (answer[index] && !revealed.has(index)) {
      answer[index] = '';
      state.answers[word.answer] = answer;
      state.selectedLetterIndex = index;
      renderGame();
      return;
    }
  }
}

function evaluateWord(word) {
  if (wordComplete(word)) {
    const row = document.querySelector(`[data-answer="${word.answer}"]`);
    fireConfetti(row);
    const allCompleted = state.currentLevel.words.every((item) => wordComplete(item));
    if (allCompleted) completeLevel();
    else {
      // update progress after completing this word
      updateLevelProgress(state.currentLevel);
      const nextWord = selectNextUnfinished();
      revealLettersForRemainingWords(nextWord);
    }
    return;
  }
  state.errors += 1;
  // vibrate on supported devices (short pattern)
  try { if (navigator.vibrate) navigator.vibrate([120, 40, 80]); } catch (_) {}
  state.invalidWord = word.answer;
  state.locked = true;
  const reachedLimit = state.errors >= MAX_ERRORS[state.difficulty];
  window.setTimeout(() => {
    const restored = Array(word.answer.length).fill('');
    (state.revealed[word.answer] || []).forEach((index) => { restored[index] = word.answer[index]; });
    state.answers[word.answer] = restored;
    state.invalidWord = null;
    state.locked = false;
    if (reachedLimit) showModal('loss');
    renderGame();
  }, 500);
}

function selectNextUnfinished(direction = 1) {
  const words = state.currentLevel.words;
  const currentIndex = Math.max(0, words.findIndex((word) => word.answer === state.selectedWord?.answer));
  for (let offset = 1; offset <= words.length; offset += 1) {
    const index = (currentIndex + offset * direction + words.length) % words.length;
    if (!wordComplete(words[index])) {
      state.selectedWord = words[index];
      state.selectedLetterIndex = null;
      return words[index];
    }
  }
}

function revealLettersForRemainingWords(referenceWord) {
  if (!referenceWord) return;

  // Keep the same reward size, but distribute its letters among every
  // unfinished word instead of revealing them all in just the next word.
  let amount;
  if (referenceWord.answer.length <= 4) amount = 1;
  else if (referenceWord.answer.length <= 7) amount = 2;
  else if (referenceWord.answer.length <= 10) amount = 3;
  else amount = 4;

  const availableByWord = state.currentLevel.words.map((word) => {
    if (wordComplete(word)) return [];
    return answerArray(word)
      .map((letter, index) => (letter ? null : index))
      .filter((index) => index !== null);
  }).map((indexes, wordIndex) => ({ word: state.currentLevel.words[wordIndex], indexes }))
    .filter(({ indexes }) => indexes.length);
  if (!availableByWord.length) return;

  // Shuffle the words first. One letter is given to each word before a
  // second letter can go to the same word, spreading the reward around.
  for (let index = availableByWord.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [availableByWord[index], availableByWord[other]] = [availableByWord[other], availableByWord[index]];
  }

  let revealedCount = 0;
  while (revealedCount < amount && availableByWord.length) {
    const target = availableByWord[revealedCount % availableByWord.length];
    const randomIndex = Math.floor(Math.random() * target.indexes.length);
    const [index] = target.indexes.splice(randomIndex, 1);
    const { word } = target;
    const answer = answerArray(word);
    answer[index] = word.answer[index];
    state.answers[word.answer] = answer;
    state.revealed[word.answer] = [...new Set([...(state.revealed[word.answer] || []), index])];
    if (!target.indexes.length) availableByWord.splice(availableByWord.indexOf(target), 1);
    revealedCount += 1;
  }
}

function completeLevel() {
  const level = state.currentLevel;
  const category = getActiveCategory();
  const progressByLevel = getCategoryProgress(category.id);
  const unlockedLevels = getUnlockedLevels(category.id);
  progressByLevel[level.id] = 100;
  const next = category.levels.find((item) => item.id === level.id + 1);
  if (next && !unlockedLevels.includes(next.id)) unlockedLevels.push(next.id);
  savePersistentState();
  showModal('win');
}

function resetEntireGame() {
  const fresh = defaultState();
  state.progress = fresh.progress;
  state.unlocked = fresh.unlocked;
  state.sessions = fresh.sessions;
  state.answers = fresh.answers;
  state.revealed = fresh.revealed;
  state.errors = 0;
  state.invalidWord = null;
  state.locked = false;
  savePersistentState();
}

function showModal(type) {
  const overlay = document.getElementById('modal-overlay');
  const content = document.getElementById('modal-content');
  const title = document.getElementById('modal-title');
  const text = document.getElementById('modal-text');
  const icon = document.getElementById('modal-icon');
  const primary = document.getElementById('btn-modal-main');
  const secondary = document.getElementById('btn-modal-back');
  const winning = type === 'win';
  content.classList.toggle('loss', !winning);
  icon.textContent = winning ? '🏆' : '😵';
  title.textContent = winning ? 'Parabéns!' : 'Fim de jogo!';
  text.textContent = winning ? 'Você concluiu a fase com sucesso!' : `Você atingiu o limite de erros no modo ${state.difficulty}.`;
  // Use icons and clearer actions: primary -> next/restart, secondary -> go home or back to levels
  primary.innerHTML = winning ? 'PRÓXIMO LEVEL <span aria-hidden="true">→</span>' : 'RECOMEÇAR DO LEVEL 1';
  secondary.innerHTML = winning ? '<span aria-hidden="true">🏠</span> VOLTAR AO INÍCIO' : 'VOLTAR ÀS FASES';

  if (winning) {
    secondary.innerHTML = '<svg class="modal-home-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.7 12 3l9 7.7v9.8a.5.5 0 0 1-.5.5h-5.4v-6.5H8.9V21H3.5a.5.5 0 0 1-.5-.5z" /></svg> VOLTAR AO IN&Iacute;CIO';
  }

  primary.onclick = () => {
    overlay.classList.add('hidden');
    if (!winning) {
      resetEntireGame();
      state.activeCategoryId = 'tecnologia';
      openLevel(getActiveCategory().levels[0]);
      return;
    }
    const next = getActiveCategory().levels.find((level) => level.id === state.currentLevel.id + 1 && !level.demo);
    if (next) openLevel(next);
    else showScreen('levels-screen');
  };

  secondary.onclick = () => {
    overlay.classList.add('hidden');
    if (!winning) resetEntireGame();
    // when winning, allow user to return to home; otherwise, go to levels list
    showScreen(winning ? 'home-screen' : 'levels-screen');
  };
  overlay.classList.remove('hidden');
}

// musica click alterna entre ligar e desligar
function bindStaticControls() {
  document.querySelectorAll('[data-target]').forEach((button) => button.addEventListener('click', () => showScreen(button.dataset.target)));
  document.getElementById('btn-jogar').addEventListener('click', () => showScreen('levels-screen'));
  document.getElementById('btn-musica').addEventListener('click', () => {
    state.musicOn = !state.musicOn;
    const audio = document.getElementById('musica-fundo');
    if (state.musicOn) audio.play().catch(() => {});
    else audio.pause();
    const button = document.getElementById('btn-musica');
    button.classList.toggle('active', state.musicOn);
    button.setAttribute('aria-pressed', String(state.musicOn));
    savePersistentState();
  });
  document.getElementById('btn-tema').addEventListener('click', () => {
    state.darkMode = !state.darkMode;
    applyTheme();
    savePersistentState();
  });
  document.querySelectorAll('[data-difficulty]').forEach((button) => button.addEventListener('click', () => {
    state.difficulty = button.dataset.difficulty;
    document.querySelectorAll('[data-difficulty]').forEach((item) => item.classList.toggle('active', item === button));
    if (state.currentLevel) renderGame();
    savePersistentState();
  }));
  document.getElementById('btn-dica-prev').addEventListener('click', () => { if (!state.locked) { selectNextUnfinished(-1); renderGame(); } });
  document.getElementById('btn-dica-next').addEventListener('click', () => { if (!state.locked) { selectNextUnfinished(1); renderGame(); } });
}

// musica volume
function init() {
  loadSavedState();
  bindStaticControls();
  applyTheme();
  document.getElementById('btn-musica').classList.toggle('active', state.musicOn);
  document.getElementById('btn-musica').setAttribute('aria-pressed', String(state.musicOn));
  document.querySelector(`[data-difficulty="${state.difficulty}"]`).classList.add('active');
  document.querySelectorAll('[data-difficulty]').forEach((button) => button.classList.toggle('active', button.dataset.difficulty === state.difficulty));
  document.getElementById('musica-fundo').volume = 0.4;
  renderAbout();
  renderCategories();
  renderLevels();
  document.addEventListener('pointerdown', () => {
    if (state.musicOn) document.getElementById('musica-fundo').play().catch(() => {});
  }, { once: true });
}

init();
