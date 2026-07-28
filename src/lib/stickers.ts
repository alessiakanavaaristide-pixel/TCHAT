export interface PresetSticker {
  id: string;
  label: string;
  category: 'badges' | 'emojis' | 'stickers';
  content: string;
  type: 'emoji' | 'badge' | 'sticker';
  bg?: string;
  textColor?: string;
  icon?: string;
}

export interface PlacedSticker {
  id: string;
  content: string;
  type: 'emoji' | 'badge' | 'sticker';
  x: number; // percentage relative to container width (0 - 100)
  y: number; // percentage relative to container height (0 - 100)
  scale: number; // default 1
  rotation: number; // in degrees
  bg?: string;
  textColor?: string;
}

export const STICKER_LIBRARY: PresetSticker[] = [
  // --- BADGES STYLISÉS ---
  { id: 'b1', label: '100% Secret', category: 'badges', content: '🔒 100% SECRET', type: 'badge', bg: 'linear-gradient(135deg, #111111, #2a2a2a)', textColor: '#ffffff' },
  { id: 'b2', label: 'Sensible', category: 'badges', content: '🔥 SANS FILTRE', type: 'badge', bg: 'linear-gradient(135deg, #ef4444, #f97316)', textColor: '#ffffff' },
  { id: 'b3', label: 'Dis-moi tout', category: 'badges', content: '⚡ DIS-MOI TOUT', type: 'badge', bg: 'linear-gradient(135deg, #eab308, #ca8a04)', textColor: '#000000' },
  { id: 'b4', label: 'Pas de Tabou', category: 'badges', content: '🙈 PAS DE TABOU', type: 'badge', bg: 'linear-gradient(135deg, #ec4899, #8b5cf6)', textColor: '#ffffff' },
  { id: 'b5', label: 'Chut...', category: 'badges', content: '🤫 CHUT...', type: 'badge', bg: 'linear-gradient(135deg, #0ea5e9, #6366f1)', textColor: '#ffffff' },
  { id: 'b6', label: 'Qui suis-je ?', category: 'badges', content: '👀 QUI SUIS-JE ?', type: 'badge', bg: 'linear-gradient(135deg, #10b981, #059669)', textColor: '#ffffff' },
  { id: 'b7', label: 'VIP Only', category: 'badges', content: '👑 VIP CONFESSION', type: 'badge', bg: 'linear-gradient(135deg, #f59e0b, #d97706)', textColor: '#000000' },
  { id: 'b8', label: 'Story Exclusif', category: 'badges', content: '✨ STORY EXCLUSIF', type: 'badge', bg: 'linear-gradient(135deg, #a855f7, #ec4899)', textColor: '#ffffff' },
  { id: 'b9', label: 'Vrai ou Faux', category: 'badges', content: '💯 VRAI OU FAUX', type: 'badge', bg: 'linear-gradient(135deg, #f43f5e, #be123c)', textColor: '#ffffff' },
  { id: 'b10', label: 'Clique ici', category: 'badges', content: '👉 RÉPONDS ICI', type: 'badge', bg: 'linear-gradient(135deg, #25D366, #128C7E)', textColor: '#ffffff' },

  // --- STICKERS GRAPHIQUES ---
  { id: 's1', label: 'Top Secret Stamp', category: 'stickers', content: 'TOP SECRET 💥', type: 'sticker', bg: '#ef4444', textColor: '#ffffff' },
  { id: 's2', label: 'No Filter', category: 'stickers', content: 'NO FILTER 🌶️', type: 'sticker', bg: '#000000', textColor: '#22c55e' },
  { id: 's3', label: 'Send It', category: 'stickers', content: '🚀 SEND IT', type: 'sticker', bg: '#3b82f6', textColor: '#ffffff' },
  { id: 's4', label: 'Question du Jour', category: 'stickers', content: '❓ QUESTION DU JOUR', type: 'sticker', bg: '#8b5cf6', textColor: '#ffffff' },
  { id: 's5', label: '100% Anonyme', category: 'stickers', content: '🎭 ANONYMOUS', type: 'sticker', bg: '#111827', textColor: '#f3f4f6' },

  // --- EMOJIS TENDANCES ---
  { id: 'e1', label: 'Feu', category: 'emojis', content: '🔥', type: 'emoji' },
  { id: 'e2', label: 'Chut', category: 'emojis', content: '🤫', type: 'emoji' },
  { id: 'e3', label: 'Yeux', category: 'emojis', content: '👀', type: 'emoji' },
  { id: 'e4', label: 'Diable', category: 'emojis', content: '😈', type: 'emoji' },
  { id: 'e5', label: 'Tête de mort', category: 'emojis', content: '💀', type: 'emoji' },
  { id: 'e6', label: 'Cœur en feu', category: 'emojis', content: '❤️‍🔥', type: 'emoji' },
  { id: 'e7', label: 'Éclair', category: 'emojis', content: '⚡', type: 'emoji' },
  { id: 'e8', label: 'Couronne', category: 'emojis', content: '👑', type: 'emoji' },
  { id: 'e9', label: 'Diamant', category: 'emojis', content: '💎', type: 'emoji' },
  { id: 'e10', label: 'Bande', category: 'emojis', content: '💯', type: 'emoji' },
  { id: 'e11', label: 'Explosion', category: 'emojis', content: '💥', type: 'emoji' },
  { id: 'e12', label: 'Fusée', category: 'emojis', content: '🚀', type: 'emoji' },
  { id: 'e13', label: 'Étoiles', category: 'emojis', content: '✨', type: 'emoji' },
  { id: 'e14', label: 'Fête', category: 'emojis', content: '🥳', type: 'emoji' },
  { id: 'e15', label: 'Bisou', category: 'emojis', content: '😘', type: 'emoji' },
  { id: 'e16', label: 'Ours / Singe', category: 'emojis', content: '🙈', type: 'emoji' },
  { id: 'e17', label: 'Cadenas', category: 'emojis', content: '🔒', type: 'emoji' },
  { id: 'e18', label: 'Cible', category: 'emojis', content: '🎯', type: 'emoji' },
];
