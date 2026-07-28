import React from 'react';

interface NavbarProps {
  unreadCount?: number;
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenSettings?: () => void;
  onOpenSafety?: () => void;
  onOpenAuth?: () => void;
  userHandle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  unreadCount = 0,
  currentRoute,
  onNavigate,
  onOpenSettings,
  onOpenSafety,
  onOpenAuth,
  userHandle
}) => {
  const isPublicPage = currentRoute.startsWith('/u/');
  const isStoryPage = currentRoute.startsWith('/story/');

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#fdf8f8]/90 backdrop-blur-md h-16 border-b border-[#ebe1d4]/60 px-5 flex justify-between items-center max-w-4xl mx-auto left-0 right-0">
      <div className="flex items-center gap-3">
        {isStoryPage || (isPublicPage && currentRoute !== '/') ? (
          <button 
            onClick={() => onNavigate(userHandle ? '/inbox' : '/')}
            className="p-1 rounded-full hover:bg-[#ebe7e6] transition-colors text-[#1c1b1b] flex items-center justify-center"
            title="Retour"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
        ) : (
          <button 
            onClick={() => onNavigate('/')} 
            className="flex items-center gap-2 text-left group"
          >
            <img 
              src="/logo.svg" 
              alt="TCHAT Logo" 
              className="h-7 sm:h-8 w-auto group-hover:scale-105 transition-transform" 
            />
          </button>
        )}

        {currentRoute === '/inbox' && (
          <div className="flex items-center gap-2">
            <span className="bg-[#000000] text-white text-[11px] font-mono-caps px-2 py-0.5 rounded-full font-bold">
              {unreadCount}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {onOpenSafety && (
          <button
            onClick={onOpenSafety}
            className="hidden sm:flex items-center gap-1 text-xs font-mono-caps text-[#5e5e5b] hover:text-[#1c1b1b] px-2 py-1 rounded transition-colors"
            title="Sécurité et règles"
          >
            <span className="material-symbols-outlined text-base">shield_lock</span>
            SÉCURITÉ
          </button>
        )}

        {!userHandle && onOpenAuth && (
          <button
            onClick={onOpenAuth}
            className="px-3.5 py-1.5 rounded-full bg-[#000000] text-white font-mono-caps text-xs font-semibold hover:opacity-90 transition-opacity active:scale-95 shadow-sm"
          >
            Se connecter
          </button>
        )}

        {onOpenSettings && userHandle && (
          <button
            onClick={onOpenSettings}
            className="p-2 text-[#5e5e5b] hover:text-[#1c1b1b] hover:bg-[#ebe7e6] rounded-full transition-colors"
            title="Paramètres"
          >
            <span className="material-symbols-outlined text-xl">settings</span>
          </button>
        )}
      </div>
    </header>
  );
};
