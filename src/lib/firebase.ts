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
import { UserProfile, Message, Report, ColorTheme } from '../types';

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

// User Services
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function getUserByUsername(username: string): Promise<UserProfile | null> {
  try {
    const cleanUsername = username.toLowerCase().trim();
    // First lookup in username index
    const indexRef = doc(db, 'usernames', cleanUsername);
    const indexSnap = await getDoc(indexRef);
    
    if (indexSnap.exists()) {
      const uid = indexSnap.data().uid;
      return await getUserProfile(uid);
    }
    
    // Fallback query users collection
    const q = query(collection(db, 'users'), where('username', '==', cleanUsername));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      return querySnap.docs[0].data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user by username:', error);
    return null;
  }
}

export async function checkUsernameAvailable(username: string, currentUid?: string): Promise<boolean> {
  const cleanUsername = username.toLowerCase().trim();
  if (!cleanUsername || cleanUsername.length < 3 || cleanUsername.length > 25) return false;
  if (!/^[a-zA-Z0-9_.]+$/.test(cleanUsername)) return false;

  try {
    // 1. Check usernames index collection
    const indexRef = doc(db, 'usernames', cleanUsername);
    const snap = await getDoc(indexRef);
    if (snap.exists()) {
      if (currentUid && snap.data().uid === currentUid) return true;
      return false;
    }

    // 2. Direct fallback query on users collection
    const q = query(collection(db, 'users'), where('username', '==', cleanUsername));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      const foundDoc = querySnap.docs[0];
      if (currentUid && foundDoc.id === currentUid) return true;
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking username availability:', error);
    return false;
  }
}

export async function saveUserProfile(uid: string, profileData: Partial<UserProfile>): Promise<void> {
  const cleanUsername = profileData.username?.toLowerCase().trim();
  
  if (cleanUsername) {
    // Reserve username in usernames collection
    await setDoc(doc(db, 'usernames', cleanUsername), {
      uid,
      updatedAt: new Date().toISOString()
    });
  }

  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    await updateDoc(userRef, {
      ...profileData,
      ...(cleanUsername ? { username: cleanUsername } : {})
    });
  } else {
    await setDoc(userRef, {
      id: uid,
      username: cleanUsername || `user_${uid.slice(0, 6)}`,
      name: profileData.name || 'Anonymous User',
      email: profileData.email || '',
      image: profileData.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      bio: profileData.bio || "Ask me anything, I'm an open book.",
      theme: profileData.theme || 'default',
      createdAt: new Date().toISOString()
    });
  }
}

// Anonymous Message Sending
export async function sendAnonymousMessage(recipientId: string, recipientUsername: string, text: string, promptQuestion?: string): Promise<string> {
  const msgData = {
    recipientId,
    recipientUsername: recipientUsername.toLowerCase(),
    text,
    promptQuestion: promptQuestion || '',
    isRead: false,
    isFavorite: false,
    isFlagged: false,
    createdAt: serverTimestamp()
  };

  const docRef = await addDoc(collection(db, 'messages'), msgData);
  return docRef.id;
}

// Live Messages Listener
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
    console.error('Snapshot error listening to inbox:', err);
  });
}

export async function markMessageRead(messageId: string): Promise<void> {
  await updateDoc(doc(db, 'messages', messageId), { isRead: true });
}

export async function toggleMessageFavorite(messageId: string, currentStatus: boolean): Promise<void> {
  await updateDoc(doc(db, 'messages', messageId), { isFavorite: !currentStatus });
}

export async function deleteMessage(messageId: string): Promise<void> {
  await deleteDoc(doc(db, 'messages', messageId));
}

export async function replyToMessage(messageId: string, replyText: string): Promise<void> {
  // Les messages sont éphémères : une fois lus et répondus, le message est supprimé de Firestore
  try {
    await deleteDoc(doc(db, 'messages', messageId));
  } catch (err) {
    console.error('Erreur lors de la suppression du message répondu :', err);
  }
}

export async function reportMessage(messageId: string, recipientId: string, reason: string): Promise<void> {
  await addDoc(collection(db, 'reports'), {
    messageId,
    recipientId,
    reason,
    createdAt: new Date().toISOString()
  });
  await updateDoc(doc(db, 'messages', messageId), { isFlagged: true });
}
