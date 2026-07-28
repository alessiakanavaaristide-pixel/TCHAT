import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserProfile } from '../types';
import { PROMPTS_BANK } from '../lib/constants';
import { checkLocalModeration } from '../lib/moderation';
import { sendAnonymousMessage } from '../lib/firebase';

interface PublicSendViewProps {
  recipient: UserProfile;
  onCreateOwnLink: () => void;
}

export const PublicSendView: React.FC<PublicSendViewProps> = ({
  recipient,
  onCreateOwnLink
}) => {
  const [messageText, setMessageText] = useState("");
  const [promptQuestion, setPromptQuestion] = useState("send me anonymous messages!");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Rate limiting history
  const [sendHistory, setSendHistory] = useState<number[]>([]);

  const handleShufflePrompt = () => {
    let nextPrompt = promptQuestion;
    while (nextPrompt === promptQuestion && PROMPTS_BANK.length > 1) {
      const randomIndex = Math.floor(Math.random() * PROMPTS_BANK.length);
      nextPrompt = PROMPTS_BANK[randomIndex];
    }
    setPromptQuestion(nextPrompt);
    setErrorMessage(null);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const textToSend = messageText.trim();
    if (!textToSend) {
      setErrorMessage("Veuillez écrire un message avant d'envoyer.");
      return;
    }
    
    // Rate limit check
    const now = Date.now();
    const recentSends = sendHistory.filter(timestamp => now - timestamp < 60000);
    if (recentSends.length >= 5) {
      setErrorMessage("Limite d'envoi atteinte (max 5 messages par minute). Patientez un instant.");
      return;
    }

    // Moderation check
    const modResult = checkLocalModeration(textToSend);
    if (!modResult.isAllowed) {
      setErrorMessage(modResult.reason || "Message non autorisé.");
      return;
    }

    setIsSubmitting(true);
    try {
      await sendAnonymousMessage(recipient.id, recipient.username, textToSend, promptQuestion);
      setSendHistory([...recentSends, now]);
      setIsSent(true);
    } catch (err: any) {
      console.error('Failed to send anonymous message:', err);
      setErrorMessage("Échec de l'envoi du message. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSent(false);
    setMessageText("");
    setErrorMessage(null);
  };

  return (
    <div className="w-full min-h-screen pt-16 pb-20 px-4 flex flex-col items-center justify-between bg-slate-900 text-white">
      <div className="w-full max-w-sm flex flex-col items-center my-auto space-y-4">
        
        {/* Profile Avatar Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 p-1 shadow-xl">
            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center font-display font-extrabold text-2xl text-white">
              {(recipient.name || recipient.username || 'U').charAt(0).toUpperCase()}
            </div>
          </div>
          <div>
            <h1 className="font-display font-extrabold text-xl text-white">
              @{recipient.username}
            </h1>
            <p className="font-mono-caps text-xs text-slate-400">
              TCHAT Messages Anonymes
            </p>
          </div>
        </div>

        {!isSent ? (
          <form onSubmit={handleSend} className="w-full space-y-4">
            {/* Iconic NGL Main Question Card */}
            <div className="w-full bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 p-5 rounded-3xl shadow-2xl text-white space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="font-mono-caps text-[10px] bg-black/20 px-2.5 py-1 rounded-full uppercase tracking-widest font-bold">
                  🔒 Message Anonyme
                </span>
                <button
                  type="button"
                  onClick={handleShufflePrompt}
                  className="bg-white/20 hover:bg-white/30 text-white p-1.5 rounded-full transition-colors active:scale-95 flex items-center justify-center"
                  title="Changer de question"
                >
                  <span className="material-symbols-outlined text-lg">casino</span>
                </button>
              </div>

              <h2 className="font-display font-bold text-lg leading-snug">
                "{promptQuestion}"
              </h2>

              <div>
                <label htmlFor="anonymous-input" className="block text-[11px] font-mono-caps font-extrabold tracking-wider text-white/90 mb-1.5 uppercase">
                  💬 Écris ta réponse / ton message ci-dessous :
                </label>
                <textarea
                  id="anonymous-input"
                  value={messageText}
                  onChange={(e) => {
                    setMessageText(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  maxLength={300}
                  placeholder="Tape ton message secret ici..."
                  className="w-full min-h-[120px] bg-black/30 rounded-2xl p-3 font-body text-sm text-white placeholder:text-white/60 resize-none outline-none focus:ring-2 focus:ring-white/80 transition-all border border-white/30 shadow-inner"
                  required
                />
              </div>

              <div className="flex justify-between items-center text-[10px] font-mono-caps text-white/70">
                <span>100% Anonyme</span>
                <span>{messageText.length} / 300</span>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs text-center font-medium">
                {errorMessage}
              </div>
            )}

            {/* Big Send Button */}
            <button
              type="submit"
              disabled={isSubmitting || !messageText.trim()}
              className="w-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white font-display font-extrabold text-lg py-4 rounded-2xl shadow-xl hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span>ENVOI...</span>
                  <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                </>
              ) : (
                <>
                  <span>ENVOYER !</span>
                  <span className="material-symbols-outlined text-xl">send</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* Confirmation State */
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-2xl text-center space-y-4"
          >
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-3xl">
              <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>

            <h2 className="font-display font-bold text-2xl text-white">
              Message Envoyé !
            </h2>
            <p className="font-body text-xs text-slate-300 max-w-xs mx-auto">
              Ton message anonyme a été envoyé à <strong>@{recipient.username}</strong>.
            </p>

            {/* Prompt to create own link */}
            <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 p-4 rounded-2xl text-white space-y-2 text-left">
              <span className="font-mono-caps text-[10px] font-bold uppercase tracking-wider block">
                ✨ À TON TOUR
              </span>
              <p className="font-display font-bold text-sm">
                Tu veux aussi recevoir des questions anonymes ?
              </p>
              <button
                onClick={onCreateOwnLink}
                className="w-full bg-white text-slate-900 font-display font-bold text-xs py-2.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Obtenir mon propre lien TCHAT
              </button>
            </div>

            <button
              onClick={handleReset}
              className="text-slate-400 hover:text-white font-body text-xs underline underline-offset-4 pt-2"
            >
              Envoyer un autre message à @{recipient.username}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

