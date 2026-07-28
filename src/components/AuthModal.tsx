import React, { useState } from 'react';
import { motion } from 'motion/react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmailSignUp: (email: string, pass: string, username: string) => Promise<void>;
  onEmailSignIn: (email: string, pass: string) => Promise<void>;
  initialUsername?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onEmailSignUp,
  onEmailSignIn,
  initialUsername = ''
}) => {
  const [tab, setTab] = useState<'register' | 'login'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(initialUsername);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialUsername) {
      setUsername(initialUsername);
    }
  }, [initialUsername]);

  if (!isOpen) return null;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (tab === 'register') {
      const cleanUser = username.replace(/^@/, '').toLowerCase().trim();
      if (!cleanUser || cleanUser.length < 3) {
        setError("Le nom d'utilisateur doit contenir au moins 3 caractères.");
        return;
      }
      if (!email.includes('@')) {
        setError("Veuillez saisir une adresse email valide.");
        return;
      }
      if (password.length < 6) {
        setError("Le mot de passe doit contenir au moins 6 caractères.");
        return;
      }

      setLoading(true);
      try {
        await onEmailSignUp(email.trim(), password, cleanUser);
        onClose();
      } catch (err: any) {
        let msg = err?.message || "Erreur lors de l'inscription.";
        if (msg.includes('email-already-in-use')) {
          msg = "Cette adresse email est déjà utilisée par un autre compte.";
        } else if (msg.includes('weak-password')) {
          msg = "Mot de passe trop faible (6 caractères minimum).";
        } else if (msg.includes('invalid-email')) {
          msg = "Adresse email invalide.";
        }
        setError(msg);
      } finally {
        setLoading(false);
      }
    } else {
      // Login
      if (!email || !password) {
        setError("Veuillez remplir tous les champs.");
        return;
      }
      setLoading(true);
      try {
        await onEmailSignIn(email.trim(), password);
        onClose();
      } catch (err: any) {
        let msg = err?.message || "Erreur de connexion.";
        if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential')) {
          msg = "Email ou mot de passe incorrect.";
        }
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-[#fdf8f8] w-full max-w-md rounded-2xl shadow-2xl p-6 border border-[#ebe1d4] relative my-8"
      >
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 text-[#5e5e5b] hover:text-[#1c1b1b] p-1 rounded-full transition-colors"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-[#1c1b1b] text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
            <span className="material-symbols-outlined text-2xl">mail</span>
          </div>
          <h2 className="font-display font-bold text-2xl text-[#1c1b1b]">
            Espace Membre TCHAT
          </h2>
          <p className="font-body text-xs text-[#5e5e5b] mt-1">
            Inscription et connexion uniquement par adresse Email
          </p>
        </div>

        {/* Auth Mode Tabs */}
        <div className="flex rounded-xl bg-[#ebe1d4]/50 p-1 mb-6 border border-[#ebe1d4]">
          <button
            type="button"
            onClick={() => { setTab('register'); setError(null); }}
            className={`flex-1 py-2.5 text-xs font-mono-caps font-semibold rounded-lg transition-all ${
              tab === 'register' ? 'bg-white text-[#1c1b1b] shadow-sm' : 'text-[#5e5e5b] hover:text-[#1c1b1b]'
            }`}
          >
            S'inscrire par Email
          </button>
          <button
            type="button"
            onClick={() => { setTab('login'); setError(null); }}
            className={`flex-1 py-2.5 text-xs font-mono-caps font-semibold rounded-lg transition-all ${
              tab === 'login' ? 'bg-white text-[#1c1b1b] shadow-sm' : 'text-[#5e5e5b] hover:text-[#1c1b1b]'
            }`}
          >
            Se connecter
          </button>
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          {tab === 'register' && (
            <div>
              <label className="font-mono-caps text-xs text-[#5e5e5b] block mb-1 uppercase tracking-wider font-semibold">
                PSEUDO / NOM D'UTILISATEUR
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-sm text-[#5e5e5b] font-mono-caps">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_.]/g, '').toLowerCase())}
                  placeholder="votre_pseudo"
                  maxLength={25}
                  required
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-[#ebe1d4] bg-white font-mono-caps text-sm text-[#1c1b1b] focus:ring-1 focus:ring-[#000000] outline-none shadow-sm"
                />
              </div>
            </div>
          )}

          <div>
            <label className="font-mono-caps text-xs text-[#5e5e5b] block mb-1 uppercase tracking-wider font-semibold">
              ADRESSE EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nom@exemple.com"
              required
              className="w-full px-3 py-2.5 rounded-xl border border-[#ebe1d4] bg-white font-body text-sm text-[#1c1b1b] focus:ring-1 focus:ring-[#000000] outline-none shadow-sm"
            />
          </div>

          <div>
            <label className="font-mono-caps text-xs text-[#5e5e5b] block mb-1 uppercase tracking-wider font-semibold">
              MOT DE PASSE
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full px-3 py-2.5 rounded-xl border border-[#ebe1d4] bg-white font-body text-sm text-[#1c1b1b] focus:ring-1 focus:ring-[#000000] outline-none shadow-sm"
            />
          </div>

          {error && (
            <p className="text-xs text-[#ba1a1a] bg-[#ffdad6] p-2.5 rounded-xl border border-[#ba1a1a]/30">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#000000] text-white font-body font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span>Vérification...</span>
            ) : tab === 'register' ? (
              <span>Créer mon compte par Email</span>
            ) : (
              <span>Se connecter</span>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
