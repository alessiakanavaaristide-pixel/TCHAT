import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

const LEET_MAP: Record<string, string> = {
  '0': 'o', '1': 'i', '!': 'i', '|': 'i', '3': 'e', '4': 'a',
  '@': 'a', '5': 's', '$': 's', '7': 't', '8': 'b', '9': 'g',
};

function normalizeText(text: string): string {
  let normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  normalized = normalized
    .split('')
    .map((char) => LEET_MAP[char] || char)
    .join('');

  return normalized.replace(/[\u200B-\u200D\uFEFF]/g, '');
}

const FORBIDDEN_WORDS = [
  'suicide', 'kill', 'salope', 'connard', 'encule', 'pute',
  'nigger', 'faggot', 'retard', 'terrorist', 'fils de pute',
  'moche', 'crever', 'viol'
];

/**
 * Cloud Function triggered when a new message is written to Firestore.
 * Performs server-side content moderation and flags or deletes inappropriate messages.
 */
export const moderateMessageOnCreate = functions.firestore
  .document('messages/{messageId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    if (!data || !data.text) return;

    const rawText = data.text as string;
    const normalized = normalizeText(rawText);
    const strippedSpaces = normalized.replace(/[^a-z0-9]/g, '');

    let isToxic = false;
    for (const badWord of FORBIDDEN_WORDS) {
      const cleanBad = badWord.replace(/[^a-z0-9]/g, '');
      if (strippedSpaces.includes(cleanBad) || normalized.includes(badWord)) {
        isToxic = true;
        break;
      }
    }

    if (isToxic) {
      console.warn(`[Moderation] Message ${context.params.messageId} flagged as toxic.`);
      await snap.ref.update({
        isFlagged: true,
        text: '[Message masqué par la modération automatique]',
        moderatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  });
