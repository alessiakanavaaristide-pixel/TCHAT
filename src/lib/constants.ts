import { ThemeConfig, ColorTheme } from '../types';

export const PROMPTS_BANK = [
  "Qu'est-ce que tu ne m'as jamais dit ?",
  "Pose-moi une question anonyme...",
  "Dis-moi un secret que tu n'as jamais partagé.",
  "Que penses-tu vraiment de moi ?",
  "Si tu pouvais me dire une chose sans conséquences, ce serait quoi ?",
  "Quelle a été ta vraie première impression sur moi ?",
  "Quel est ton meilleur souvenir avec moi ?",
  "Quel est un rêve ou un objectif que tu n'as jamais partagé ?",
  "Quelle qualité chez moi admires-tu en secret ?",
  "Si on partait en voyage demain, où aimerais-tu qu'on aille ?",
  "Quel est le truc le plus drôle qu'on ait fait ensemble ?",
  "Quelle chanson te fait immédiatement penser à moi ?"
];

export const THEMES: Record<ColorTheme, ThemeConfig> = {
  iridescent: {
    id: 'iridescent',
    name: '3D Verre Iridescent',
    bg: 'linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #f97316 100%)',
    cardBg: 'rgba(255, 255, 255, 0.95)',
    cardBorder: 'rgba(255, 255, 255, 0.95)',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    accent: '#ec4899',
    previewColor: '#ec4899',
    glass: true
  },
  cyber3d: {
    id: 'cyber3d',
    name: '3D Néon Sombre',
    bg: '#0a0d14',
    cardBg: 'rgba(15, 23, 42, 0.92)',
    cardBorder: 'rgba(99, 102, 241, 0.5)',
    textPrimary: '#ffffff',
    textSecondary: '#94a3b8',
    accent: '#818cf8',
    previewColor: '#1e1b4b',
    glass: true
  },
  clay3d: {
    id: 'clay3d',
    name: '3D Soft Clay',
    bg: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    cardBg: '#ffffff',
    cardBorder: 'rgba(251, 146, 60, 0.3)',
    textPrimary: '#431407',
    textSecondary: '#7c2d12',
    accent: '#ea580c',
    previewColor: '#fcb69f'
  },
  default: {
    id: 'default',
    name: 'Papier & Encre',
    bg: '#fdf8f8',
    cardBg: '#ffffff',
    cardBorder: '#ebe1d4',
    textPrimary: '#1c1b1b',
    textSecondary: '#5e5e5b',
    accent: '#000000',
    previewColor: '#fdf8f8'
  },
  sand: {
    id: 'sand',
    name: 'Sable Chaud',
    bg: '#f5e6da',
    cardBg: '#fdf8f8',
    cardBorder: '#e4d3c3',
    textPrimary: '#29231d',
    textSecondary: '#6e6258',
    accent: '#29231d',
    previewColor: '#f5e6da'
  },
  slate: {
    id: 'slate',
    name: 'Ardoise Calme',
    bg: '#e2e8f0',
    cardBg: '#ffffff',
    cardBorder: '#cbd5e1',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    accent: '#0f172a',
    previewColor: '#e2e8f0'
  },
  dark: {
    id: 'dark',
    name: 'Encre Sombre',
    bg: '#18181b',
    cardBg: '#27272a',
    cardBorder: '#3f3f46',
    textPrimary: '#f4f4f5',
    textSecondary: '#a1a1aa',
    accent: '#ffffff',
    previewColor: '#18181b'
  },
  rose: {
    id: 'rose',
    name: 'Rose Poudré',
    bg: '#fce7f3',
    cardBg: '#fff1f2',
    cardBorder: '#fbcfe8',
    textPrimary: '#4c1d95',
    textSecondary: '#701a75',
    accent: '#4c1d95',
    previewColor: '#fce7f3'
  }
};
