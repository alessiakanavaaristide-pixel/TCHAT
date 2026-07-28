export type ColorTheme = 'default' | 'iridescent' | 'cyber3d' | 'clay3d' | 'sand' | 'slate' | 'dark' | 'rose';

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  image: string;
  bio: string;
  theme: ColorTheme;
  createdAt: string;
}

export interface Message {
  id: string;
  recipientId: string;
  recipientUsername: string;
  text: string;
  promptQuestion?: string;
  isRead: boolean;
  isFavorite: boolean;
  isFlagged: boolean;
  createdAt: any; // Firestore Timestamp or string
  replyText?: string;
  replyAt?: string;
}

export interface Report {
  id?: string;
  messageId: string;
  recipientId: string;
  reason: string;
  createdAt: string;
}

export interface ThemeConfig {
  id: ColorTheme;
  name: string;
  bg: string;
  cardBg: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  previewColor: string;
  bgImage?: string;
  glass?: boolean;
}
