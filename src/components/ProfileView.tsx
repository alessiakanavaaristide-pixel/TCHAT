import React, { useState } from 'react';
import { UserProfile, ColorTheme } from '../types';
import { THEMES } from '../lib/constants';
import { checkUsernameAvailable, saveUserProfile } from '../lib/firebase';
import { InviteStoryModal } from './InviteStoryModal';

interface ProfileViewProps {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onSignOut: () => void;
  onNavigate: (route: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onUpdateUser,
  onSignOut,
  onNavigate
}) => {
  const [username, setUsername] = useState(user.username);
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [theme, setTheme] = useState<ColorTheme>(user.theme || 'default');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const publicUrl = `${window.location.origin}/u/${user.username}`;

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`💬 Pose-moi une question ou dis-moi ce que tu penses de moi 100% anonymement 🤫 :\n${publicUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      alert(`Lien du profil : ${publicUrl}`);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanUsername = username.toLowerCase().trim();
    if (!cleanUsername || cleanUsername.length < 3 || cleanUsername.length > 20) {
      setErrorMsg("Le nom d'utilisateur doit contenir entre 3 et 20 caractères.");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
      setErrorMsg("Seuls les lettres, chiffres et tirets du bas (_) sont autorisés.");
      return;
    }

    setIsSaving(true);
    try {
      const isAvail = await checkUsernameAvailable(cleanUsername, user.id);
      if (!isAvail) {
        setErrorMsg("Ce nom d'utilisateur est déjà pris. Veuillez en choisir un autre.");
        setIsSaving(false);
        return;
      }

      const updatedProfile: UserProfile = {
        ...user,
        username: cleanUsername,
        name: name.trim() || 'User',
        bio: bio.trim(),
        theme
      };

      await saveUserProfile(user.id, updatedProfile);
      onUpdateUser(updatedProfile);
      setSuccessMsg("Profil mis à jour avec succès !");
    } catch (err) {
      console.error('Error saving profile:', err);
      setErrorMsg("Impossible d'enregistrer les modifications.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 pt-20 pb-28">
      {/* Title */}
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-[#1c1b1b]">
          Mon Profil & Paramètres
        </h1>
        <p className="font-body text-sm text-[#5e5e5b] mt-1">
          Gérez votre lien public et la personnalisation de votre espace
        </p>
      </div>

      {/* Public Link Card */}
      <div className="paper-card p-5 rounded-2xl border border-[#ebe1d4] mb-6 bg-white shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono-caps text-xs text-[#5e5e5b] uppercase tracking-wider font-semibold">
            VOTRE LIEN ANONYME PUBLIC
          </span>
          <button
            onClick={() => onNavigate(`/u/${user.username}`)}
            className="text-xs font-mono-caps text-[#000000] hover:underline flex items-center gap-1"
          >
            Voir la page <span className="material-symbols-outlined text-sm">open_in_new</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 rounded-xl border border-[#ebe1d4] bg-[#fdf8f8]">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="material-symbols-outlined text-[#5e5e5b] text-xl shrink-0">link</span>
            <span className="font-mono-caps text-xs sm:text-sm text-[#1c1b1b] truncate font-medium">
              {publicUrl}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#ebe1d4]">
            <button
              onClick={handleCopyLink}
              type="button"
              className="px-3 py-1.5 rounded-lg bg-[#000000] text-white font-mono-caps text-xs hover:opacity-90 transition-opacity flex-1 sm:flex-none flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">
                {copied ? 'check' : 'content_copy'}
              </span>
              {copied ? 'Copié !' : 'Copier'}
            </button>

            <button
              onClick={() => setShowInviteModal(true)}
              type="button"
              className="px-3 py-1.5 rounded-lg bg-[#25D366] text-white font-mono-caps text-xs font-bold hover:bg-[#20bd5a] transition-colors flex-1 sm:flex-none flex items-center justify-center gap-1 shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">photo_camera</span>
              Statut WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave} className="paper-card p-6 rounded-2xl border border-[#ebe1d4] bg-white shadow-sm space-y-6">
        {/* Avatar Monogram */}
        <div>
          <label className="font-mono-caps text-xs text-[#5e5e5b] block mb-2 uppercase tracking-wider font-semibold">
            AVATAR
          </label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#1c1b1b] text-white flex items-center justify-center font-display text-2xl font-bold uppercase shadow-sm border-2 border-[#ebe1d4] shrink-0">
              {(name || username || 'U').charAt(0).toUpperCase()}
            </div>
            <p className="text-xs font-body text-[#5e5e5b] leading-relaxed">
              Votre avatar est automatiquement créé avec les initiales de votre nom d'affichage.
            </p>
          </div>
        </div>

        {/* Username */}
        <div>
          <label className="font-mono-caps text-xs text-[#5e5e5b] block mb-1 uppercase tracking-wider font-semibold">
            NOM D'UTILISATEUR
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
            Lien : {window.location.origin}/u/{username || 'pseudo'}
          </p>
        </div>

        {/* Name */}
        <div>
          <label className="font-mono-caps text-xs text-[#5e5e5b] block mb-1 uppercase tracking-wider font-semibold">
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
          <label className="font-mono-caps text-xs text-[#5e5e5b] block mb-1 uppercase tracking-wider font-semibold">
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

        {/* Theme */}
        <div>
          <label className="font-mono-caps text-xs text-[#5e5e5b] block mb-2 uppercase tracking-wider font-semibold">
            THÈME DE VOTRE PAGE PUBLIQUE
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
          <p className="text-xs text-[#ba1a1a] bg-[#ffdad6] p-3 rounded-xl border border-[#ba1a1a]/30">
            {errorMsg}
          </p>
        )}

        {successMsg && (
          <p className="text-xs text-[#1a2e1a] bg-[#e2ead8] p-3 rounded-xl border border-[#c2d2b3]">
            {successMsg}
          </p>
        )}

        <div className="pt-4 border-t border-[#ebe1d4] flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onSignOut}
            className="px-4 py-2.5 rounded-full border border-[#ba1a1a] text-[#ba1a1a] font-mono-caps text-xs hover:bg-[#ffdad6]/40 transition-colors"
          >
            Se déconnecter
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-full bg-[#000000] text-white font-body font-semibold text-sm hover:opacity-90 transition-opacity active:scale-95 disabled:opacity-50"
          >
            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>

      {/* Invite Story Modal (NGL Status Generator) */}
      {showInviteModal && (
        <InviteStoryModal
          user={user}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </div>
  );
};
