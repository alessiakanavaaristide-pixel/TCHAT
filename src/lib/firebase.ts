import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, Message } from '../types';
import { checkLocalModeration } from './moderation';

// Initialize Firebase app
const app = !getApps().length ? initializeApp({
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
}) : getApp();

// Initialize Firestore with custom database ID if present
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
};

// --- Error Handling as per Firebase Skill Guidelines ---
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(errInfo.error);
}

// Default Avatar Fallback (SVG Data URL - avoids external CORS issues completely)
export const DEFAULT_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100%' height='100%' fill='%2325D366'/><circle cx='50' cy='38' r='18' fill='%23ffffff'/><path d='M20 82c0-16 13-28 30-28s30 12 30 28z' fill='%23ffffff'/></svg>";

// --- User Profile Services ---
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!uid) return null;
  const path = `users/${uid}`;
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        id: uid,
        username: data.username || `user_${uid.slice(0, 6)}`,
        name: data.name || 'Anonyme',
        email: '', // Sensitive email is not stored on public user profile doc
        image: data.image || DEFAULT_AVATAR,
        bio: data.bio || "Pose-moi n'importe quelle question !",
        theme: data.theme || 'default',
        createdAt: data.createdAt || new Date().toISOString()
      };
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function getUserByUsername(username: string): Promise<UserProfile | null> {
  const cleanUsername = username.toLowerCase().trim();
  if (!cleanUsername) return null;
  
  try {
    // 1. Lookup in username index
    const indexRef = doc(db, 'usernames', cleanUsername);
    const indexSnap = await getDoc(indexRef);

    if (indexSnap.exists()) {
      const uid = indexSnap.data().uid;
      return await getUserProfile(uid);
    }

    // 2. Fallback query users collection
    const q = query(collection(db, 'users'), where('username', '==', cleanUsername));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      const foundDoc = querySnap.docs[0];
      return await getUserProfile(foundDoc.id);
    }
    return null;
  } catch (error) {
    console.warn('Error fetching user by username:', error);
    return null;
  }
}

export async function checkUsernameAvailable(username: string, currentUid?: string): Promise<boolean> {
  const cleanUsername = username.toLowerCase().trim();
  if (!cleanUsername || cleanUsername.length < 3 || cleanUsername.length > 25) return false;
  if (!/^[a-zA-Z0-9_.]+$/.test(cleanUsername)) return false;

  try {
    // Check usernames index collection
    const indexRef = doc(db, 'usernames', cleanUsername);
    const snap = await getDoc(indexRef);
    if (snap.exists()) {
      if (currentUid && snap.data().uid === currentUid) return true;
      return false;
    }

    // Fallback query users collection
    const q = query(collection(db, 'users'), where('username', '==', cleanUsername));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      const foundDoc = querySnap.docs[0];
      if (currentUid && foundDoc.id === currentUid) return true;
      return false;
    }

    return true;
  } catch (error) {
    console.warn('Error checking username availability:', error);
    return false;
  }
}

export async function saveUserProfile(uid: string, profileData: Partial<UserProfile>): Promise<void> {
  const cleanUsername = profileData.username?.toLowerCase().trim();
  const userPath = `users/${uid}`;

  try {
    if (cleanUsername) {
      // Reserve username in usernames collection
      await setDoc(doc(db, 'usernames', cleanUsername), {
        uid,
        updatedAt: new Date().toISOString()
      });
    }

    // Save PII (email) strictly in private subcollection
    if (profileData.email) {
      await setDoc(doc(db, 'users', uid, 'private', 'info'), {
        email: profileData.email,
        updatedAt: new Date().toISOString()
      });
    }

    // Save public profile doc (never storing email here)
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      await updateDoc(userRef, {
        ...(profileData.name ? { name: profileData.name } : {}),
        ...(profileData.bio !== undefined ? { bio: profileData.bio } : {}),
        ...(profileData.image ? { image: profileData.image } : {}),
        ...(profileData.theme ? { theme: profileData.theme } : {}),
        ...(cleanUsername ? { username: cleanUsername } : {})
      });
    } else {
      await setDoc(userRef, {
        username: cleanUsername || `user_${uid.slice(0, 6)}`,
        name: profileData.name || 'User',
        image: profileData.image || DEFAULT_AVATAR,
        bio: profileData.bio || "Pose-moi toutes tes questions en secret !",
        theme: profileData.theme || 'default',
        createdAt: new Date().toISOString()
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, userPath);
  }
}

// --- Anti-Spam Rate Limit Memory Store ---
const RATE_LIMIT_WINDOW_MS = 30000; // 30 seconds
const MAX_MESSAGES_PER_WINDOW = 5;
const messageTimestamps: number[] = [];

// --- Anonymous Message Sending ---
export async function sendAnonymousMessage(
  recipientId: string,
  recipientUsername: string,
  text: string,
  promptQuestion?: string
): Promise<string> {
  const msgPath = 'messages';

  // 1. Pre-validation: Check local moderation
  const modResult = checkLocalModeration(text);
  if (!modResult.isAllowed) {
    throw new Error(modResult.reason || 'Message non autorisé.');
  }

  // 2. Anti-Spam Rate Limit Check
  const now = Date.now();
  // Filter out older timestamps outside window
  while (messageTimestamps.length > 0 && messageTimestamps[0] < now - RATE_LIMIT_WINDOW_MS) {
    messageTimestamps.shift();
  }
  if (messageTimestamps.length >= MAX_MESSAGES_PER_WINDOW) {
    throw new Error('Tu envoies des messages trop vite. Patienter quelques secondes avant de réessayer.');
  }

  // 3. Verify recipient exists
  const recipient = await getUserProfile(recipientId);
  if (!recipient) {
    throw new Error("Ce destinataire n'existe pas ou son compte n'est plus actif.");
  }

  // Record timestamp
  messageTimestamps.push(now);

  const msgData = {
    recipientId,
    recipientUsername: recipientUsername.toLowerCase(),
    text: text.trim(),
    promptQuestion: promptQuestion?.trim() || '',
    isRead: false,
    isFavorite: false,
    isFlagged: false,
    createdAt: serverTimestamp()
  };

  try {
    const docRef = await addDoc(collection(db, 'messages'), msgData);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, msgPath);
  }
}

// --- Live Messages Listener ---
export function subscribeToInbox(recipientId: string, callback: (messages: Message[]) => void) {
  const q = query(
    collection(db, 'messages'),
    where('recipientId', '==', recipientId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const list: Message[] = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    } as Message));
    callback(list);
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, 'messages');
  });
}

export async function markMessageRead(messageId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'messages', messageId), { isRead: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `messages/${messageId}`);
  }
}

export async function toggleMessageFavorite(messageId: string, currentStatus: boolean): Promise<void> {
  try {
    await updateDoc(doc(db, 'messages', messageId), { isFavorite: !currentStatus });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `messages/${messageId}`);
  }
}

export async function deleteMessage(messageId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'messages', messageId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `messages/${messageId}`);
  }
}

export async function replyToMessage(messageId: string, _replyText: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'messages', messageId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `messages/${messageId}`);
  }
}

export async function reportMessage(messageId: string, recipientId: string, reason: string): Promise<void> {
  try {
    await addDoc(collection(db, 'reports'), {
      messageId,
      recipientId,
      reason: reason.trim(),
      createdAt: new Date().toISOString()
    });
    await updateDoc(doc(db, 'messages', messageId), { isFlagged: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'reports');
  }
}
