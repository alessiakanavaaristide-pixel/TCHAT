// Content moderation engine for Unsaid

const FORBIDDEN_PATTERNS = [
  // Harmful / Hate Speech / Threat patterns in English & French
  /\b(kill\s*your\s*self|suicide|die\s*bitch|nigger|faggot|retard)\b/i,
  /\b(tu\s*es\s*moche|suicide-toi|connard|salope|fils\s*de\s*pute|enculé)\b/i,
  /\b(bomb|terrorist|hate\s*you|slit\s*wrists)\b/i
];

export interface ModerationResult {
  isAllowed: boolean;
  reason?: string;
}

export function checkLocalModeration(text: string): ModerationResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return { isAllowed: false, reason: "Le message ne peut pas être vide." };
  }
  if (trimmed.length > 500) {
    return { isAllowed: false, reason: "Le message dépasse la limite de 500 caractères." };
  }

  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { 
        isAllowed: false, 
        reason: "Ce message contient du contenu inapproprié, haineux ou offensant et ne peut pas être envoyé." 
      };
    }
  }

  return { isAllowed: true };
}
