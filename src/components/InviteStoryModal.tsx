import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, ColorTheme } from '../types';
import { THEMES } from '../lib/constants';
import { shareCardToStatus, downloadImageDataUrl } from '../lib/shareUtils';
import { PresetSticker, PlacedSticker } from '../lib/stickers';
import { StickerPicker } from './StickerPicker';
import { StickerOverlay } from './StickerOverlay';

interface InviteStoryModalProps {
  user: UserProfile;
  onClose: () => void;
}

const DEFAULT_PROMPTS = [
  "Pose-moi une question anonyme 🤫",
  "Dis-moi ce que tu penses de moi en toute franchise...",
  "Une critique ou un compliment secret ?",
  "Quel est ton meilleur souvenir avec moi ?",
  "Devine quoi... pose-moi une question !",
  "Donne-moi une note sur 10 avec une raison 🙈"
];

export const InviteStoryModal: React.FC<InviteStoryModalProps> = ({ user, onClose }) => {
  const [selectedPrompt, setSelectedPrompt] = useState(DEFAULT_PROMPTS[0]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [storyTheme, setStoryTheme] = useState<ColorTheme>('iridescent');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showStatusGuide, setShowStatusGuide] = useState(false);
  const [statusResult, setStatusResult] = useState<{ downloaded: boolean; copiedLink: boolean } | null>(null);

  const [generatedImageDataUrl, setGeneratedImageDataUrl] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [stickers, setStickers] = useState<PlacedSticker[]>([]);

  const handleAddSticker = (preset: PresetSticker) => {
    const count = stickers.length;
    const positions = [
      { x: 25, y: 18 },
      { x: 75, y: 18 },
      { x: 20, y: 82 },
      { x: 80, y: 82 },
      { x: 50, y: 14 },
      { x: 50, y: 85 },
    ];
    const pos = positions[count % positions.length];
    const newSticker: PlacedSticker = {
      id: `ps-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      content: preset.content,
      type: preset.type,
      x: pos.x,
      y: pos.y,
      scale: 1,
      rotation: (count % 2 === 0 ? 1 : -1) * (6 + (count * 5) % 18),
      bg: preset.bg,
      textColor: preset.textColor,
    };
    setStickers((prev) => [...prev, newSticker]);
  };

  const handleRemoveSticker = (id: string) => {
    setStickers((prev) => prev.filter((s) => s.id !== id));
  };

  const handleClearAllStickers = () => {
    setStickers([]);
  };

  const handleUpdateSticker = (id: string, updates: Partial<PlacedSticker>) => {
    setStickers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const captureRef = useRef<HTMLDivElement>(null);
  const themeConfig = THEMES[storyTheme] || THEMES.iridescent;
  const publicUrl = `${window.location.origin}/u/${user.username}`;
  const displayPrompt = isCustom ? (customPrompt || "Pose-moi une question...") : selectedPrompt;

  const handleGenerateAndExport = async () => {
    if (!captureRef.current) return;
    setIsProcessing(true);

    try {
      const result = await shareCardToStatus({
        element: captureRef.current,
        filename: `tchat-status-${user.username}-${Date.now()}.png`,
        title: 'Mon Statut TCHAT Anonyme',
        text: `✨ ${displayPrompt}\n👉 Réponds-moi ici 100% anonymement :`,
        url: publicUrl,
      });

      setIsProcessing(false);

      if (result.dataUrl) {
        setGeneratedImageDataUrl(result.dataUrl);
        setCopiedLink(true);
      } else {
        alert("La génération de l'image a rencontré un souci. Votre lien secret a bien été copié !");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      setIsProcessing(false);
      alert("Une erreur est survenue lors de la création de l'image. Veuillez réessayer.");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#fdf8f8] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh]"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#ebe1d4] flex justify-between items-center bg-white sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl text-[#25D366]">photo_camera</span>
            <div>
              <h2 className="font-display font-bold text-base text-[#1c1b1b]">
                Générateur de Story TCHAT
              </h2>
              <p className="font-body text-[11px] text-[#5e5e5b]">Format 9:16 stylisé pour WhatsApp & Insta</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#5e5e5b] hover:bg-[#ebe7e6] transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5">
          {/* Question / Prompt Selector */}
          <div>
            <label className="font-mono-caps text-xs text-[#5e5e5b] block mb-2 uppercase tracking-wider font-semibold">
              1. CHOISISSEZ LA QUESTION
            </label>

            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {DEFAULT_PROMPTS.map((promptText, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setIsCustom(false);
                    setSelectedPrompt(promptText);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs font-body transition-all ${
                    !isCustom && selectedPrompt === promptText
                      ? 'border-[#000000] bg-[#1c1b1b] text-white font-semibold shadow-sm'
                      : 'border-[#ebe1d4] bg-white text-[#1c1b1b] hover:bg-[#f8fafc]'
                  }`}
                >
                  "{promptText}"
                </button>
              ))}
            </div>

            <div className="mt-2.5">
              <button
                onClick={() => setIsCustom(true)}
                className={`text-xs font-mono-caps flex items-center gap-1 ${
                  isCustom ? 'text-[#2563eb] font-bold' : 'text-[#5e5e5b] hover:text-black'
                }`}
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                + Écrire votre propre question
              </button>

              {isCustom && (
                <input
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Ex: Posez-moi une question sur mes projets secrets..."
                  maxLength={90}
                  className="w-full mt-2 p-2.5 rounded-xl border border-[#ebe1d4] bg-white font-body text-xs text-[#1c1b1b] focus:ring-1 focus:ring-black outline-none"
                />
              )}
            </div>
          </div>

          {/* Theme Selector */}
          <div>
            <label className="font-mono-caps text-xs text-[#5e5e5b] block mb-2 uppercase tracking-wider text-center font-semibold">
              2. STYLE & COULEUR DU THÈME
            </label>
            <div className="flex justify-center items-center gap-2 flex-wrap">
              {(Object.keys(THEMES) as ColorTheme[]).map((tKey) => {
                const isSelected = storyTheme === tKey;
                return (
                  <button
                    key={tKey}
                    onClick={() => setStoryTheme(tKey)}
                    style={{ background: THEMES[tKey].bg || THEMES[tKey].previewColor }}
                    className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-xs ${
                      isSelected 
                        ? 'border-black ring-2 ring-black/20 scale-105 font-bold' 
                        : 'border-[#c4c7c7] opacity-80 hover:opacity-100'
                    }`}
                  >
                    <span 
                      className="w-2.5 h-2.5 rounded-full inline-block border border-black/20"
                      style={{ backgroundColor: THEMES[tKey].previewColor }}
                    />
                    <span className="text-black drop-shadow-xs">{THEMES[tKey].name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sticker Library Customizer */}
          <div>
            <label className="font-mono-caps text-xs text-[#5e5e5b] block mb-2 uppercase tracking-wider text-center font-semibold">
              3. AJOUTER DES STICKERS & EMOJIS (OPTIONNEL)
            </label>
            <StickerPicker
              placedStickers={stickers}
              onAddSticker={handleAddSticker}
              onRemoveSticker={handleRemoveSticker}
              onClearAll={handleClearAllStickers}
              onUpdateSticker={handleUpdateSticker}
            />
          </div>

          {/* Live Preview Canvas (9:16 Ratio) */}
          <div className="flex justify-center">
            <div
              ref={captureRef}
              style={{ 
                background: themeConfig.bg,
                backgroundImage: themeConfig.bgImage ? `url(${themeConfig.bgImage})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: themeConfig.textPrimary
              }}
              className="w-full max-w-[300px] aspect-[9/16] rounded-3xl p-5 border border-white/40 shadow-2xl flex flex-col justify-between relative overflow-hidden select-none"
            >
              {/* Subtle Ambient Vignette */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />

              {/* Dynamic Placed Stickers Overlay */}
              <StickerOverlay
                stickers={stickers}
                onRemoveSticker={handleRemoveSticker}
                onUpdateSticker={handleUpdateSticker}
              />

              {/* Header Badge */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/80 shadow-md">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-orange-500 to-pink-500 text-white font-bold text-[8px] flex items-center justify-center">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-mono-caps text-[9px] font-extrabold tracking-wider text-[#0f172a] uppercase">
                    @{user.username}
                  </span>
                </div>

                <div className="bg-black/50 backdrop-blur-md text-white px-2.5 py-0.5 rounded-full text-[8px] font-mono-caps tracking-widest border border-white/20">
                  STATUT TCHAT
                </div>
              </div>

              {/* Center Prompt Box (Stylized TCHAT Question Card) */}
              <div className="relative z-10 my-auto">
                <div 
                  style={{ 
                    backgroundColor: themeConfig.cardBg,
                    borderColor: themeConfig.cardBorder 
                  }}
                  className="p-5 rounded-2xl border shadow-2xl relative backdrop-blur-md text-center transform hover:scale-[1.02] transition-transform"
                >
                  <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white px-3 py-1 rounded-full text-[10px] font-mono-caps font-bold tracking-wider shadow-md mb-3 uppercase">
                    <span>🔒</span>
                    <span>MESSAGE ANONYME</span>
                  </div>

                  <p className="font-display font-bold text-lg sm:text-xl leading-snug text-black drop-shadow-xs">
                    "{displayPrompt}"
                  </p>

                  <p className="font-mono-caps text-[9px] text-slate-600 uppercase tracking-wider mt-3">
                    👇 Répondez en toute sécurité
                  </p>
                </div>
              </div>

              {/* Bottom Sticker Box */}
              <div className="relative z-10 pt-2 flex flex-col items-center text-center">
                <div className="bg-white text-black px-4 py-2 rounded-2xl shadow-xl border-2 border-white/90 flex items-center gap-2 transform -rotate-1 hover:rotate-0 transition-transform">
                  <div className="w-6 h-6 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xs font-bold text-xs">
                    🔗
                  </div>
                  <div className="text-left">
                    <p className="font-mono-caps text-[8px] text-[#5e5e5b] tracking-wider uppercase font-bold">
                      ENVOIE UN MESSAGE ICI (LIEN EN LÉGENDE)
                    </p>
                    <p className="font-display font-extrabold text-xs tracking-tight text-[#0f172a] truncate max-w-[200px]">
                      {window.location.host}/u/{user.username}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Generated Image Preview or Customizer View */}
          {generatedImageDataUrl ? (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center gap-2 text-xs text-emerald-900 font-semibold">
                <span className="material-symbols-outlined text-emerald-600 text-xl">check_circle</span>
                <span>Votre carte 9:16 HD est prête et le lien est copié !</span>
              </div>

              {/* Display Generated Photo PNG */}
              <div className="relative group flex flex-col items-center">
                <img
                  src={generatedImageDataUrl}
                  alt="Carte Statut TCHAT"
                  className="w-full max-w-[260px] aspect-[9/16] rounded-2xl shadow-2xl object-contain mx-auto border border-slate-200 bg-black/5"
                />
                <p className="text-[10px] text-[#5e5e5b] font-mono-caps uppercase mt-2 text-center">
                  💡 Astuce : Téléchargez l'image ou appuyez dessus pour l'enregistrer dans vos photos
                </p>
              </div>

              {/* Instructions & Explanation for Status Links */}
              <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#25D366] text-xl">chat</span>
                  <h4 className="font-display font-bold text-xs uppercase tracking-wider text-white">
                    Pourquoi et comment rendre le lien cliquable ?
                  </h4>
                </div>
                <div className="space-y-2.5 text-xs font-body text-slate-300">
                  <p className="text-[11px] leading-relaxed text-slate-300 bg-slate-800 p-2.5 rounded-xl border border-slate-700">
                    ℹ️ <strong>Remarque :</strong> Sur WhatsApp et Instagram, les photos publiées en statut ne contiennent jamais de liens cliquables directement sur l'image (ce sont des fichiers images PNG). Pour que vos contacts puissent cliquer :
                  </p>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#25D366] text-slate-950 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <p><strong className="text-white">Option WhatsApp Statut Texte (Lien 100% Cliquable) :</strong> Cliquez sur le bouton vert ci-dessous <em>"Partager avec lien cliquable sur WhatsApp"</em>.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#25D366] text-slate-950 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <p><strong className="text-white">Option Photo Statut / Instagram :</strong> Téléchargez l'image, puis collez votre lien secret <span className="text-pink-300 font-mono text-[11px] underline break-all">{publicUrl}</span> en légende ou avec le Sticker Lien !</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    const text = encodeURIComponent(`💬 Pose-moi une question ou dis-moi ce que tu penses de moi 100% anonymement 🤫 :\n${publicUrl}`);
                    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
                  }}
                  className="w-full bg-[#25D366] text-slate-950 py-3.5 rounded-2xl font-display font-extrabold text-xs flex items-center justify-center gap-2 hover:bg-[#20bd5a] active:scale-98 transition-all shadow-md text-center"
                >
                  <span className="material-symbols-outlined text-xl">share</span>
                  <span>📲 PARTAGER LE LIEN CLIQUABLE SUR WHATSAPP</span>
                </button>

                <button
                  onClick={() => downloadImageDataUrl(generatedImageDataUrl, `tchat-status-${user.username}-${Date.now()}.png`)}
                  className="w-full bg-white text-slate-900 border-2 border-slate-900 py-3 rounded-2xl font-display font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">download</span>
                  <span>TÉLÉCHARGER L'IMAGE STORY (PNG HD)</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="w-full bg-slate-800 text-white py-2.5 rounded-xl font-display font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">content_copy</span>
                  <span>{copiedLink ? '✓ LIEN COPIÉ DANS LE PRESSE-PAPIER' : 'COPIER MON LIEN SECRET'}</span>
                </button>

                <button
                  onClick={() => setGeneratedImageDataUrl(null)}
                  className="w-full text-slate-500 py-2 font-display font-medium text-xs hover:text-slate-900 transition-colors"
                >
                  Modifier le style ou la question
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleGenerateAndExport}
                  disabled={isProcessing}
                  className="w-full bg-[#25D366] text-white py-3.5 rounded-2xl font-display font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#20bd5a] active:scale-98 transition-all shadow-lg"
                >
                  <span className="material-symbols-outlined text-xl">photo_camera</span>
                  <span>{isProcessing ? 'Génération de l\'image HD...' : 'GÉNÉRER MON IMAGE STORY (STATUT / INSTA)'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};
