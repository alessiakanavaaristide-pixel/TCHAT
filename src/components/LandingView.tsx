import React, { useState } from 'react';
import { motion } from 'motion/react';

interface LandingViewProps {
  onEmailSignUp?: (email: string, pass: string, username: string) => Promise<void>;
  onEmailSignIn?: (email: string, pass: string) => Promise<void>;
  onGetStarted?: (username?: string) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onEmailSignUp,
  onEmailSignIn,
  onGetStarted
}) => {
  const [tab, setTab] = useState<'register' | 'login'>('register');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (tab === 'register') {
      const cleanUser = username.replace(/^@/, '').toLowerCase().trim();
      if (!cleanUser || cleanUser.length < 3) {
        setErrorMsg("Le nom d'utilisateur doit contenir au moins 3 caractères.");
        return;
      }
      if (!/^[a-zA-Z0-9_.]+$/.test(cleanUser)) {
        setErrorMsg("Utilisez uniquement des lettres, chiffres, points et tirets (_).");
        return;
      }
      if (!email.includes('@')) {
        setErrorMsg("Veuillez saisir une adresse email valide.");
        return;
      }
      if (password.length < 6) {
        setErrorMsg("Le mot de passe doit contenir au moins 6 caractères.");
        return;
      }

      setLoading(true);
      try {
        if (onEmailSignUp) {
          await onEmailSignUp(email.trim(), password, cleanUser);
        } else if (onGetStarted) {
          onGetStarted(cleanUser);
        }
      } catch (err: any) {
        let msg = err?.message || "Erreur lors de l'inscription.";
        if (msg.includes('email-already-in-use')) {
          msg = "Cette adresse email est déjà utilisée par un autre compte.";
        } else if (msg.includes('weak-password')) {
          msg = "Mot de passe trop faible (6 caractères minimum).";
        } else if (msg.includes('invalid-email')) {
          msg = "Adresse email invalide.";
        }
        setErrorMsg(msg);
      } finally {
        setLoading(false);
      }
    } else {
      // Login
      if (!email || !password) {
        setErrorMsg("Veuillez saisir votre email et votre mot de passe.");
        return;
      }
      setLoading(true);
      try {
        if (onEmailSignIn) {
          await onEmailSignIn(email.trim(), password);
        } else if (onGetStarted) {
          onGetStarted();
        }
      } catch (err: any) {
        let msg = err?.message || "Erreur de connexion.";
        if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential')) {
          msg = "Email ou mot de passe incorrect.";
        }
        setErrorMsg(msg);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 pt-16 pb-24 flex flex-col items-center justify-center min-h-[90vh]">
      {/* Hero Header */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full flex flex-col items-center text-center space-y-4"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white font-mono-caps text-xs font-bold tracking-widest shadow-md uppercase">
          <span className="material-symbols-outlined text-sm">mail</span>
          <span>INSCRIPTION EXCLUSIVE PAR EMAIL</span>
        </div>

        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#0f172a] tracking-tight leading-none">
          Recevez des messages <br />
          <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
            100% anonymes
          </span>
        </h1>

        <p className="font-body text-sm text-slate-600 max-w-xs leading-relaxed">
          Créez votre compte par email pour obtenir votre lien TCHAT et le partager en story.
        </p>

        {/* Email Auth Card */}
        <div id="auth-card" className="w-full bg-white p-6 rounded-3xl border-2 border-slate-900 shadow-xl space-y-4 text-left relative mt-2">
          
          {/* Tab Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => { setTab('register'); setErrorMsg(null); }}
              className={`flex-1 py-2 text-xs font-mono-caps font-bold rounded-lg transition-all ${
                tab === 'register' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              S'inscrire par Email
            </button>
            <button
              type="button"
              onClick={() => { setTab('login'); setErrorMsg(null); }}
              className={`flex-1 py-2 text-xs font-mono-caps font-bold rounded-lg transition-all ${
                tab === 'login' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Se connecter
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {tab === 'register' && (
              <div>
                <label className="font-mono-caps text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  1. Votre Pseudo / Nom d'utilisateur
                </label>
                <div className="relative flex items-center bg-slate-100 rounded-xl border-2 border-slate-300 focus-within:border-slate-900 focus-within:bg-white transition-all px-3 py-2">
                  <span className="font-display font-bold text-base text-slate-400 mr-1">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_.]/g, '').toLowerCase())}
                    placeholder="votre_pseudo"
                    maxLength={25}
                    required
                    autoFocus
                    className="w-full bg-transparent font-display font-bold text-base text-slate-900 placeholder:text-slate-400 outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="font-mono-caps text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                {tab === 'register' ? "2. Votre Adresse Email" : "Adresse Email"}
              </label>
              <div className="relative flex items-center bg-slate-100 rounded-xl border-2 border-slate-300 focus-within:border-slate-900 focus-within:bg-white transition-all px-3 py-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemple@email.com"
                  required
                  className="w-full bg-transparent font-display font-medium text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-mono-caps text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                {tab === 'register' ? "3. Votre Mot de passe" : "Mot de passe"}
              </label>
              <div className="relative flex items-center bg-slate-100 rounded-xl border-2 border-slate-300 focus-within:border-slate-900 focus-within:bg-white transition-all px-3 py-2">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full bg-transparent font-display font-medium text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                />
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200 font-medium">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white font-display font-bold text-base py-3.5 rounded-2xl shadow-lg hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <span>Vérification...</span>
                  <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                </>
              ) : tab === 'register' ? (
                <>
                  <span>Créer mon compte par Email</span>
                  <span className="material-symbols-outlined text-xl">arrow_forward</span>
                </>
              ) : (
                <>
                  <span>Se connecter à mon compte</span>
                  <span className="material-symbols-outlined text-xl">login</span>
                </>
              )}
            </button>
          </form>

          <p className="font-mono-caps text-[10px] text-slate-400 tracking-wider text-center pt-2 border-t border-slate-100">
            🔒 Votre email est strictement privé et ne sera jamais affiché publiquement.
          </p>
        </div>

        {/* Visual 3-Step Preview */}
        <div className="w-full bg-slate-900 text-white p-5 rounded-3xl shadow-lg space-y-3 text-left">
          <span className="font-mono-caps text-[10px] text-pink-400 font-bold uppercase tracking-wider block">
            Comment ça fonctionne :
          </span>
          <div className="space-y-2 text-xs font-body text-slate-300">
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-pink-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0">1</span>
              <span>Créez votre compte par Email pour réserver votre pseudo</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-purple-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0">2</span>
              <span>Partagez votre lien <strong>tchat.app/u/{username || 'votre_pseudo'}</strong> en story</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-orange-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0">3</span>
              <span>Lisez vos messages secrets et répondez-y en Story !</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

