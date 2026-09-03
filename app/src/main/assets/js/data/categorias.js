import { LEVELS_TECNOLOGIA } from './categorias/tecnologia.js';
import { LEVELS_GERAIS } from './categorias/gerais.js';
import { LEVELS_BIOLOGIA } from './categorias/biologia.js';
import { LEVELS_DIREITO } from './categorias/direito.js';
import { LEVELS_MATEMATICA } from './categorias/matematica.js';

export const CATEGORIES = [
  { id: 'tecnologia', title: 'Tecnologia', description: 'Sistemas, internet e programação.', icon: '</>', levels: LEVELS_TECNOLOGIA },
  { id: 'gerais', title: 'Conhecimentos Gerais', description: 'Mundo, sociedade, cultura e ciência.', icon: '◎', levels: LEVELS_GERAIS },
  { id: 'biologia', title: 'Biologia', description: 'Vida, corpo humano e ecologia.', icon: '⌬', levels: LEVELS_BIOLOGIA },
  { id: 'direito', title: 'Direito', description: 'Leis, justiça e cidadania.', icon: '§', levels: LEVELS_DIREITO },
  { id: 'matematica', title: 'Matemática', description: 'Números, geometria e cálculos.', icon: '∑', levels: LEVELS_MATEMATICA },
];
