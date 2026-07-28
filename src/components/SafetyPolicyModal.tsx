import React from 'react';
import { motion } from 'motion/react';

interface SafetyPolicyModalProps {
  onClose: () => void;
}

export const SafetyPolicyModal: React.FC<SafetyPolicyModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#fdf8f8] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
      >
        <div className="px-5 py-4 border-b border-[#ebe1d4] flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xl text-[#000000]">shield_lock</span>
            <h2 className="font-display font-semibold text-lg text-[#1c1b1b]">
              Modération & Sécurité
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#5e5e5b] hover:bg-[#ebe7e6] transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 font-body text-sm text-[#5e5e5b] leading-relaxed">
          <div className="p-4 rounded-xl bg-[#e2ead8] text-[#1a2e1a] border border-[#c2d2b3]">
            <h3 className="font-display font-semibold text-base mb-1">
              Engagés pour votre sécurité
            </h3>
            <p className="text-xs">
              TCHAT est conçu pour permettre le partage sincère et bienveillant. Le harcèlement, les menaces ou la haine sont strictly proscrits.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-display font-semibold text-base text-[#1c1b1b]">
              1. Anonymat Garanti & Confidentialité
            </h4>
            <p className="text-xs">
              Aucune donnée permettant d'identifier un expéditeur (adresse IP stockée en clair, cookies de traçage ou comptes tiers) n'est associée aux messages enregistrés. Même les propriétaires du destinataire ne peuvent jamais désanonymiser un expéditeur.
            </p>

            <h4 className="font-display font-semibold text-base text-[#1c1b1b]">
              2. Modération Automatisée Avant Envoi
            </h4>
            <p className="text-xs">
              Chaque message fait l'objet d'un filtrage automatique par mot-clé et analyse sémantique pour bloquer en amont tout contenu haineux, sexuellement explicite, injurieux ou incitant à la violence.
            </p>

            <h4 className="font-display font-semibold text-base text-[#1c1b1b]">
              3. Système de Signalement & Blocage
            </h4>
            <p className="text-xs">
              Si vous recevez un message inapproprié, vous pouvez le signaler directement depuis votre boîte de réception d'un simple clic. Les messages signalés sont examinés et les comportements abusifs répétés entraînent un blocage automatique de l'accès à la plateforme.
            </p>
          </div>

          <div className="pt-4 border-t border-[#ebe1d4] flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-full bg-[#000000] text-white font-mono-caps text-xs hover:opacity-90 transition-opacity"
            >
              J'ai compris
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
