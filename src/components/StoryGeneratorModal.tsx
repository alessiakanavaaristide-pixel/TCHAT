import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Message, UserProfile, ColorTheme } from '../types';
import { THEMES } from '../lib/constants';
import { replyToMessage } from '../lib/firebase';
import { shareCardToStatus, downloadImageDataUrl } from '../lib/shareUtils';
import { PresetSticker, PlacedSticker } from '../lib/stickers';
import { StickerPicker } from './StickerPicker';
import { StickerOverlay } from './StickerOverlay';

interface StoryGeneratorModalProps {
  message: Message;
  user: UserProfile;
  onClose: () => void;
}

export const StoryGeneratorModal: React.FC<StoryGeneratorModalProps> = ({
  message,
  user,
  onClose
}) => {
  const [replyText, setReplyText] = useState(message.replyText || "J'ai toujours admiré la façon dont tu traverses les moments les plus calmes.");
  const [storyTheme, setStoryTheme] = useState<ColorTheme>('iridescent');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showStatusGuide, setShowStatusGuide] = useState(false);

  const [generatedImageDataUrl, setGeneratedImageDataUrl] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [stickers, setStickers] = useState<PlacedSticker[]>([]);

  const handleAddSticker = (preset: PresetSticker) => {
    const count = stickers.length;
    const positions = [
      { x: 25, y: 15 },
      { x: 75, y: 15 },
      { x: 20, y: 82 },
      { x: 80, y: 82 },
      { x: 50, y: 12 },
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
  const userLink = `${window.location.host}/u/${user.username}`;
  const publicUrl = `${window.location.origin}/u/${user.username}`;

  const handleSaveReply = async () => {
    if (replyText.trim()) {
      await replyToMessage(message.id, replyText.trim());
    }
  };

  const handleGenerateAndExport = async () => {
    if (!captureRef.current) return;
    setIsGenerating(true);
    await handleSaveReply();

    try {
      const result = await shareCardToStatus({
        element: captureRef.current,
        filename: `tchat-reply-${user.username}-${Date.now()}.png`,
        title: 'Ma Réponse TCHAT Anonyme',
        text: `✨ Question : "${message.text}"\n💬 Ma réponse : ${replyText}\n👉 Pose-moi une question :`,
        url: publicUrl,
      });

      setIsGenerating(false);

      if (result.dataUrl) {
        setGeneratedImageDataUrl(result.dataUrl);
        setCopiedLink(true);
      } else {
        alert("La génération de l'image a rencontré un souci. Votre lien a été copié dans le presse-papier !");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      setIsGenerating(false);
      alert("Une erreur est survenue lors de la création de l'image. Veuillez réessayer.");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#fdf8f8] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh]"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#ebe1d4] flex justify-between items-center bg-white sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl text-[#2563eb]">view_in_ar</span>
            <div>
              <h2 className="font-display font-bold text-base text-[#1c1b1b]">
                Générateur de Story 3D
              </h2>
              <p className="font-body text-[11px] text-[#5e5e5b]">Format 9:16 stylisé pour vos réseaux</p>
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
          {/* Editable Reply Field */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="font-mono-caps text-xs text-[#5e5e5b] uppercase tracking-wider">
                VOTRE RÉPONSE PUBLIQUE
              </label>
              <span className="font-mono-caps text-[10px] text-[#20bd5a] font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">auto_delete</span>
                Supprimé de Firestore après réponse
              </span>
            </div>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Rédigez votre réponse..."
              rows={2}
              className="w-full p-3 rounded-2xl border border-[#ebe1d4] bg-white font-quote text-base text-[#1c1b1b] focus:ring-2 focus:ring-[#2563eb] outline-none resize-none shadow-inner"
            />
          </div>

          {/* Theme Selector */}
          <div>
            <label className="font-mono-caps text-xs text-[#5e5e5b] block mb-2 uppercase tracking-wider text-center">
              STYLE & THÈME 3D
            </label>
            <div className="flex justify-center items-center gap-2.5 flex-wrap">
              {(Object.keys(THEMES) as ColorTheme[]).map((tKey) => {
                const isSelected = storyTheme === tKey;
                return (
                  <button
                    key={tKey}
                    onClick={() => setStoryTheme(tKey)}
                    style={{ background: THEMES[tKey].bg || THEMES[tKey].previewColor }}
                    className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm ${
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

          {/* Sticker Picker Customizer */}
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

          {/* Canvas Capture Box (9:16 Aspect) */}
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
              className="w-full max-w-[320px] aspect-[9/16] rounded-3xl p-5 border border-white/40 shadow-2xl flex flex-col justify-between relative overflow-hidden select-none"
            >
              {/* Subtle 3D Ambient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30 pointer-events-none" />

              {/* Dynamic Placed Stickers Overlay */}
              <StickerOverlay
                stickers={stickers}
                onRemoveSticker={handleRemoveSticker}
                onUpdateSticker={handleUpdateSticker}
              />

              {/* Top Watermark & Badge */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2 bg-white/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/60 shadow-md">
                  <img 
                    src="/favicon.png" 
                    alt="TCHAT Badge" 
                    className="w-4 h-4 rounded-full object-contain"
                  />
                  <span className="font-mono-caps text-[9px] font-bold tracking-widest text-[#0f172a] uppercase">
                    TCHAT ANONYME
                  </span>
                </div>

                <div className="bg-black/40 backdrop-blur-md text-white px-2.5 py-0.5 rounded-full text-[9px] font-mono-caps tracking-wider border border-white/20">
                  STORY TCHAT
                </div>
              </div>

              {/* Main Content Area */}
              <div className="relative z-10 my-auto space-y-3.5">
                {/* Received Question Card */}
                <div 
                  style={{ 
                    backgroundColor: themeConfig.cardBg,
                    borderColor: themeConfig.cardBorder 
                  }}
                  className="p-5 rounded-2xl border shadow-xl relative backdrop-blur-md transform transition-all"
                >
                  <div className="absolute -top-3 left-4 bg-gradient-to-r from-[#2563eb] to-[#7c3aed] text-white px-2.5 py-0.5 rounded-full text-[9px] font-mono-caps font-bold tracking-wider shadow-md flex items-center gap-1.5">
                    <span>🔒</span>
                    <span>MESSAGE SECRET</span>
                  </div>

                  <p className="font-display italic text-base sm:text-lg leading-snug pt-1 text-black">
                    "{message.text}"
                  </p>
                </div>

                {/* Recipient's Reply Card */}
                <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-white/80 shadow-lg relative">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="w-5 h-5 rounded-full bg-[#000000] text-white flex items-center justify-center font-bold text-[9px]">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-body text-[10px] font-bold text-[#1c1b1b]">
                      @{user.username}
                    </span>
                  </div>
                  <p className="font-quote text-base leading-relaxed italic text-[#1c1b1b]">
                    {replyText || "..."}
                  </p>
                </div>
              </div>

              {/* Instagram/WhatsApp Sticker at Bottom */}
              <div className="relative z-10 pt-2 flex flex-col items-center text-center">
                <div className="bg-white text-black px-4 py-2 rounded-2xl shadow-xl border-2 border-white/80 flex items-center gap-2 transform -rotate-1 hover:rotate-0 transition-transform">
                  <div className="w-6 h-6 rounded-full bg-[#2563eb] text-white flex items-center justify-center shadow-xs font-bold text-xs">
                    🔗
                  </div>
                  <div className="text-left">
                    <p className="font-mono-caps text-[8px] text-[#5e5e5b] tracking-wider uppercase font-bold">
                      POUR ME RÉPONDRE (LIEN EN LÉGENDE)
                    </p>
                    <p className="font-display font-bold text-xs tracking-tight text-[#0f172a]">
                      {userLink}
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
                <span>Votre image 9:16 HD est prête et votre lien est copié !</span>
              </div>

              {/* Display Generated Photo PNG */}
              <div className="relative group flex flex-col items-center">
                <img
                  src={generatedImageDataUrl}
                  alt="Story TCHAT 9:16"
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
                    Comment partager avec un lien cliquable ?
                  </h4>
                </div>
                <div className="space-y-2.5 text-xs font-body text-slate-300">
                  <p className="text-[11px] leading-relaxed text-slate-300 bg-slate-800 p-2.5 rounded-xl border border-slate-700">
                    ℹ️ Les photos de statut ne sont pas des liens cliquables par nature.
                  </p>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#25D366] text-slate-950 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <p><strong className="text-white">WhatsApp Statut Texte :</strong> Cliquez sur <em>"Partager le lien cliquable sur WhatsApp"</em> ci-dessous pour publier un statut avec le lien direct cliquable !</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#25D366] text-slate-950 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <p><strong className="text-white">Photo / Insta :</strong> Téléchargez la photo et collez le lien secret <span className="text-pink-300 font-mono text-[11px] underline break-all">{publicUrl}</span> en légende !</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    const text = encodeURIComponent(`✨ Question : "${message.text}"\n💬 Ma réponse : ${replyText}\n👉 Pose-moi une question ici :\n${publicUrl}`);
                    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
                  }}
                  className="w-full bg-[#25D366] text-slate-950 py-3.5 rounded-2xl font-display font-extrabold text-xs flex items-center justify-center gap-2 hover:bg-[#20bd5a] active:scale-98 transition-all shadow-md text-center"
                >
                  <span className="material-symbols-outlined text-xl">share</span>
                  <span>📲 PARTAGER LE LIEN CLIQUABLE SUR WHATSAPP</span>
                </button>

                <button
                  onClick={() => downloadImageDataUrl(generatedImageDataUrl, `tchat-reply-${user.username}-${Date.now()}.png`)}
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
                  <span>{copiedLink ? '✓ LIEN COPIÉ DANS LE PRESSE-PAPIER' : 'COPIER LE LIEN SECRET'}</span>
                </button>

                <button
                  onClick={() => setGeneratedImageDataUrl(null)}
                  className="w-full text-slate-500 py-2 font-display font-medium text-xs hover:text-slate-900 transition-colors"
                >
                  Modifier le thème ou la réponse
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleGenerateAndExport}
                  disabled={isGenerating}
                  className="w-full bg-[#25D366] text-white py-3.5 rounded-2xl font-display font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#20bd5a] active:scale-98 transition-all shadow-lg"
                >
                  <span className="material-symbols-outlined text-xl">photo_camera</span>
                  <span>{isGenerating ? 'Génération de l\'image HD...' : 'GÉNÉRER MON IMAGE DE STORY (9:16 HD)'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};
