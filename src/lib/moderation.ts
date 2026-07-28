// Content moderation engine for TCHAT

export interface ModerationResult {
  isAllowed: boolean;
  reason?: string;
  normalizedText?: string;
}

// Leetspeak dictionary for text normalization
const LEET_MAP: Record<string, string> = {
  '0': 'o',
  '1': 'i',
  '!': 'i',
  '|': 'i',
  '3': 'e',
  '4': 'a',
  '@': 'a',
  '5': 's',
  '$': 's',
  '7': 't',
  '8': 'b',
  '9': 'g',
};

/**
 * Normalizes input text by stripping accents, decoding leetspeak,
 * and flattening spaces to prevent obfuscation bypasses.
 */
export function normalizeText(text: string): string {
  // 1. Convert to lower case & NFD decompose accents
  let normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  // 2. Decode leetspeak characters
  normalized = normalized
    .split('')
    .map((char) => LEET_MAP[char] || char)
    .join('');

  // 3. Remove zero-width characters and special symbols
  normalized = normalized.replace(/[\u200B-\u200D\uFEFF]/g, '');

  return normalized;
}

// Strict forbidden words / regex patterns (French & English)
const FORBIDDEN_WORDS = [
  'suicide',
  'kill',
  'salope',
  'connard',
  'encule',
  'pute',
  'nigger',
  'faggot',
  'retard',
  'terrorist',
  'fils de pute',
  'moche',
  'crever',
  'viol',
];

const FORBIDDEN_PATTERNS = [
  /\b(kill\s*your\s*self|suicide|die\s*bitch|nigger|faggot|retard)\b/i,
  /\b(tu\s*es\s*moche|suicide-toi|connard|salope|fils\s*de\s*pute|encule|sac\s*de\s*merde)\b/i,
  /\b(bomb|terrorist|hate\s*you|slit\s*wrists)\b/i,
];

export function checkLocalModeration(text: string): ModerationResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return { isAllowed: false, reason: 'Le message ne peut pas être vide.' };
  }
  if (trimmed.length > 500) {
    return { isAllowed: false, reason: 'Le message dépasse la limite de 500 caractères.' };
  }

  // 1. Direct Pattern Check
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        isAllowed: false,
        reason: 'Ce message contient du contenu inapproprié, haineux ou offensant et ne peut pas être envoyé.',
      };
    }
  }

  // 2. Normalized Leetspeak & Space-stripped Check
  const normalized = normalizeText(trimmed);
  const strippedSpaces = normalized.replace(/[^a-z0-9]/g, '');

  for (const badWord of FORBIDDEN_WORDS) {
    const cleanBadWord = badWord.replace(/[^a-z0-9]/g, '');
    if (strippedSpaces.includes(cleanBadWord) || normalized.includes(badWord)) {
      return {
        isAllowed: false,
        reason: 'Ce message contient des termes offensants ou inappropriés.',
        normalizedText: normalized,
      };
    }
  }

  return { isAllowed: true, normalizedText: normalized };
}
