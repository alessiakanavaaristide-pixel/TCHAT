import React, { useState, useEffect } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  getUserProfile,
  getUserByUsername,
  saveUserProfile,
  checkUsernameAvailable,
  subscribeToInbox
} from './lib/firebase';
import { UserProfile, Message } from './types';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { LandingView } from './components/LandingView';
import { PublicSendView } from './components/PublicSendView';
import { InboxView } from './components/InboxView';
import { StoryGeneratorModal } from './components/StoryGeneratorModal';
import { ProfileSettingsModal } from './components/ProfileSettingsModal';
import { ProfileView } from './components/ProfileView';
import { SafetyPolicyModal } from './components/SafetyPolicyModal';
import { OnboardingModal } from './components/OnboardingModal';
import { AuthModal } from './components/AuthModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authUid, setAuthUid] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // Router state
  const [currentRoute, setCurrentRoute] = useState<string>(window.location.pathname || '/');
  const [publicRecipient, setPublicRecipient] = useState<UserProfile | null>(null);
  const [loadingPublicRecipient, setLoadingPublicRecipient] = useState(false);

  // Messages & Modals
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedStoryMsg, setSelectedStoryMsg] = useState<Message | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showSafety, setShowSafety] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authPrefilledUsername, setAuthPrefilledUsername] = useState('');

  const handleOpenAuth = (username?: string) => {
    setAuthPrefilledUsername(username || '');
    setShowAuthModal(true);
  };

  // Sync window path with route state
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentRoute(path);
    window.scrollTo(0, 0);
  };

  // Auth Observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setAuthUid(firebaseUser.uid);
        const profile = await getUserProfile(firebaseUser.uid);
        if (profile) {
          setCurrentUser(profile);
          setNeedsOnboarding(false);
        } else {
          // Check if Google user has display name or email
          setNeedsOnboarding(true);
        }
      } else {
        // Check if there is a local demo profile saved
        const localUid = localStorage.getItem('unsaid_demo_uid');
        if (localUid) {
          const profile = await getUserProfile(localUid);
          if (profile) {
            setAuthUid(localUid);
            setCurrentUser(profile);
            setNeedsOnboarding(false);
          } else {
            setAuthUid(null);
            setCurrentUser(null);
            setNeedsOnboarding(false);
          }
        } else {
          setAuthUid(null);
          setCurrentUser(null);
          setNeedsOnboarding(false);
        }
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Real-time inbox listener for current user
  useEffect(() => {
    if (!currentUser) {
      setMessages([]);
      return;
    }

    const unsubscribe = subscribeToInbox(currentUser.id, (inboxMsgs) => {
      setMessages(inboxMsgs);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Handle Public Send Page Route `/u/[username]`
  useEffect(() => {
    if (currentRoute.startsWith('/u/')) {
      const usernameParam = currentRoute.replace('/u/', '').trim();
      if (usernameParam) {
        setLoadingPublicRecipient(true);
        getUserByUsername(usernameParam).then((res) => {
          if (res) {
            setPublicRecipient(res);
          } else {
            setPublicRecipient({
              id: usernameParam.toLowerCase(),
              username: usernameParam.toLowerCase(),
              name: `@${usernameParam}`,
              email: '',
              image: '',
              bio: "Posez-moi vos questions, je vous réponds en toute franchise.",
              theme: 'default',
              createdAt: new Date().toISOString()
            });
          }
          setLoadingPublicRecipient(false);
        });
      }
    }
  }, [currentRoute]);

  // Auth Handlers
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setShowAuthModal(false);
      navigateTo('/inbox');
    } catch (err: any) {
      console.warn('Google Sign In Popup notice:', err);
      // Fallback show auth modal
      setShowAuthModal(true);
    }
  };

  const handleEmailSignUp = async (email: string, pass: string, chosenUsername: string) => {
    const cleanUsername = chosenUsername.toLowerCase().trim();
    // Check if username available
    const isAvail = await checkUsernameAvailable(cleanUsername, 'new_user');
    if (!isAvail) {
      throw new Error(`Le pseudo "@${cleanUsername}" est déjà réservé par un autre utilisateur. Veuillez en choisir un autre.`);
    }

    const userCred = await createUserWithEmailAndPassword(auth, email, pass);
    const uid = userCred.user.uid;
    setAuthUid(uid);

    const newProfile: UserProfile = {
      id: uid,
      username: cleanUsername,
      name: cleanUsername,
      email: email,
      image: '',
      bio: "Posez-moi vos questions, je vous réponds en toute franchise.",
      theme: 'default',
      createdAt: new Date().toISOString()
    };

    await saveUserProfile(uid, newProfile);
    setCurrentUser(newProfile);
    setShowAuthModal(false);
    navigateTo('/inbox');
  };

  const handleEmailSignIn = async (email: string, pass: string) => {
    const userCred = await signInWithEmailAndPassword(auth, email, pass);
    const uid = userCred.user.uid;
    setAuthUid(uid);

    const existing = await getUserProfile(uid);
    if (existing) {
      setCurrentUser(existing);
    } else {
      const defaultName = email.split('@')[0] || 'utilisateur';
      const fallbackProfile: UserProfile = {
        id: uid,
        username: defaultName.toLowerCase().replace(/[^a-z0-9_]/g, ''),
        name: defaultName,
        email: email,
        image: '',
        bio: "Posez-moi vos questions, je vous réponds en toute franchise.",
        theme: 'default',
        createdAt: new Date().toISOString()
      };
      await saveUserProfile(uid, fallbackProfile);
      setCurrentUser(fallbackProfile);
    }
    setShowAuthModal(false);
    navigateTo('/inbox');
  };

  const handleQuickStart = async (chosenUsername: string) => {
    const cleanUsername = chosenUsername.toLowerCase().trim();
    let uid: string;
    try {
      const userCred = await signInAnonymously(auth);
      uid = userCred.user.uid;
    } catch (authErr: any) {
      console.warn('Firebase Anonymous Auth fallback:', authErr);
      let localUid = localStorage.getItem('unsaid_demo_uid');
      if (!localUid) {
        localUid = 'user_' + Math.random().toString(36).substring(2, 10);
        localStorage.setItem('unsaid_demo_uid', localUid);
      }
      uid = localUid;
    }

    setAuthUid(uid);
    const existing = await getUserProfile(uid);
    if (existing) {
      const updated = { ...existing, username: cleanUsername };
      await saveUserProfile(uid, updated);
      setCurrentUser(updated);
    } else {
      const isAvail = await checkUsernameAvailable(cleanUsername, uid);
      if (!isAvail) {
        throw new Error("Ce nom d'utilisateur est déjà utilisé par un autre compte.");
      }
      const newProfile: UserProfile = {
        id: uid,
        username: cleanUsername,
        name: cleanUsername,
        email: '',
        image: '',
        bio: "Posez-moi vos questions, je vous réponds en toute franchise.",
        theme: 'default',
        createdAt: new Date().toISOString()
      };
      await saveUserProfile(uid, newProfile);
      setCurrentUser(newProfile);
    }
    setShowAuthModal(false);
    navigateTo('/inbox');
  };

  const handleDemoLogin = async () => {
    try {
      let uid: string;
      try {
        const userCred = await signInAnonymously(auth);
        uid = userCred.user.uid;
      } catch (authErr: any) {
        console.warn('Firebase Anonymous Auth not enabled, using fallback local demo session:', authErr?.message || authErr);
        let localUid = localStorage.getItem('unsaid_demo_uid');
        if (!localUid) {
          localUid = 'demo_' + Math.random().toString(36).substring(2, 10);
          localStorage.setItem('unsaid_demo_uid', localUid);
        }
        uid = localUid;
      }

      setAuthUid(uid);
      const existingProfile = await getUserProfile(uid);
      if (existingProfile) {
        setCurrentUser(existingProfile);
        setNeedsOnboarding(false);
      } else {
        const demoProfile: UserProfile = {
          id: uid,
          username: `user_${uid.slice(-6)}`,
          name: 'Utilisateur Démo',
          email: 'demo@unsaid.app',
          image: '',
          bio: "Posez-moi vos questions, je vous réponds en toute franchise.",
          theme: 'default',
          createdAt: new Date().toISOString()
        };
        await saveUserProfile(uid, demoProfile);
        setCurrentUser(demoProfile);
        setNeedsOnboarding(false);
      }
      navigateTo('/inbox');
    } catch (err) {
      console.error('Demo Login Error:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      // Ignore signOut errors if unauthenticated
    }
    localStorage.removeItem('unsaid_demo_uid');
    setAuthUid(null);
    setCurrentUser(null);
    setShowSettings(false);
    navigateTo('/');
  };

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div className="min-h-screen bg-[#fdf8f8] text-[#1c1b1b] flex flex-col font-body selection:bg-[#ebe1d4]">
      {/* Tactile Grain Texture Overlay */}
      <div className="grain-overlay" />

      {/* Navigation Header */}
      <Navbar
        unreadCount={unreadCount}
        currentRoute={currentRoute}
        onNavigate={navigateTo}
        onOpenSettings={currentUser ? () => setShowSettings(true) : undefined}
        onOpenSafety={() => setShowSafety(true)}
        onOpenAuth={() => {
          if (currentRoute === '/') {
            const el = document.getElementById('auth-card');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
            } else {
              setShowAuthModal(true);
            }
          } else {
            setShowAuthModal(true);
          }
        }}
        userHandle={currentUser?.username}
      />

      {/* Main Page Routing */}
      <main className="flex-1">
        {currentRoute === '/' && (
          <LandingView
            onEmailSignUp={handleEmailSignUp}
            onEmailSignIn={handleEmailSignIn}
            onGetStarted={(prefilled) => handleOpenAuth(prefilled)}
          />
        )}

        {currentRoute.startsWith('/u/') && (
          loadingPublicRecipient ? (
            <div className="pt-32 text-center text-[#5e5e5b] font-mono-caps text-xs">
              Chargement du profil public...
            </div>
          ) : publicRecipient ? (
            <PublicSendView
              recipient={publicRecipient}
              onCreateOwnLink={() => {
                if (currentUser) {
                  navigateTo('/inbox');
                } else {
                  setShowAuthModal(true);
                }
              }}
            />
          ) : (
            <div className="pt-32 text-center text-[#5e5e5b] font-mono-caps text-xs">
              Utilisateur introuvable.
            </div>
          )
        )}

        {(currentRoute === '/inbox' || currentRoute === '/dashboard') && (
          currentUser ? (
            <InboxView
              user={currentUser}
              messages={messages}
              onOpenStoryModal={(msg) => setSelectedStoryMsg(msg)}
              onNavigate={navigateTo}
            />
          ) : (
            <LandingView
              onEmailSignUp={handleEmailSignUp}
              onEmailSignIn={handleEmailSignIn}
              onGetStarted={(prefilled) => handleOpenAuth(prefilled)}
            />
          )
        )}

        {currentRoute === '/prompts' && (
          currentUser ? (
            <div className="w-full max-w-2xl mx-auto px-5 pt-24 pb-28">
              <h1 className="font-display font-semibold text-2xl text-[#1c1b1b] mb-2">
                Inspirations & Suggestions
              </h1>
              <p className="font-body text-sm text-[#5e5e5b] mb-6">
                Idées de questions à partager en story pour engager vos abonnés :
              </p>
              <div className="space-y-3">
                {[
                  "Qu'est-ce que tu ne m'as jamais dit ?",
                  "Quelle est votre première impression sur moi ?",
                  "Pose-moi une question sur mes projets secrets...",
                  "Dis-moi un compliment ou une critique constructive.",
                  "Quel souvenir partagé t'a le plus marqué ?"
                ].map((pText, i) => (
                  <div key={i} className="paper-card p-4 rounded-xl border border-[#ebe1d4] flex items-center justify-between">
                    <p className="font-quote italic text-base text-[#1c1b1b]">"{pText}"</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(pText);
                        alert("Prompt copié !");
                      }}
                      className="p-2 text-[#5e5e5b] hover:text-[#1c1b1b]"
                      title="Copier le prompt"
                    >
                      <span className="material-symbols-outlined text-lg">content_copy</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <LandingView
              onEmailSignUp={handleEmailSignUp}
              onEmailSignIn={handleEmailSignIn}
              onGetStarted={(prefilled) => handleOpenAuth(prefilled)}
            />
          )
        )}

        {(currentRoute === '/settings' || currentRoute === '/profile') && (
          currentUser ? (
            <ProfileView
              user={currentUser}
              onUpdateUser={(updated) => setCurrentUser(updated)}
              onSignOut={handleSignOut}
              onNavigate={navigateTo}
            />
          ) : (
            <LandingView
              onEmailSignUp={handleEmailSignUp}
              onEmailSignIn={handleEmailSignIn}
              onGetStarted={(prefilled) => handleOpenAuth(prefilled)}
            />
          )
        )}
      </main>

      {/* Bottom Navigation for Logged-In Mobile Users */}
      {currentUser && currentRoute !== '/' && !currentRoute.startsWith('/u/') && (
        <BottomNav
          currentRoute={currentRoute}
          onNavigate={navigateTo}
          unreadCount={unreadCount}
        />
      )}

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onEmailSignUp={handleEmailSignUp}
        onEmailSignIn={handleEmailSignIn}
        initialUsername={authPrefilledUsername}
      />
      {selectedStoryMsg && currentUser && (
        <StoryGeneratorModal
          message={selectedStoryMsg}
          user={currentUser}
          onClose={() => setSelectedStoryMsg(null)}
        />
      )}

      {showSettings && currentUser && (
        <ProfileSettingsModal
          user={currentUser}
          onUpdateUser={(updated) => setCurrentUser(updated)}
          onSignOut={handleSignOut}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showSafety && (
        <SafetyPolicyModal onClose={() => setShowSafety(false)} />
      )}

      {needsOnboarding && authUid && (
        <OnboardingModal
          uid={authUid}
          defaultEmail={auth.currentUser?.email || ''}
          defaultName={auth.currentUser?.displayName || 'User'}
          defaultImage={auth.currentUser?.photoURL || undefined}
          onComplete={(completedUser) => {
            setCurrentUser(completedUser);
            setNeedsOnboarding(false);
            navigateTo('/inbox');
          }}
        />
      )}
    </div>
  );
}
