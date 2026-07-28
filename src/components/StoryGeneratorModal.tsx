import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { toPng } from 'html-to-image';
import { Message, UserProfile, ColorTheme } from '../types';
import { THEMES } from '../lib/constants';
import { replyToMessage } from '../lib/firebase';

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
  const [savedSuccess, setSavedSuccess] = useState(false);

  const captureRef = useRef<HTMLDivElement>(null);
  const themeConfig = THEMES[storyTheme] || THEMES.iridescent;
  const userLink = `tchat.app/u/${user.username}`;

  const handleSaveReply = async () => {
    if (replyText.trim()) {
      await replyToMessage(message.id, replyText.trim());
    }
  };

  const handleDownloadImage = async () => {
    if (!captureRef.current) return;
    setIsGenerating(true);
    await handleSaveReply();

    try {
      const dataUrl = await toPng(captureRef.current, { quality: 0.95, cacheBust: true });
      const link = document.createElement('a');
      link.download = `tchat-story-${user.username}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to generate story image:', err);
      alert("Échec de la création de l'image. Veuillez réanalyser ou réessayer.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareStory = async () => {
    await handleDownloadImage();
    navigator.clipboard.writeText(`https://${userLink}`);
    alert("Image de story 3D téléchargée ! Le lien de votre profil TCHAT a été copié dans votre presse-papier.");
  };

  const handleShareWhatsApp = () => {
    handleSaveReply();
    const text = encodeURIComponent(`✨ Message Anonyme TCHAT ✨\n\n❓ "${message.text}"\n\n💬 Ma réponse : ${replyText}\n\n👉 Envoie-moi un message secret ici : https://${userLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleShareTwitter = () => {
    handleSaveReply();
    const text = encodeURIComponent(`✨ Message Anonyme TCHAT ✨\n\n❓ "${message.text}"\n💬 Ma réponse : ${replyText}\n\nhttps://${userLink}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
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

              {/* Top Watermark & 3D Badge */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2 bg-white/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/60 shadow-md">
                  <img 
                    src="/src/assets/images/story_3d_secret_icon_1785200487740.jpg" 
                    alt="3D Badge" 
                    className="w-5 h-5 rounded-full object-cover shadow-xs"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <span className="font-mono-caps text-[9px] font-bold tracking-widest text-[#0f172a] uppercase">
                    UNSAID ANONYME
                  </span>
                </div>

                <div className="bg-black/40 backdrop-blur-md text-white px-2.5 py-0.5 rounded-full text-[9px] font-mono-caps tracking-wider border border-white/20">
                  3D STORY
                </div>
              </div>

              {/* Main Content Area */}
              <div className="relative z-10 my-auto space-y-3.5">
                {/* Received Question Card (3D Floating Glass Box) */}
                <div 
                  style={{ 
                    backgroundColor: themeConfig.cardBg,
                    borderColor: themeConfig.cardBorder 
                  }}
                  className="p-5 rounded-2xl border shadow-xl relative backdrop-blur-md transform transition-all"
                >
                  <div className="absolute -top-3 left-4 bg-gradient-to-r from-[#2563eb] to-[#7c3aed] text-white px-2.5 py-0.5 rounded-full text-[9px] font-mono-caps font-bold tracking-wider shadow-md flex items-center gap-1">
                    <span className="material-symbols-outlined text-[10px]">lock</span>
                    MESSAGE SECRET
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

              {/* 3D Instagram/WhatsApp Sticker at Bottom */}
              <div className="relative z-10 pt-2 flex flex-col items-center text-center">
                <div className="bg-white text-black px-4 py-2 rounded-2xl shadow-xl border-2 border-white/80 flex items-center gap-2 transform -rotate-1 hover:rotate-0 transition-transform">
                  <div className="w-6 h-6 rounded-full bg-[#2563eb] text-white flex items-center justify-center shadow-xs">
                    <span className="material-symbols-outlined text-xs">link</span>
                  </div>
                  <div className="text-left">
                    <p className="font-mono-caps text-[8px] text-[#5e5e5b] tracking-wider uppercase font-bold">
                      POUR ME RÉPONDRE
                    </p>
                    <p className="font-display font-bold text-xs tracking-tight text-[#0f172a]">
                      {userLink}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons Grid */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handleShareStory}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white py-3.5 rounded-2xl font-body font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-95 active:scale-98 transition-all shadow-lg"
            >
              <span className="material-symbols-outlined text-lg text-[#60a5fa]">auto_awesome</span>
              <span>{savedSuccess ? 'Story 3D Enregistrée !' : 'Télécharger l\'Image de Story 3D'}</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleShareWhatsApp}
                className="py-3 px-4 rounded-xl border border-[#cbd5e1] font-body text-xs font-semibold text-[#1c1b1b] bg-white flex items-center justify-center gap-1.5 hover:bg-[#f8fafc] active:scale-95 transition-all shadow-xs"
              >
                <span className="material-symbols-outlined text-base text-[#22c55e]">chat</span>
                <span>WhatsApp</span>
              </button>

              <button
                onClick={handleDownloadImage}
                disabled={isGenerating}
                className="py-3 px-4 rounded-xl border border-[#cbd5e1] font-body text-xs font-semibold text-[#1c1b1b] bg-white flex items-center justify-center gap-1.5 hover:bg-[#f8fafc] active:scale-95 transition-all shadow-xs"
              >
                <span className="material-symbols-outlined text-base text-[#2563eb]">download</span>
                <span>Télécharger</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
