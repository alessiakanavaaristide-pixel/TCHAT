import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserProfile } from '../types';
import { checkUsernameAvailable, saveUserProfile } from '../lib/firebase';

interface OnboardingModalProps {
  uid: string;
  defaultEmail?: string;
  defaultName?: string;
  defaultImage?: string;
  onComplete: (user: UserProfile) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  uid,
  defaultEmail = '',
  defaultName = 'New User',
  defaultImage = '',
  onComplete
}) => {
  const [username, setUsername] = useState(
    (defaultEmail ? defaultEmail.split('@')[0] : `user_${uid.slice(0, 5)}`).replace(/[^a-z0-9_]/gi, '').toLowerCase()
  );
  const [name, setName] = useState(defaultName === 'New User' ? 'Nouvel Utilisateur' : defaultName);
  const [bio, setBio] = useState("Posez-moi vos questions, je vous réponds en toute franchise.");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanUsername = username.toLowerCase().trim();
    if (!cleanUsername || cleanUsername.length < 3 || cleanUsername.length > 20) {
      setErrorMsg("Le nom d'utilisateur doit contenir entre 3 et 20 caractères.");
      return;
    }

    if (!/^[a-zA-Z0-9_.]+$/.test(cleanUsername)) {
      setErrorMsg("Utilisez uniquement des lettres, chiffres, points et tirets du bas (_).");
      return;
    }

    setIsSubmitting(true);
    try {
      const isAvail = await checkUsernameAvailable(cleanUsername, uid);
      if (!isAvail) {
        setErrorMsg(`Le pseudo "@${cleanUsername}" est déjà utilisé par un autre membre. Veuillez en choisir un autre.`);
        setIsSubmitting(false);
        return;
      }

      const newUser: UserProfile = {
        id: uid,
        username: cleanUsername,
        name: name.trim() || 'User',
        email: defaultEmail,
        image: defaultImage,
        bio: bio.trim(),
        theme: 'default',
        createdAt: new Date().toISOString()
      };

      await saveUserProfile(uid, newUser);
      onComplete(newUser);
    } catch (err) {
      console.error('Error completing onboarding:', err);
      setErrorMsg("Une erreur s'est produite lors de la création de votre profil.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#fdf8f8] w-full max-w-md rounded-2xl shadow-2xl p-6 border border-[#ebe1d4]"
      >
        <div className="text-center mb-6">
          <span className="material-symbols-outlined text-3xl text-[#000000] mb-2">edit_note</span>
          <h2 className="font-display font-semibold text-2xl text-[#1c1b1b]">
            Bienvenue sur TCHAT
          </h2>
          <p className="font-body text-xs text-[#5e5e5b] mt-1">
            Choisissez votre nom d'utilisateur unique pour générer votre lien d'envoi anonyme.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-mono-caps text-xs text-[#5e5e5b] block mb-1 uppercase tracking-wider">
              NOM D'UTILISATEUR (3-20 caractères)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-sm text-[#5e5e5b] font-mono-caps">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                maxLength={20}
                required
                placeholder="votre_pseudo"
                className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-[#ebe1d4] bg-white font-mono-caps text-sm text-[#1c1b1b] focus:ring-1 focus:ring-[#000000] outline-none"
              />
            </div>
            <p className="text-[11px] text-[#5e5e5b] mt-1 font-mono-caps">
              Lien public : tchat.app/u/{username || 'pseudo'}
            </p>
          </div>

          <div>
            <label className="font-mono-caps text-xs text-[#5e5e5b] block mb-1 uppercase tracking-wider">
              NOM D'AFFICHAGE
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-xl border border-[#ebe1d4] bg-white font-body text-sm text-[#1c1b1b] focus:ring-1 focus:ring-[#000000] outline-none"
            />
          </div>

          <div>
            <label className="font-mono-caps text-xs text-[#5e5e5b] block mb-1 uppercase tracking-wider">
              BIO
            </label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#ebe1d4] bg-white font-body text-sm text-[#1c1b1b] focus:ring-1 focus:ring-[#000000] outline-none"
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-[#ba1a1a] bg-[#ffdad6] p-2.5 rounded-lg border border-[#ba1a1a]/30">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 bg-[#000000] text-white py-3.5 rounded-xl font-display font-semibold text-base flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-md disabled:opacity-50"
          >
            {isSubmitting ? 'Création...' : 'Créer mon lien TCHAT'}
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
        </form>
      </motion.div>
    </div>
  );
};
