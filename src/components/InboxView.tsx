import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Message, UserProfile } from '../types';
import { 
  markMessageRead, 
  deleteMessage, 
  reportMessage 
} from '../lib/firebase';

interface InboxViewProps {
  user: UserProfile;
  messages: Message[];
  onOpenStoryModal: (msg: Message) => void;
  onNavigate: (route: string) => void;
}

export const InboxView: React.FC<InboxViewProps> = ({
  user,
  messages,
  onOpenStoryModal,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'play' | 'inbox'>('play');
  const [copiedLink, setCopiedLink] = useState(false);

  const publicLink = `${window.location.origin}/u/${user.username}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`✨ Pose-moi n'importe quelle question anonymement 🤫 :\n${publicLink}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleMessageClick = (msg: Message) => {
    if (!msg.isRead) {
      markMessageRead(msg.id);
    }
    onOpenStoryModal(msg);
  };

  const handleDelete = async (e: React.MouseEvent, msgId: string) => {
    e.stopPropagation();
    if (window.confirm("Voulez-vous supprimer ce message ?")) {
      await deleteMessage(msgId);
    }
  };

  const unreadCount = messages.filter(m => !m.isRead).length;

  return (
    <div className="w-full max-w-md mx-auto px-4 pt-20 pb-28 min-h-screen flex flex-col items-center">
      {/* NGL Top Segmented Tab Control */}
      <div className="w-full bg-slate-900/10 p-1 rounded-2xl flex items-center mb-6 border border-slate-200 shadow-inner">
        <button
          onClick={() => setActiveTab('play')}
          className={`flex-1 py-3 rounded-xl font-display font-bold text-sm transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'play'
              ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="material-symbols-outlined text-lg">link</span>
          <span>MON LIEN</span>
        </button>

        <button
          onClick={() => setActiveTab('inbox')}
          className={`flex-1 py-3 rounded-xl font-display font-bold text-sm transition-all flex items-center justify-center gap-1.5 relative ${
            activeTab === 'inbox'
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="material-symbols-outlined text-lg">mail</span>
          <span>INBOX</span>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'play' ? (
        /* TAB 1: PLAY (MON LIEN NGL) */
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full space-y-5"
        >
          {/* User Profile Info Header */}
          <div className="bg-white p-5 rounded-3xl border-2 border-slate-900 shadow-lg text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 text-white font-display font-bold text-2xl flex items-center justify-center mx-auto shadow-md">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-display font-extrabold text-xl text-slate-900">
                @{user.username}
              </h2>
              <p className="font-mono-caps text-xs text-slate-500 uppercase tracking-wider">
                Lien actif & prêt à recevoir des messages
              </p>
            </div>

            {/* Link Field */}
            <div className="bg-slate-100 p-3 rounded-2xl border border-slate-200 flex items-center justify-between gap-2">
              <span className="font-mono-caps text-xs text-slate-700 font-bold truncate">
                {publicLink}
              </span>
              <button
                onClick={handleCopyLink}
                className="bg-slate-900 text-white px-3 py-1.5 rounded-xl font-display font-bold text-xs shrink-0 hover:bg-slate-800 transition-colors"
              >
                {copiedLink ? 'Copié !' : 'Copier'}
              </button>
            </div>
          </div>

          {/* Step 1 & Step 2 Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleCopyLink}
              className="w-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white font-display font-bold text-base py-4 rounded-2xl shadow-lg hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-xl">content_copy</span>
              <span>1. COPIER LE LIEN</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="w-full bg-emerald-500 text-white font-display font-bold text-base py-4 rounded-2xl shadow-md hover:bg-emerald-600 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-xl">share</span>
              <span>2. PARTAGER SUR WHATSAPP / INSTA</span>
            </button>

            <button
              onClick={() => onNavigate(`/u/${user.username}`)}
              className="w-full bg-slate-100 text-slate-800 border border-slate-300 font-display font-bold text-xs py-3 rounded-2xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">visibility</span>
              <span>Aperçu de ce que voient vos amis</span>
            </button>
          </div>

          {/* How to Share on Story Box */}
          <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-lg space-y-3">
            <span className="font-mono-caps text-[10px] text-pink-400 font-bold uppercase tracking-wider block">
              💡 COMMENT PARTAGER SUR VOTRE STORY :
            </span>
            <ol className="space-y-2 text-xs font-body text-slate-300 list-decimal pl-4 leading-relaxed">
              <li>Cliquez sur <strong>Copier le lien</strong> ci-dessus.</li>
              <li>Ouvrez <strong>Instagram</strong> et créez une nouvelle Story.</li>
              <li>Appuyez sur l'icône <strong>Stickers</strong> et choisissez <strong>Lien</strong>.</li>
              <li>Collez votre lien TCHAT et publiez !</li>
            </ol>
          </div>
        </motion.div>
      ) : (
        /* TAB 2: INBOX (NGL ENVELOPE MESSAGES) */
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full space-y-4"
        >
          {messages.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => handleMessageClick(msg)}
                    className={`p-4 rounded-3xl border-2 transition-all cursor-pointer relative flex flex-col items-center text-center justify-between min-h-[140px] shadow-md ${
                      !msg.isRead
                        ? 'bg-gradient-to-br from-red-500 via-pink-500 to-purple-600 border-white text-white font-bold ring-2 ring-pink-400'
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    {!msg.isRead && (
                      <span className="absolute top-2 right-2 bg-yellow-300 text-slate-900 font-mono-caps text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-xs uppercase">
                        NOUVEAU !
                      </span>
                    )}

                    <div className="mt-2 text-3xl">
                      {!msg.isRead ? '💌' : '💬'}
                    </div>

                    <p className={`font-display text-xs line-clamp-2 px-1 my-2 ${!msg.isRead ? 'text-white' : 'text-slate-800'}`}>
                      "{msg.text}"
                    </p>

                    <div className="w-full pt-2 border-t border-white/20 flex items-center justify-between text-[10px] font-mono-caps">
                      <span>RÉPONDRE</span>
                      <button 
                        onClick={(e) => handleDelete(e, msg.id)}
                        className="text-white/70 hover:text-white"
                        title="Supprimer"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white p-8 rounded-3xl border-2 border-slate-200 text-center space-y-3 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-3xl">
                📬
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900">
                Aucun message pour l'instant
              </h3>
              <p className="font-body text-xs text-slate-500 max-w-xs mx-auto">
                Partagez votre lien sur votre story Instagram ou WhatsApp pour recevoir vos premiers messages anonymes !
              </p>
              <button
                onClick={() => setActiveTab('play')}
                className="bg-slate-900 text-white font-display font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-colors inline-block"
              >
                Copier mon lien
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};
