import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserProfile, ColorTheme } from '../types';
import { THEMES } from '../lib/constants';
import { checkUsernameAvailable, saveUserProfile } from '../lib/firebase';

interface ProfileSettingsModalProps {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onSignOut: () => void;
  onClose: () => void;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  user,
  onUpdateUser,
  onSignOut,
  onClose
}) => {
  const [username, setUsername] = useState(user.username);
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [image, setImage] = useState(user.image);
  const [theme, setTheme] = useState<ColorTheme>(user.theme || 'default');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanUsername = username.toLowerCase().trim();
    if (!cleanUsername || cleanUsername.length < 3 || cleanUsername.length > 20) {
      setErrorMsg("Le nom d'utilisateur doit contenir entre 3 et 20 caractères.");
      return;
    }

    if (!/^[a-zA-Z0-9_.]+$/.test(cleanUsername)) {
      setErrorMsg("Seuls les lettres, chiffres, points et tirets du bas (_) sont autorisés.");
      return;
    }

    setIsSaving(true);
    try {
      const isAvail = await checkUsernameAvailable(cleanUsername, user.id);
      if (!isAvail) {
        setErrorMsg(`Le pseudo "@${cleanUsername}" est déjà pris par un autre utilisateur. Veuillez en choisir un autre.`);
        setIsSaving(false);
        return;
      }

      const updatedProfile: UserProfile = {
        ...user,
        username: cleanUsername,
        name: name.trim() || 'User',
        bio: bio.trim(),
        image,
        theme
      };

      await saveUserProfile(user.id, updatedProfile);
      onUpdateUser(updatedProfile);
      setSuccessMsg("Profil mis à jour avec succès !");
      setTimeout(() => onClose(), 1200);
    } catch (err) {
      console.error('Error saving profile:', err);
      setErrorMsg("Impossible d'enregistrer les modifications.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#fdf8f8] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#ebe1d4] flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xl text-[#000000]">settings</span>
            <h2 className="font-display font-semibold text-lg text-[#1c1b1b]">
              Paramètres du profil
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#5e5e5b] hover:bg-[#ebe7e6] transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-5">
          {/* Avatar Monogram */}
          <div>
            <label className="font-mono-caps text-xs text-[#5e5e5b] block mb-2 uppercase tracking-wider">
              AVATAR DU PROFIL
            </label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#1c1b1b] text-white flex items-center justify-center font-display text-2xl font-bold uppercase shadow-sm border-2 border-[#ebe1d4] shrink-0">
                {(name || username || 'U').charAt(0).toUpperCase()}
              </div>
              <p className="text-xs font-body text-[#5e5e5b] leading-relaxed">
                Votre avatar personnalisé est généré automatiquement avec vos initiales. Aucune image hébergée n'est requise.
              </p>
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="font-mono-caps text-xs text-[#5e5e5b] block mb-1 uppercase tracking-wider">
              NOM D'UTILISATEUR (Lien public)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-sm text-[#5e5e5b] font-mono-caps">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                maxLength={20}
                required
                className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-[#ebe1d4] bg-white font-mono-caps text-sm text-[#1c1b1b] focus:ring-1 focus:ring-[#000000] outline-none"
              />
            </div>
            <p className="text-[11px] text-[#5e5e5b] mt-1 font-mono-caps">
              tchat.app/u/{username || 'pseudo'}
            </p>
          </div>

          {/* Display Name */}
          <div>
            <label className="font-mono-caps text-xs text-[#5e5e5b] block mb-1 uppercase tracking-wider">
              NOM D'AFFICHAGE
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
              required
              className="w-full px-3 py-2.5 rounded-xl border border-[#ebe1d4] bg-white font-body text-sm text-[#1c1b1b] focus:ring-1 focus:ring-[#000000] outline-none"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="font-mono-caps text-xs text-[#5e5e5b] block mb-1 uppercase tracking-wider">
              BIO
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
              maxLength={120}
              className="w-full px-3 py-2 rounded-xl border border-[#ebe1d4] bg-white font-body text-sm text-[#1c1b1b] focus:ring-1 focus:ring-[#000000] outline-none resize-none"
            />
          </div>

          {/* Color Theme Selector */}
          <div>
            <label className="font-mono-caps text-xs text-[#5e5e5b] block mb-2 uppercase tracking-wider">
              THÈME DE LA PAGE PUBLIQUE
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(THEMES) as ColorTheme[]).map((tKey) => {
                const cfg = THEMES[tKey];
                return (
                  <button
                    key={tKey}
                    type="button"
                    onClick={() => setTheme(tKey)}
                    style={{ backgroundColor: cfg.bg }}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between h-20 transition-transform active:scale-95 ${
                      theme === tKey ? 'border-[#000000] ring-2 ring-[#000000]' : 'border-[#ebe1d4]'
                    }`}
                  >
                    <span 
                      style={{ color: cfg.textPrimary }}
                      className="font-display font-semibold text-xs truncate"
                    >
                      {cfg.name}
                    </span>
                    <div 
                      style={{ backgroundColor: cfg.cardBg, borderColor: cfg.cardBorder }} 
                      className="w-full h-4 rounded border"
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-[#ba1a1a] bg-[#ffdad6] p-2.5 rounded-lg border border-[#ba1a1a]/30">
              {errorMsg}
            </p>
          )}

          {successMsg && (
            <p className="text-xs text-[#1a2e1a] bg-[#e2ead8] p-2.5 rounded-lg border border-[#c2d2b3]">
              {successMsg}
            </p>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#ebe1d4] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onSignOut}
              className="px-4 py-2.5 rounded-full border border-[#ba1a1a] text-[#ba1a1a] font-mono-caps text-xs hover:bg-[#ffdad6]/40 transition-colors"
            >
              Déconnexion
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-full bg-[#000000] text-white font-body font-semibold text-sm hover:opacity-90 transition-opacity active:scale-95 disabled:opacity-50"
            >
              {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
